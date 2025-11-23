import Provider from "@/server/lib/provider/Provider.ts";
import type {Port, PortState} from "@t/Port.ts";
import {execFile} from "node:child_process";
import {promisify} from "node:util";
import {platform} from "node:os";
import getDestinationIp from "@/server/lib/provider/util/getDestinationIp.ts";
import idPort from "@/server/lib/provider/util/idPort.ts";

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

export default class WindowsNetstatProvider extends Provider {
	static capable(): Promise<boolean> {
		if (platform() !== "win32") return Promise.resolve(false);
		return pExecFile("where", ["netstat"])
			.then(() => {
				return true;
			})
			.catch((error) => {
				return false;
			});
	}

	async scan(): Promise<Port[]> {
		const {stdout: psResult} = await pExecFile("tasklist", ["/fo", "csv"]);
		const {stdout: nsResultV4} = await pExecFile("netstat", ["-ano", "-p", "tcp"]);
		const {stdout: nsResultV6} = await pExecFile("netstat", ["-ano", "-p", "tcpv6"]);

		const processes: Record<number, string> = Object.fromEntries(
			psResult.split("\n").slice(1).map(csvToPidProc)
		);

		const lines = (nsResultV4 + "\n" + nsResultV6).split("\n").filter(line => line.includes("LISTENING"));

		const ports: Port[] = lines.map(line => {
			const [_proto, local, _remote, state, pidString] = line.trim().split(/\s+/);
			const splitPoint = local.lastIndexOf(":");
			if (splitPoint === -1) return null;
			const localIp = local.slice(0, splitPoint);
			const localPort = Number(local.slice(splitPoint + 1));
			const pid = Number(pidString);
			const id = idPort({ pid, ip: localIp, port: localPort });

			return {
				id,
				pid,
				transportProtocol: "TCP",
				ip: localIp,
				destIp: getDestinationIp(localIp),
				ipVersion: local[0] === "[" ? 6 : 4,
				port: localPort,
				state: state as PortState,
				command: processes[pid] ?? null,
			} as Port;
		}).filter(port => port !== null);
		return ports;
	}
}
