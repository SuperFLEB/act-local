import type {Rule} from "@/filter/RuleMatcher.ts";

export type PortPreferences = {
	split: boolean;
	best: boolean;
	hostname: "localhost" | string | null;
	ip: "v4" | "v6";
};

export type Config = {
	prefer: PortPreferences;
	rules: { [key: string]: Rule };
	overrides: { [key: string]: PortPreferences };
	systemDefaultIpVersion: "v4" | "v6";
};

export default async function getConfig(): Promise<Config> {
	// TODO: Actually read a config from somewhere
	return {
		prefer: {
			split: false,
			best: true,
			hostname: "localhost",
			ip: "v6",
		},
		systemDefaultIpVersion: "v6",
		rules: {},
		overrides: {},
	};
};
