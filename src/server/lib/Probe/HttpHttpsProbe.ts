import type {Port} from "@t/Port.ts";
import type { Service } from "@/types/Service";
import Probe from "@/server/lib/Probe/Probe.ts";
import {parseHttpResponse} from "@/server/lib/Probe/util/http.ts";

abstract class HttpHttpsProbe extends Probe {
	#port: Port;
	protected abstract protocolString: "http" | "https";
	protected abstract secure: boolean;
	protected abstract name: string;

	async investigate(abortSignal?: AbortSignal): Promise<Service | null> {
		const signals = AbortSignal.any([abortSignal, this.abortController.signal].filter(s => s !== undefined));
		if (signals.aborted) return null;

		let connections: Service[] = [];
		for (const host of [this.#port.destIp, "localhost"]) {
			if (signals.aborted) return null;
			try {
				const httpResponse = await fetch(this.protocolString + '://' + host + ':' + this.#port.port + '/', { signal: signals });
				const parsed = await parseHttpResponse(httpResponse);
				const probedPort: Service = {
					probed: true,
					...parsed,
					...this.#port,
					applicationProtocol: this.protocolString,
					secure: this.secure,
					httpStatus: httpResponse.status,
				};

				connections.push(probedPort);
			} catch (error) {
				continue;
			}
		}
		return connections.find(c => c.httpStatus === 200) ?? connections[0] ?? null;
	}

	constructor(port: Port) {
		super(port);
		this.#port = port;
	}
}

export class HttpProbe extends HttpHttpsProbe {
	protected secure = false;
	protected name = "http";
	protected protocolString = "http" as const;
}

export class HttpsProbe extends HttpHttpsProbe {
	protected secure = true;
	protected name = "https";
	protected protocolString = "https" as const;
}
