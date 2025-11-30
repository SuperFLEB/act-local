import {WebSocketServer} from "ws";
import type {ServerInfo} from "@t/ServerInfo";
import ProbingConnectionScanner from "@/server/lib/Scanner/ProbingConnectionScanner.ts";
import type {ScannerEvent} from "@/server/lib/Scanner/ScannerEvent";
import type {Service} from "@t/Connection.ts";

export default function serveWs(port: number, _: ServerInfo) {
	ProbingConnectionScanner.create(1000).then((scanner) => {
		console.log("Scanner initialized");

		const wss = new WebSocketServer({port, host: "::"}, () => {
			console.log(`WebSocket server ready on port ${port}`);
			scanner.start();
			console.log("Scanner started");
		});

		wss.on("connection", (ws, req) => {
			const connectionId = req.socket.remoteAddress + ":" + req.socket.remotePort + "@" + process.hrtime.bigint().toString(36) + "+" + Math.random().toString(36).slice(2);
			console.log("[websocket/server]", "Connect", connectionId);

			const abortController = new AbortController();
			const listener = (event: ScannerEvent<Service>) => {
				const message = JSON.stringify(event);
				ws.send(message);
			};
			scanner.addListener(listener, {signal: abortController.signal});
			ws.on("error", err => console.error(err));
			ws.on("close", () => {
				abortController.abort();
				console.log("[websocket/server]", "Disconnect", connectionId);
			});

			ws.on("ping", () => console.log("Ping? Pong!"));
		});
	});
}
