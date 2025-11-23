type NonTargetEvent = {
	type: "RESET" | "RESET_READY";
	info?: string;
} | {
	type: "ERROR" | "INFO";
	info: string;
};

export type ScannerEvent<T> = NonTargetEvent | {
	type: "ADD" | "UPDATE" | "DELETE";
	id: string;
	info?: string;
	target: T;
};
