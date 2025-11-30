import Scanner from "@/server/lib/Scanner/Scanner";
import type {Connection} from "@t/Connection.ts";
import getProvider from "@/server/lib/provider/getProvider";
import Provider from "@/server/lib/provider/Provider";
import type {ScannerEvent} from "@/server/lib/Scanner/ScannerEvent.ts";

function unchanged(a: Connection, b: Connection): boolean {
	for (const key of ["state"]) {
		if (a[key as keyof Connection] !== b[key as keyof Connection]) return false;
	}
	return true;
}

function setDifference<T>(a: Set<T>, b: Set<T>): Set<T> {
	if ("difference" in Set.prototype) {
		return a.difference(b);
	}
	const diff = new Set(a);
	for (const elem of b) diff.delete(elem);
	return diff;
}

function generateUpdates(oldPorts: Map<string, Connection>, newPorts: Connection[]) {
	const oldIds = new Set(oldPorts.keys());
	const newIds = new Set(newPorts.map(p => p.id));
	const updates: ScannerEvent<Connection>[] = [];

	for (const id of setDifference(oldIds, newIds)) {
		updates.push({ type: "DELETE", id, target: oldPorts.get(id)! });
	}

	for (const port of newPorts) {
		const oldPort = oldPorts.get(port.id);
		if (oldPort && unchanged(port, oldPort)) continue;
		updates.push({type: oldPort ? "UPDATE" : "ADD", id: port.id, target: port});
	}
	return updates;
}

export default class ConnectionScanner extends Scanner<Connection> {
	#provider: Provider;
	#pollPromise: Promise<Connection[]> | null = null;
	#ports = new Map<string, Connection>();
	#inReset: boolean = false;

	static async create(pollInterval: number = 1000, provider?: Provider | null): Promise<ConnectionScanner> {
		provider = provider ?? await getProvider();
		if (provider === null) throw new Error("No port scanning providers are compatible with this system");
		return new this(pollInterval, provider);
	}

	protected get syntheticEvents() {
		if (this.#ports.size === 0) return [];
		return [
			{ type: "RESET" as const },
			...this.#ports.values().map(p => ({ type: "ADD" as const, id: p.id, target: p })),
			{ type: "RESET_READY" as const }
		];
	}

	reset() {
		this.#inReset = true;
		this.#ports.clear();
		this.#pollPromise = null;
		this.send({ type: "RESET" });
		super.reset();
	}

	stop() {
		this.#inReset = false;
		this.#ports.clear();
		this.#pollPromise = null;
		super.stop();
	}

	poll() {
		if (this.#pollPromise) return;
		this.#pollPromise = this.#provider.scan();
		this.#pollPromise.then(ports => {
			// Check if the scan was cancelled before it finished.
			if (!this.#pollPromise) return;

			const updates = generateUpdates(this.#ports, ports);

			for (const update of updates) {
				switch (update.type) {
					case "ADD":
					case "UPDATE":
						this.#ports.set(update.id, update.target);
						break;
					case "DELETE":
						this.#ports.delete(update.id);
						break;
				}
				this.send(update);
			}

			if (this.#inReset) {
				this.send({ type: "RESET_READY"});
				this.#inReset = false;
			}

			this.#pollPromise = null;
		});
	}
	private constructor(pollInterval: number, provider: Provider) {
		super(pollInterval);
		this.#provider = provider;
	}
}