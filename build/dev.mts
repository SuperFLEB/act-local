import concurrently from "concurrently";
import {createServer} from "node:net";

function tryServer(port: number): Promise<boolean> {
	return new Promise(resolve => {
		const s = createServer()
			.once("listening", () => {
				s.close();
				resolve(true);
			}).
			once("error", () => {
				s.close();
				resolve(false);
			})
			.listen(port++);
	});
}

async function getNextAvailablePort(start: number = 8111): number {
	let port = start;
	while (port < start + 20) {
		if (await tryServer(port)) return port;
	}
}

const start = Number(process.env.API_PORT ?? 8111);
const webPort = await getNextAvailablePort(start);
const wsPort = await getNextAvailablePort(webPort + 1);

console.log("API server will run on ports: ", webPort, wsPort);

concurrently([
	{ command: "vite --force", name: "Vue", env: { VITE_API_SERVER_PORT: webPort.toString() } },
	{ command: "tsx --tsconfig tsconfig.server.json --watch ./src/server.ts", name: "API", env: { ACT_LOCAL_HTTP_PORT: webPort.toString(), ACT_LOCAL_WS_PORT: wsPort.toString() }}
]);

