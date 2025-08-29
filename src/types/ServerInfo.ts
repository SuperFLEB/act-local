export type ServerInfo = {
	ports: {
		http: number;
		ws: number;
		https?: number;
		wss?: number;
	}
};
