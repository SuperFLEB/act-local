type Identifiable = { pid: number, ip: string, port: number };

export function getPortId(port: { pid: number, ip: string, port: number }): string {
	return `${port.pid}@${port.ip}:${port.port}`;
}

export default function idPort<T extends Identifiable>(port: T): T & { id: string } {
	return {
		...port,
		id: getPortId(port),
	};
}
