import httpServer from "./server/http-server.ts";
import wsServer from "./server/websocket-server.ts";

const options = {
	ports: {
		http: Number(process.env.HTTP_PORT ?? process.env.DEFAULT_HTTP_PORT ?? 8880),
		ws: Number(process.env.WS_PORT ?? process.env.DEFAULT_WS_PORT ?? 8881),
	}
};

httpServer(options.ports.http, options);
wsServer(options.ports.ws, options);
