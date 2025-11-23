import type {Ref} from "vue";
import type { Service } from "@/types/Service";

export default class PortsWebSocketClient {
	#host: string;
	#port: number;
	#secure: boolean;
	#closed: boolean = true;

	#webSocket?: WebSocket;

	ref: Ref<Map<string, Service>>;

	#message(message: string) {
		const { type, id, target } = JSON.parse(message) as { id: string, type: string, target?: Service };
		const ports = this.ref.value;

		switch (type) {
			case "ADD":
			case "UPDATE":
				ports.set(id, target!);
				return;
			case "DELETE":
				ports.delete(id);
				return;
			case "RESET":
				ports.clear();
				return;
			default:
				console.log("Unhandled message: ", message);
		}
	}

	#error(event: Event) {
		console.error("WebSocket error: ", event,);
	}

	#closeEvent(_: CloseEvent) {
		if (this.#closed) return;
		console.warn("WebSocket closed unexpectedly. Reviving...");
		this.#webSocket?.close();
		this.connect();
	}

	connect() {
		this.#webSocket = new WebSocket(this.#secure ? "wss" : "ws" + "://" + this.#host + ":" + this.#port);

		this.#closed = false;
		this.#webSocket.onmessage = (event) => {
			this.#message(event.data.toString());
		};
		this.#webSocket.onerror = (event) => {
			this.#error(event);
		};
		this.#webSocket.onclose = (event) => {
			this.#closeEvent(event);
		};
	}

	disconnect() {
		this.#closed = true;
		this.#webSocket?.close();
		this.#webSocket = undefined;
		this.ref.value.clear();
	}

	constructor(host: string, port: number, secure: boolean = false, ref: Ref<Map<string, Service>>) {
		this.#host = host;
		this.#port = port;
		this.#secure = secure;
		this.ref = ref;
	}
}
