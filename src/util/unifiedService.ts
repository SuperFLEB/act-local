import type {Service, UnifiedService} from "@t/Connection.ts";
import type {PortPreferences} from "@/config.ts";


function getBest(uni: UnifiedService): Service | null {
	// If there is only one IP version being served, it's the "only", not the "best", so there is no "best".
	// This may seem a bit counterintuitive, but it makes it so single-version servers will still be addressed
	// by hostname when both the "best" and "hostname" preferences are used. "Best" should only override to an
	// IP address when there are two versions and one is broken.

	if (!(uni.v4 && uni.v6)) return null;
	if (uni.v4.success === uni.v6.success) return null;
	return (uni.v4.success ? uni.v4 : uni.v6);
}

export function getDefinitiveService(uni: UnifiedService, prefer: PortPreferences, defaultVersion: "v4" | "v6" = "v6"): Service {
	if (!(uni.v4 && uni.v6)) return (uni.v4 ?? uni.v6)!;
	if (prefer.best) {
		const best = getBest(uni);
		if (best) return best;
	}
	return uni[prefer.hostname ? defaultVersion : prefer.ip] ?? uni.v4 ?? uni.v6;
}

export function getHostName(uni: UnifiedService, prefer: PortPreferences) {
	if (prefer.best) {
		const best = getBest(uni);
		if (best) return best.destIp;
	}
	if (prefer.hostname) return prefer.hostname;
	return (uni[prefer.ip] ?? uni.v4 ?? uni.v6)!.destIp;
}

