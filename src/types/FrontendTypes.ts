import type {UnifiedService} from "@t/Connection.ts";

export type ServiceInfoPanelProps = {
	type: "UnifiedService";
	item: UnifiedService;
}

export type NoneInfoPanelProps = {
	type: "None";
	item?: null;
}

export type InfoPanelProps = ServiceInfoPanelProps | NoneInfoPanelProps;