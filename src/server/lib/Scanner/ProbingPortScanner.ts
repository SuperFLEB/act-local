import type {Port} from "@t/Port.ts";
import type {Service} from "@/types/Service";
import PortScanner from "@/server/lib/Scanner/PortScanner.ts";
import Scanner from "@/server/lib/Scanner/Scanner.ts";
import AllProbe from "@/server/lib/Probe/AllProbe.ts";
import type {ScannerEvent} from "@/server/lib/Scanner/ScannerEvent.ts";

export default class ProbingPortScanner extends Scanner<Service> {
	#ports = new Map<string, Service>();
	#portScanner?: PortScanner;
	#portListenerAbortController: AbortController | null = null;

	static async create(pollInterval: number = 1000, portScanner?: PortScanner): Promise<ProbingPortScanner> {
		const instance = new this(pollInterval);
		instance.#portScanner = portScanner ?? await PortScanner.create(pollInterval);
		return instance;
	}

	protected get syntheticEvents() {
		if (this.#ports.size === 0) return [];
		return [
			{type: "RESET" as const},
			...this.#ports.values().map(p => ({type: "ADD" as const, id: p.id, target: p})),
			{type: "RESET_READY" as const}
		];
	}

	async #onPortUpdate(update: ScannerEvent<Port>) {
		const signal = this.#portListenerAbortController?.signal;
		switch (update.type) {
			case "ADD":
			case "UPDATE":
				const probe = new AllProbe(update.target);
				const result: Service | null = await probe.investigate(signal);
				if (result) {
					this.#ports.set(update.target.id, result);
					this.send({...update, target: result});
				}
				return;
			case "DELETE":
				const toDelete = this.#ports.get(update.target.id);
				if (toDelete) {
					this.#ports.delete(update.target.id);
					this.send({...update, target: toDelete});
				}
				return;
			// @ts-ignore -- Intentional fallthrough
			case "RESET":
				this.#ports.clear();
			case "ERROR":
			case "INFO":
			case "RESET_READY":
				this.send({...update});
				return;
		}
	}

	pause() {
		this.#portScanner?.pause();
		this.#portListenerAbortController?.abort();
		super.pause();
	}

	start() {
		this.#portScanner?.start();
		this.#portListenerAbortController = new AbortController();
		this.#portScanner?.addListener((event: ScannerEvent<Port>) => {
			this.#onPortUpdate(event);
		}, {signal: this.#portListenerAbortController.signal});
		super.start();
	}

	reset() {
		this.#ports.clear();
		this.#portScanner?.reset();
		super.reset();
	}

	stop() {
		this.#portScanner?.stop();
		this.#portListenerAbortController?.abort();
		super.stop();
	}

	poll() {
		this.#portScanner?.poll();
	}

	private constructor(pollInterval: number) {
		super(pollInterval);
	}
}