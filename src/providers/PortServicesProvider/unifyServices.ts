import type {UnifiedService, Service} from "@t/Connection.ts";
import type {Config} from "@/config.ts";

function getOrCreate(map: Map<number, UnifiedService[]>, key: number): UnifiedService[] {
	if (map.has(key)) return map.get(key)!;
	const newArray: UnifiedService[] = [];
	map.set(key, newArray);
	return newArray;
}

export default function unifyServices(services: Service[], config: Config): UnifiedService[] {
	const portsByNumber = new Map<number, UnifiedService[]>;

	for (const service of services) {
		const portsWithNumber = getOrCreate(portsByNumber, service.port);

		if (config.prefer.split) {
			portsWithNumber.push({
				id: service.id,
				pid: service.pid,
				command: service.command,
				port: service.port,
				[service.ipVersion === 4 ? "v4" : "v6"]: service,
			} as UnifiedService);
			continue;
		}

		let matchingPort: UnifiedService | undefined = portsWithNumber.find(p => p.pid === service.pid);
		if (!matchingPort) {
			portsWithNumber.push(matchingPort = {
				id: "",
				pid: service.pid,
				command: service.command,
				port: service.port,
			} as UnifiedService);
		}
		const v = "v" + service.ipVersion as "v4" | "v6";
		matchingPort[v] = service;
		matchingPort.id = matchingPort.id ? [matchingPort.id, service.id].join("+") : service.id;
	}
	return [...portsByNumber.values()].flat(1);
}
