import type {Service} from "@t/ServicesTypes.ts";
import {request as httpRequest, type IncomingMessage} from "node:http";
import {request as httpsRequest} from "node:https";
import { JSDOM } from "jsdom";

type ProbeFunction = (service: Service) => Promise<Service | false>;
type ParseOutputs = {
	"text/html": Document;
	"text/plain": string;
	"application/json": any;
}

type KnownResponse = {
	type: "text/html";
	parsed: Document;
	body: string;
} | {
	type: "text/plain";
	parsed: string;
	body: string;
} | {
	type: "application/json";
	parsed: any;
	body: string;
};
type UnknownResponse = {
	type: string;
	parsed: string;
	body: string;
};
type ParsedResponse = KnownResponse | UnknownResponse;


export async function httpProbe(service: Service): Promise<Service | false> {
	return httpHttpsProbe(service, false);
}

export async function httpsProbe(service: Service): Promise<Service | false> {
	return httpHttpsProbe(service, true);
}

function httpParse(httpResponse: Response, body: string): ParsedResponse {
	const contentType = httpResponse.headers.get("content-type")?.split(';')[0] ?? "application/octet-stream";
	switch (contentType) {
		case "text/html":
			return {
				type: "text/html",
				parsed: new JSDOM(body).window.document,
				body,
			};
		case "text/plain":
			return {
				type: "text/plain",
				parsed: body,
				body
			};
		case "application/json":
			try {
				return {
					type: "application/json",
					parsed: JSON.parse(body),
					body
				};
			} catch (e) {
				return {
					type: "application/json",
					parsed: undefined,
					body
				};
			}
		default:
			return {
				type: contentType,
				parsed: body,
				body
			} as ParsedResponse;
	}
}

function httpGetTitle(p: ParsedResponse): string {
	switch (p.type) {
		case "text/html":
			p = p as KnownResponse;
			const explicitTitle = p.parsed.querySelector("head title");
			if (explicitTitle) return explicitTitle.textContent;
			const explicitBody = p.parsed.querySelector("body");
			if (explicitBody) return explicitBody.textContent;
			return p.parsed.documentElement.textContent;
		case "application/json":
			p = p as KnownResponse;
			if (p.parsed === undefined) return "Unknown JSON";
			if (typeof p.parsed === 'object' && !Array.isArray(p.parsed)) return Object.keys(p.parsed).slice(0, 3).map(k => k.length < 10 ? k : k.slice(0, 7) + '...').join(", ");
			const jsonText = JSON.stringify(p.parsed);
			return jsonText.slice(0, 50) + (jsonText.length > 50 ? "..." : "");
		case "text/plain":
		default:
			const contents = (p.parsed as string).replace(/\s+/gs, ' ');
			return contents.slice(0, 50) + (contents.length > 50 ? "..." : "");
	}
}

function httpGetIcon(p: ParsedResponse): string | null {
	switch (p.type) {
		case "text/html":
			p = p as KnownResponse;
			const explicitIcon = p.parsed.querySelector("link[rel='icon']");
			if (explicitIcon) return explicitIcon.getAttribute("href");
			break;
	}
	return null;
}

async function httpHttpsProbe(service: Service, https: boolean = false): Promise<Service | false> {
	const port = service.port;
	const pid = service.pid;
	const connections: [Service | false, boolean][] = [];

	for (const host of ["localhost", service.ip]) {
		try {
			const httpResponse = await fetch(`http${https ? "s" : ""}://${host}:${port}/`);

			const contentType = httpResponse.headers.get("content-type");

			const body = await httpResponse.text();
			const parsed = httpParse(httpResponse, body);

			const title = httpGetTitle(parsed);
			const icon = httpGetIcon(parsed);
			const fullService: Service = {
				...service,
				protocol: https ? "https" : "http",
				secure: https,
				status: httpResponse.status,
				host,
				title: title || "(Untitled Page)"
			};

			if (icon) fullService.icon = icon;
			if (contentType) fullService.contentType = contentType;

			connections.push([fullService, httpResponse.ok]);
		} catch (error) {
			continue;
		}
	}
	const success = connections.find(c => c[1]);
	if (success) return success[0];
	return connections[0]?.[0] ?? false;
}

async function wsWssProbe(service: Service, https: boolean = false): Promise<Service | false> {
	const port = service.port;
	const pid = service.pid;
	const request = https ? httpsRequest : httpRequest;
	try {
		const response = await new Promise<boolean>((resolve) => {
			const req = request({
				method: "GET",
				host: "127.0.0.1",
				protocol: https ? "https:" : "http:",
				port,
				path: "/",
				headers: {
					"Connection": "Upgrade",
					"Upgrade": " websocket",
					"Sec-WebSocket-Version": "13",
					// Nowhere near cryptographically random, but that doesn't matter for this.
					"Sec-WebSocket-Key": btoa(Math.random().toString(10).slice(2, 18).padEnd(16, "0")),
				},
				timeout: 500,
			});
			req.on("error", (err) => {
				resolve(false);
			});
			req.on("response", (response: IncomingMessage) => {
				resolve(response.statusCode === 101);
			});
			req.on("upgrade", (response, socket) => {
				socket.destroy();
				resolve(true);
			});
			req.end();
		}).catch((reason) => {
			console.error(`(!!!) WebSocket probe of port ${port} failed: ${reason}`);
			return false;
		});
		if (!response) return false;
		return {
			...service,
			protocol: https ? "wss" : "ws",
			secure: https,
			title: "WebSocket",
		};
	} catch (error) {
		return false;
	}
}

export async function wsProbe(service: Service) {
	return wsWssProbe(service, false);
}

export async function wssProbe(service: Service) {
	return wsWssProbe(service, true);
}

export default async function probe(service: Service, probes: ProbeFunction[] = [wssProbe, wsProbe, httpsProbe, httpProbe]): Promise<Service | false> {
	let result: Service | false = false;
	for (const probe of probes) {
		result = await probe(service);
		if (result) break;
	}
	return result;
}