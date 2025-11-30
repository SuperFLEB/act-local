import httpServer from "./server/http-server.ts";
import wsServer from "./server/websocket-server.ts";
import open from "open";

const httpPort = Number(process.env.ACT_LOCAL_HTTP_PORT ?? process.env.DEFAULT_ACT_LOCAL_HTTP_PORT ?? 8880);
const wsPort = Number(process.env.ACT_LOCAL_WS_PORT ?? process.env.DEFAULT_ACT_LOCAL_WS_PORT ?? httpPort + 1);

const options = {
	ports: {
		http: httpPort,
		ws: wsPort,
	}
};

httpServer(options.ports.http, options);
wsServer(options.ports.ws, options);

if (process.argv.includes("start")) open('http://localhost:' + httpPort + '/');
