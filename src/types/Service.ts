import type {ParsedResponse} from "@/server/lib/Probe/util/http";
import type {Port} from "./Port";

export type Service = Port & ParsedResponse & {
	probed: true;
	applicationProtocol: string | null;
	secure: boolean;
	httpStatus: number | null;
};
