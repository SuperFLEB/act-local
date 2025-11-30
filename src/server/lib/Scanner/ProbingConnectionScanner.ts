import type {Connection, Service} from "@t/Connection.ts";
import ConnectionScanner from "@/server/lib/Scanner/ConnectionScanner.ts";
import Scanner from "@/server/lib/Scanner/Scanner.ts";
import AllProbe from "@/server/lib/Probe/AllProbe.ts";
import type {ScannerEvent} from "@/server/lib/Scanner/ScannerEvent.ts";

export default class ProbingConnectionScanner extends Scanner<Service> {
	#connections = new Map<string, Service>();
	#connectionScanner?: ConnectionScanner;
	#connectionListenerAbortController: AbortController | null = null;

	static async create(pollInterval: number = 1000, portScanner?: ConnectionScanner): Promise<ProbingConnectionScanner> {
		const instance = new this(pollInterval);
		instance.#connectionScanner = portScanner ?? await ConnectionScanner.create(pollInterval);
		return instance;
	}

	protected get syntheticEvents() {
		if (this.#connections.size === 0) return [];
		return [
			{type: "RESET" as const},
			...this.#connections.values().map(p => ({type: "ADD" as const, id: p.id, target: p})),
			{type: "RESET_READY" as const}
		];
	}

	async #onPortUpdate(update: ScannerEvent<Connection>) {
		const signal = this.#connectionListenerAbortController?.signal;
		switch (update.type) {
			case "ADD":
			case "UPDATE":
				const probe = new AllProbe(update.target);
				const result: Service | null = await probe.investigate(signal);
				if (result) {
					this.#connections.set(update.target.id, result);
					this.send({...update, target: result});
				}
				return;
			case "DELETE":
				const toDelete = this.#connections.get(update.target.id);
				if (toDelete) {
					this.#connections.delete(update.target.id);
					this.send({...update, target: toDelete});
				}
				return;
			// @ts-ignore -- Intentional fallthrough
			case "RESET":
				this.#connections.clear();
			case "ERROR":
			case "INFO":
			case "RESET_READY":
				this.send({...update});
				return;
		}
	}

	pause() {
		this.#connectionScanner?.pause();
		this.#connectionListenerAbortController?.abort();
		super.pause();
	}

	start() {
		this.#connectionScanner?.start();
		this.#connectionListenerAbortController = new AbortController();
		this.#connectionScanner?.addListener((event: ScannerEvent<Connection>) => {
			this.#onPortUpdate(event);
		}, {signal: this.#connectionListenerAbortController.signal});
		super.start();
	}

	reset() {
		this.#connections.clear();
		this.#connectionScanner?.reset();
		super.reset();
	}

	stop() {
		this.#connectionScanner?.stop();
		this.#connectionListenerAbortController?.abort();
		super.stop();
	}

	poll() {
		this.#connectionScanner?.poll();
	}

	private constructor(pollInterval: number) {
		super(pollInterval);
	}
}