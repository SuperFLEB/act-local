import Provider from "@/server/lib/provider/Provider.ts";
import {type Port} from "@t/Port.ts";
import {execFile} from "node:child_process";
import {promisify} from "node:util";
import {platform} from "node:os";
import getDestinationIp from "@/server/lib/provider/util/getDestinationIp.ts";
import idPort from "@/server/lib/provider/util/idPort.ts";

const pExecFile = promisify(execFile);

function parsePortEntries(lines: string[]): Port {
	const prefixes: Record<string, keyof Port> = {
		p: "pid",
		P: "transportProtocol",
		c: "command",
		t: "ipVersion",
		'TST=': "state"
	} as const;

	const port = lines.reduce((carry, current) => {
		if (current[0] === "n") {
			const ipMatch = current.slice(1).match(/(.+):(\d+)/);
			const ip = ipMatch && ipMatch[1] !== "*" ? ipMatch[1] : null;
			const portNumber = ipMatch ? parseInt(ipMatch[2]) : null;
			if (!(ip && portNumber)) return carry;
			return {...carry,
				ip,
				port: portNumber,
				destIp: getDestinationIp(ip),
			};
		}

		if (current[0] === "t") {
			if (!current.startsWith("tIPv")) return carry;
			return {...carry, version: current[4] === "6" ? 6 : 4};
		}

		if (current[0] in prefixes) return {...carry, [prefixes[current[0] as keyof typeof prefixes]]: current.slice(1) };
		if (current === "TST=LISTEN") return {...carry, state: "LISTENING" };
		if (current.slice(0, 3) in prefixes) return {...carry, [prefixes[current.slice(0, 3) as keyof typeof prefixes]]: current.slice(3) };
		return carry;
	}, {}) as Port;
	port.id = idPort(port);
	return port;
}

export default class LsofProvider extends Provider {
	static capable(): Promise<boolean> {
		if (platform() === "win32") return Promise.resolve(false);
		return new Promise(resolve => execFile("which", ["lsof"], (error) => {
			resolve(!error);
		}));
	}

	async scan(): Promise<Port[]> {
		const { stdout: lsofResult } = await pExecFile("lsof", ["-Pni", "tcp", "-sTCP:LISTEN", "-F", "cntT"]);
		const results: string[][] = [];
		let current: string[] = [];
		for (const line of lsofResult.split("\n")) {
			if (line[0] === "p") {
				results.push(current);
				current = [];
			}
			current.push(line);
		}
		return results.map(parsePortEntries);
	}
}
