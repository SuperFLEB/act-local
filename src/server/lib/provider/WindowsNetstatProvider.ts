import Provider from "@/server/lib/provider/Provider.ts";
import type {Connection, PortState} from "@t/Connection.ts";
import {execFile} from "node:child_process";
import {promisify} from "node:util";
import {platform} from "node:os";
import getDestinationIp from "@/server/lib/provider/util/getDestinationIp.ts";
import idPort from "@/server/lib/provider/util/idPort.ts";

type Processes = Record<number, string>;

const pExecFile = promisify(execFile);

function csvToPidProc(line: string): [number, string] {
	const fields: [string, string] = ["", ""];
	let part = -1;
	let quoted = false;
	for (let i = 0; i < line.length; i++) {
		if (!quoted && line[i] === "\"") {
			quoted = true;
			part++;
			continue;
		}
		if (line[i] === "\"" && line[i + 1] !== "\"") {
			quoted = false;

			// We only need the first two parts. To parse the whole line, omit this.
			if (part === 1) break;

			continue;
		}
		if (!quoted) continue;

		fields[part] += line[i];
		if (line[i] === "\"" && line[i + 1] === "\"") i++;
	}
	return [Number(fields[1]), fields[0]];
}

function getConnections(processes: Processes, nsResult: string, ipVersion: 4 | 6): Connection[] {
	const lines = nsResult.split("\n").filter(line => line.includes("LISTENING"));
	return lines.map(line => {
		const [_proto, local, _remote, state, pidString] = line.trim().split(/\s+/);

		const splitPoint = local.lastIndexOf(":");
		if (splitPoint === -1) return null;

		const localIp = local.slice(0, splitPoint);
		const localPort = Number(local.slice(splitPoint + 1));
		const pid = Number(pidString);

		return idPort({
			pid,
			transportProtocol: "TCP",
			ip: localIp,
			ipVersion,
			destIp: getDestinationIp(localIp, ipVersion),
			port: localPort,
			state: state as PortState,
			command: processes[pid] ?? null,
		}) as Connection;
	}).filter(port => port !== null);
}

export default class WindowsNetstatProvider extends Provider {
	static capable(): Promise<boolean> {
		if (platform() !== "win32") return Promise.resolve(false);
		return pExecFile("where", ["netstat"])
			.then(() => {
				return true;
			})
			.catch((_) => {
				return false;
			});
	}

	async scan(): Promise<Connection[]> {
		const {stdout: psResult} = await pExecFile("tasklist", ["/fo", "csv"]);
		const {stdout: nsResultV4} = await pExecFile("netstat", ["-ano", "-p", "tcp"]);
		const {stdout: nsResultV6} = await pExecFile("netstat", ["-ano", "-p", "tcpv6"]);

		const processes: Processes = Object.fromEntries(
			psResult.split("\n").slice(1).map(csvToPidProc)
		);

		return [
			...getConnections(processes, nsResultV4, 4),
			...getConnections(processes, nsResultV6, 6),
		];
	}
}
