import {WebSocketServer, type WebSocket} from "ws";
import portScan from "./lib/portScan.ts";
import type {ServerInfo} from "@t/ServerInfo.ts";

type WebSocketWithId = WebSocket & { id: string };

export default function serveWs(port: number, _: ServerInfo) {
	const wss = new WebSocketServer({port, host: "::"}, () => {
		console.log(`WebSocket server ready on port ${port}`);
	});
	wss.on("connection", (ws: WebSocketWithId) => {
		ws.id = process.hrtime.bigint().toString(36) + "-" + Math.random().toString(36).substr(2);
		console.log("[websocket/server]", "Connect", ws.id);
		const controller = new AbortController();

		portScan((packet) => {
			const message = JSON.stringify(packet);
			ws.send(message);
		}, controller.signal);

		ws.on("error", err => console.error(err));
		ws.on("close", () => {
			controller.abort();
			console.log("[websocket/server]", "Disconnect", ws.id);
		});
		ws.on("ping", () => console.log("Ping? Pong!"));
	});
}
