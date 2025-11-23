import type {ScannerEvent} from "@/server/lib/Scanner/ScannerEvent.ts";

export type Listener<T> = (u: ScannerEvent<T>) => void;

export default abstract class Scanner<T> {
	public pollInterval: number = 1000;

	#running: boolean = false;

	protected listeners = new Set<Listener<T>>();

	protected abstract get syntheticEvents(): ScannerEvent<T>[];

	protected send(event: ScannerEvent<T>) {
		for (const listener of this.listeners) listener(event);
	}

	protected nextPoll() {
		this.poll();
		setTimeout(() => {
			if (this.#running) this.nextPoll();
		}, this.pollInterval);
	}

	reset() {
		this.#running = true;
		this.nextPoll();
	}

	start() {
		this.#running = true;
		this.reset();
	}

	pause() {
		this.#running = false;
	}

	stop() {
		this.#running = false;
		this.listeners.clear();
	}

	abstract poll(): void;

	addListener(listener: Listener<T>, options?: { signal?: AbortSignal }) {
		this.listeners.add(listener);
		if (options?.signal) {
			options.signal.addEventListener("abort", () => this.removeListener(listener));
		}
		for (const event of this.syntheticEvents) listener(event);
	}

	removeListener(listener: Listener<T>) {
		this.listeners.delete(listener);
	}

	constructor(pollInterval: number = 1000) {
		this.pollInterval = pollInterval;
	}
}