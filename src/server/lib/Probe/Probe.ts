import type {Connection, Service} from "@t/Connection.ts";

export default abstract class Probe {
	protected abortController: AbortController;

	abort() {
		this.abortController.abort();
	}

	abstract investigate(abortSignal?: AbortSignal): Promise<Service | null>;

	constructor(port: Connection) {
		this.abortController = new AbortController();
	}
}
