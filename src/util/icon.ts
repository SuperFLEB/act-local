import unknownSvg from "@/assets/icons/unknown.svg";
import type {Service} from "@t/ServicesTypes.ts";

const iconMap: Record<string, string> = {
	http: "http",
	https: "http",
	ws: "ws",
	wss: "ws",
	"application/json": "json",
	"text/plain": "text",
};

export function fallbackIcon(service: Service) {
	const icon = (() => {
		const contentType = service.contentType?.split(";")[0] ?? "";
		if (contentType in iconMap) return iconMap[contentType as string];
		if (service.protocol ?? "" in iconMap) return iconMap[service.protocol as string];
		return "";
	})();
	return unknownSvg + "#" + icon;
}

export function icon(service: Service) {
	if (service.icon && service.icon) {
		if (/^[-a-zA-Z]+:/.test(service.icon)) {
			return service.icon;
		}
		return service.httpUrl + service.icon;
	}
	return service.httpUrl + "favicon.ico";
}
