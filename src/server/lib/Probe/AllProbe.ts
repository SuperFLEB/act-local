import Probe from "@/server/lib/Probe/Probe.ts";
import {HttpProbe, HttpsProbe} from "@/server/lib/Probe/HttpHttpsProbe.ts";
import type {Connection} from "@t/Connection.ts";

export default class AllProbe extends Probe {
	#port: Connection;
	name = "sequence";
	secure = false;

	async investigate(abortSignal?: AbortSignal) {
		return (
			await new HttpProbe(this.#port).investigate(abortSignal) ??
			await new HttpsProbe(this.#port).investigate(abortSignal) ??
			null
		);
	}

	constructor(port: Connection) {
		super(port);
		this.#port = port;
	}
}