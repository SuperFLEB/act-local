import type {ParsedItem} from "node-netstat";

export type Protocol = "http" | "https" | "ws" | "wss" | "mysql" | null;
export type TransportProtocol = "tcp" | "udp" | "tcp6" | "udp6";
export type Netstat = ParsedItem & { ident: string, ip: string, ipVersion: 4 | 6 };

export type ServiceIdent = string;

export type ServiceUpdate = {
	ident: ServiceIdent;
	port: number;
	pid: number;
	service: Service;
}

export type ServiceUpdatePacket = {
	type: "UPDATE",
} & ServiceUpdate;

export type ServiceDeletePacket = {
	type: "DELETE";
	ident: ServiceIdent;
	port: number;
	pid: number;
};

export type ServicesMetaPacket = {
	type: "META";
	meta: "RESET" | "READY" | "NOOP";
};

export type UpdatePacket = ServiceUpdatePacket | ServiceDeletePacket | ServicesMetaPacket;

export type Service = {
	ident: ServiceIdent;
	port: number;
	transport: TransportProtocol;
	ipVersion: 4 | 6;
	host?: string;
	pid: number;
	protocol?: Protocol;
	contentType?: string;
	secure?: boolean;
	title?: string;
	icon?: string;
	status?: number;
	url?: string;
	httpUrl?: string;
	ip: string;
	netstat?: Netstat;
};
