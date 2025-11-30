import type {ParsedResponse} from "@/server/lib/Probe/util/http.ts";
import type {PortPreferences} from "@/config.ts";

export type TransportProtocolName = "TCP" | "UDP";
export type PortState = "LISTENING" | "ESTABLISHED";

export type Connection = {
	id: string;
	pid: number;
	transportProtocol: TransportProtocolName | null;
	ipVersion: 4 | 6;
	ip: string;
	destIp: string;
	port: number;
	state: PortState;
	command: string | null;
};

export type Service = Connection & ParsedResponse & {
	probed: true,
	applicationProtocol: string | null;
	secure: boolean;
	httpStatus: number | null;
	success: boolean;
};

export type UnifiedService = {
	id: string;
	pid: number;
	command: string | null;
	port: number;
	v4?: Service;
	v6?: Service;
} & ({ v4: Service } | { v6: Service });

export type Definitive = {
	unifiedService: UnifiedService;
	service: Service;
	hostname: string;
};
