import {type WebSocket, WebSocketServer} from "ws";
import type {ServerInfo} from "@t/ServerInfo";
import ProbingPortScanner from "@/server/lib/Scanner/ProbingPortScanner";
import type { Service } from "@/types/Service";
import type {ScannerEvent} from "@/server/lib/Scanner/ScannerEvent";

type WebSocketWithId = WebSocket & { id: string };

export default function serveWs(port: number, _: ServerInfo) {
	ProbingPortScanner.create(1000).then((scanner) => {
		console.log("Scanner initialized");

		const wss = new WebSocketServer({port, host: "::"}, () => {
			console.log(`WebSocket server ready on port ${port}`);
			scanner.start();
			console.log("Scanner started");
		});

		wss.on("connection", (ws: WebSocketWithId) => {
			ws.id = process.hrtime.bigint().toString(36) + "-" + Math.random().toString(36).substr(2);
			console.log("[websocket/server]", "Connect", ws.id);

			const abortController = new AbortController();
			const listener = (event: ScannerEvent<Service>) => {
				const message = JSON.stringify(event);
				if ("target" in event) console.log(event.type, event.target.destIp, event.target.port, event.target.pid);
				ws.send(message);
			};
			scanner.addListener(listener, { signal: abortController.signal });
			ws.on("error", err => console.error(err));
			ws.on("close", () => {
				abortController.abort();
				console.log("[websocket/server]", "Disconnect", ws.id);
			});

			ws.on("ping", () => console.log("Ping? Pong!"));
		});
	});
}
