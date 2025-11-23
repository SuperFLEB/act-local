import {JSDOM} from "jsdom";

type BasicResponse = {
	contentType: string;
	body: string;
}

export type ParsedResponse = BasicResponse & {
	title: string | null;
	icon: string | null;
};

function getDocument(response: BasicResponse): any {
	switch (response.contentType) {
		case "text/html":
			return new JSDOM(response.body).window.document;
		case "application/json":
			return JSON.parse(response.body);
		default:
			return response.body;
	}
}

function getTitle(contentType: string, doc: any): string {
	switch (contentType) {
		case "text/html":
			const explicitTitle = doc?.querySelector("head title");
			if (explicitTitle) return explicitTitle.textContent!;
			const explicitBody = doc?.querySelector("body");
			if (explicitBody) return explicitBody.textContent ?? "No Content";
			return doc?.documentElement?.textContent ?? "No Content";
		case "application/json":
			if (doc === undefined) return "Unknown JSON";
			if (typeof doc === "object" && !Array.isArray(doc)) return Object.keys(doc).slice(0, 3).map(k => k.length < 10 ? k : k.slice(0, 7) + "...").join(", ");
			const jsonText = JSON.stringify(doc);
			return jsonText.slice(0, 50) + (jsonText.length > 50 ? "..." : "");
		case "text/plain":
		default:
			const text = ((doc as string ?? "").toString()).replace(/\s+/gs, " ");
			return text.slice(0, 50) + (text.length > 50 ? "..." : "");
	}
}

function getIcon(contentType: string, doc: any): string | null {
	switch (contentType) {
		case "text/html":
			// Duck-type the object because JSDOM doesn't provide an easy class to instanceof against
			if (!doc?.querySelector) return null;

			const explicitIcon = doc.querySelector("link[rel='icon']");
			if (explicitIcon) return explicitIcon.getAttribute("href");
			break;
	}
	return null;
}

export async function parseHttpResponse(httpResponse: Response): Promise<ParsedResponse> {
	const contentType = httpResponse.headers.get("content-type")?.split(";")[0] ?? "application/octet-stream";
	const body = await httpResponse.text();
	const doc = getDocument({ contentType, body });
	return {
		contentType,
		body,
		title: getTitle(contentType, doc),
		icon: getIcon(contentType, doc)
	};
}
