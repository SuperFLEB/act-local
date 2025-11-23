import Provider from "@/server/lib/provider/Provider.ts";
import {type Port} from "@t/Port.ts";
import {execFile} from "node:child_process";
import {promisify} from "node:util";
import {platform} from "node:os";
import getDestinationIp from "@/server/lib/provider/util/getDestinationIp.ts";

const pExecFile = promisify(execFile);

function parseLsof(lsofOutput: string, assumeProtocol: 'TCP' | 'UDP' = 'TCP'): Port[] {
	const lines = lsofOutput.split("\n").filter(line => line.trim().length > 0);
	type Fd = {
		id: string;
		transportProtocol?: string;
		ipVersion?: 4 | 6 | null;
		state?: string;
		ip?: string;
		port?: number;
		destIp?: string;
	}

	type Process = {
		pid: number;
		command?: string;
		fd: Fd[];
	}

	const processes: Process[] = [];
	let process: Process | null = null;
	let fd: Fd | null = null;

	for (const line of lines) {
		if ("fc".includes(line[0]) && !process) {
			throw new Error(`Unexpected process field "${line[0]}" encountered without an existing process in lsof output`);
		}

		if ("ntTP".includes(line[0]) && !fd) {
			throw new Error(`Unexpected file descriptor field "${line[0]}" encountered without an existing file descriptor in lsof output`);
		}

		switch (line[0]) {
			case "p":
				if (process) processes.push(process);
				process = {
					pid: parseInt(line.slice(1)),
					fd: [],
				};
				continue;
			case "c":
				process!.command = line.slice(1);
				continue;
			case "f":
				if (fd) process!.fd.push(fd);
				fd = {
					id: line.slice(1),
					transportProtocol: assumeProtocol,
				};
				continue;
			case "P":
				fd!.transportProtocol = line.slice(1);
				continue;
			case "t":
				const ipVersion = line.match(/^tIPv(\d)$/)?.[1];
				fd!.ipVersion = ipVersion ? parseInt(ipVersion) as 4 | 6 : null;
				continue;
			case "n":
				fd!.ip = line.slice(1, line.indexOf(":"));
				fd!.port = parseInt(line.slice(line.indexOf(":") + 1));
		}

		if (line[0] !== "T") continue;
		const prefix = line.slice(0, 4);
		switch (prefix) {
			case "TST=":
				fd!.state = line.slice(4);
				continue;
		}
	}

	// Flatten process list to a list of FDs/ports
	return processes.flatMap(process => {
		const {fd: fds, ...partialPort} = process;
		return fds.map((fd) => ({
			...partialPort as Port,
			...fd,
			destIp: getDestinationIp(fd.ip!, fd.ipVersion!),
		}));
	}) as Port[];
}

export default class LsofProvider extends Provider {
	static capable(): Promise<boolean> {
		if (platform() === "win32") return Promise.resolve(false);
		return new Promise(resolve => execFile("which", ["lsof"], (error) => {
			resolve(!error);
		}));
	}

	async scan(): Promise<Port[]> {
		// lsof -Pn -i tcp -a -i6 -i4 -sTCP:LISTEN -F cntT
		const lsof = await pExecFile("lsof", ["-Pn", "-i", "tcp", "-a", "-i6", "-i4", "-sTCP:LISTEN", "-F", "cntT"]);
		const parsed = parseLsof(lsof.stdout);
		console.log(parsed);
		return parsed;
	}
}
