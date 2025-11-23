import unknownSvg from "@/assets/icons/unknown.svg";
import type { Service } from "@/types/Service";

const iconMap: Record<string, string> = {
	http: "http",
	https: "http",
	ws: "ws",
	wss: "ws",
	"application/json": "json",
	"text/plain": "text",
};

export function serviceUrl(service: Service, path: string = "/") {
	if (path[0] !== "/") path = "/" + path;
	return `${service.applicationProtocol}://${service.destIp}:${service.port}${path}`;
}

export function fallbackIcon(service: Service) {
	const icon = (() => {
		const contentType = service.contentType?.split(";")[0] ?? "";
		if (contentType in iconMap) return iconMap[contentType as string];
		if (service.applicationProtocol ?? "" in iconMap) return iconMap[service.applicationProtocol as string];
		return "unknown";
	})();
	return unknownSvg + "#" + icon;
}

export function icon(service: Service) {
	const baseUrl = `${service.applicationProtocol}://${service.destIp}:${service.port}/`;
	if (service.icon && service.icon) {
		if (/^[-a-zA-Z]+:/.test(service.icon)) {
			return service.icon;
		}
		return baseUrl + service.icon;
	}
	return baseUrl + "favicon.ico";
}
