import type { Service } from "@/types/Service";

export type MatchType = "EXACT" | "SEARCH" | "REGEX";

export type Rule = {
	name: string,

	port?: number,
	secure?: boolean,
	success?: boolean,

	command?: string,
	contentType?: string,
	title?: string,
	body?: string,
	status?: string,

	commandMatch?: MatchType,
	contentTypeMatch?: MatchType,
	titleMatch?: MatchType,
	bodyMatch?: MatchType,
	statusMatch?: MatchType,
}

function matchText(haystack: string, needle: string, matchType?: MatchType): boolean {
	if (matchType === "REGEX") return new RegExp(needle).test(haystack);
	if (matchType === "SEARCH") return haystack.includes(needle);
	return haystack === needle;
}

function defined<T>(v: T | undefined): v is T { return v !== undefined; }

export default class RuleMatcher {
	#rule: Rule;

	match(port: Service): boolean {
		if (defined(this.#rule.port) && port.port !== this.#rule.port) return false;
		if (defined(this.#rule.secure) && port.secure !== this.#rule.secure) return false;
		if (defined(this.#rule.success) && !port.httpStatus?.toString().startsWith("2")) return false;

		if (defined(this.#rule.command) && !matchText(port.command!, this.#rule.command, this.rule.commandMatch)) return false;
		if (defined(this.#rule.contentType) && !matchText(port.contentType!, this.#rule.contentType, this.rule.contentTypeMatch)) return false;
		if (defined(this.#rule.title) && !matchText(port.title!, this.#rule.title, this.rule.titleMatch)) return false;
		if (defined(this.#rule.body) && !matchText(port.body!, this.#rule.body, this.rule.bodyMatch)) return false;

		if (defined(this.#rule.status) && !matchText(port.httpStatus?.toString() ?? 'null', this.#rule.status, this.#rule.statusMatch)) return false;

		return true;
	}

	constructor(public rule: Rule) {
		this.#rule = rule;
	}
}
