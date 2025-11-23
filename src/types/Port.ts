
export type TransportProtocolName = "TCP" | "UDP";
export type PortState = "LISTENING" | "ESTABLISHED";

export type Port = {
	id: string;
	pid: number;
	transportProtocol: TransportProtocolName | null;
	ipVersion: 4 | 6;
	ip: string;
	destIp: string | null;
	port: number;
	state: PortState;
	command: string | null;
};
