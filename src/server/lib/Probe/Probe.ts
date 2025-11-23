import type {Port} from "@t/Port.ts";
import type { Service } from "@/types/Service";

export default abstract class Probe {
	protected abortController: AbortController;

	abort() {
		this.abortController.abort();
	}

	abstract investigate(abortSignal?: AbortSignal): Promise<Service | null>;

	constructor(port: Port) {
		this.abortController = new AbortController();
	}
}
