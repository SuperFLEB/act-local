export default function getDestinationIp(ip: string) {
	if (ip === "[::]") return "[::1]";
	if (ip === "0.0.0.0") return "127.0.0.1";
	if (ip === "*") return "127.0.0.1";
	return ip;
}
