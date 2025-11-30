import type {Service} from "@t/Connection.ts";
import unknownSvg from "@/assets/icons/unknown.svg";

const iconMap: Record<string, string> = {
	http: "http",
	https: "http",
	ws: "ws",
	wss: "ws",
	"application/json": "json",
	"text/plain": "text",
};

export function fallbackIcon(service: Service): string {
	const icon = (() => {
		const contentType = service.contentType?.split(";")[0] ?? "";
		if (contentType in iconMap) return iconMap[contentType as string];
		if (service.applicationProtocol ?? "" in iconMap) return iconMap[service.applicationProtocol as string];
		return "unknown";
	})();
	return unknownSvg + "#" + icon;
}

export function getUrl(service: Service, hostName: string, path: string): string {
	if (path[0] !== "/") path = "/" + path;
	return `${service.applicationProtocol}://${hostName}:${service.port}${path}`;
}

export function icon(service: Service, hostName: string): string {
	const baseUrl = getUrl(service, hostName, "/");
	if (service.icon) {
		if (/^[-a-zA-Z]+:/.test(service.icon)) {
			return service.icon;
		}
		return baseUrl + service.icon;
	}
	return baseUrl + "favicon.ico";
}