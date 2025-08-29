import netstat from "node-netstat";
import {clearInterval} from "node:timers";
import type {Netstat, Service, ServiceIdent, TransportProtocol, UpdatePacket} from "@t/ServicesTypes.ts";
import probe from "./probe.ts";

const POLL_INTERVAL = 1000;
type PacketListener = (packet: UpdatePacket) => void;

let isReady = false;

function getNetstat(): Promise<Netstat[]> {
	return new Promise((resolve) => {
		const lines: Netstat[] = [];
		netstat({
			done: () => {
				resolve(lines);
			},
		}, (line: netstat.ParsedItem) => {
			if (!line.protocol.startsWith("tcp")) return;
			if (!line.state.startsWith("LISTEN")) return;
			if (isNaN(line.local.port!)) return;
			const ipVersion = line.protocol.endsWith("6") ? 6 : 4;
			const actualAddress = line.local.address ?? ipVersion === 6 ? "[::]" : "0.0.0.0";
			const ip = {
				"[::]": "[::1]",
				"0.0.0.0": "127.0.0.1",
			}[actualAddress] ?? actualAddress;
			lines.push({
				...line,
				ident: `${line.protocol}://${actualAddress}:${line.local.port}`,
				ipVersion,
				ip,
			});
		});
	});
}


let interval: ReturnType<typeof setInterval> | undefined;
const services = new Map<ServiceIdent, Service>();
const listeners = new Set<PacketListener>();

function broadcast(packet: UpdatePacket) {
	listeners.forEach(listener => listener(packet));
}

const query = async (): Promise<Service[]> => {
	const stats = await getNetstat();
	return stats
		.map(stat => ({
			ident: stat.ident,
			ip: stat.ip,
			port: stat.local.port!,
			pid: stat.pid,
			protocol: null,
			ipVersion: stat.ipVersion,
			transport: stat.protocol as TransportProtocol,
			netstat: stat
		}));
};

function complete(service: Service) {
	const existing = services.get(service.ident);
	if (service.pid !== existing?.pid) return;
	if (service.protocol) {
		service.url = `${service.protocol}://${service.host ?? service.ip}:${service.port}/`;
		service.httpUrl = `http${service.secure ? "s" : ""}://${service.host ?? service.ip}:${service.port}/`;
	}
	services.set(service.ident, service);
}

async function poll() {
	const currentServices = await query();
	const currentPorts = new Set(currentServices.map(stat => stat.ident));
	const deletedServices = Array.from(services.values()).filter(service => !currentPorts.has(service.ident));

	for (const service of deletedServices) {
		console.log("-DEL", service.ident);
		services.delete(service.ident);
		broadcast({type: "DELETE", port: service.port, ident: service.ident, pid: service.pid});
	}

	const newServices = currentServices.filter(service => service.pid !== services.get(service.ident)?.pid);
	for (const service of currentServices) {
		if (service.pid === services.get(service.ident)?.pid) continue;
		services.set(service.ident, service);
		broadcast({type: "UPDATE", ident: service.ident, port: service.port, pid: service.pid, service});
	}

	if (newServices.length === 0) return;

	const promises = newServices.map(service => {
		return Promise.race([
			new Promise((res) => setTimeout(res, 3000)),
			probe(service)
				.then((fullService) => {
					if (!fullService) return;
					complete(fullService);
					broadcast({
						type: "UPDATE",
						ident: service.ident,
						port: fullService.port,
						pid: fullService.pid,
						service: fullService
					});
				})
		]);
	});

	Promise.all(promises).then(() => {
		if (newServices.length === 0 || isReady) return;
		isReady = true;
		broadcast({type: "META", meta: "READY"});
	});
}

export async function get(): Promise<Service[]> {
	const updated = await query();
	for (const service of updated) {
		const fullService = await probe(service);
		if (!fullService) continue;
		complete(fullService);
	}
	return [...services.values()];
}

export default function listen(callback: PacketListener, signal: AbortSignal) {
	if (interval === undefined) interval = setInterval(poll, POLL_INTERVAL);
	signal.addEventListener("abort", () => {
		listeners.delete(callback);
		if (listeners.size === 0) {
			clearInterval(interval);
			interval = undefined;
		}
	});
	callback({type: "META", meta: "RESET"});
	services.forEach((service) => {
		callback({type: "UPDATE", ident: service.ident, port: service.port, pid: service.pid, service});
	});
	if (isReady) callback({type: "META", meta: "READY"});
	listeners.add(callback);
}
