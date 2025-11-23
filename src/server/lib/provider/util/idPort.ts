export default function idPort(port: { pid: number, ip: string, port: number }): string {
	return `${port.pid}@${port.ip}:${port.port}`;
}
