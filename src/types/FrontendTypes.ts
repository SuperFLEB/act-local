import type { Service } from "./Service.ts";

export type ServiceInfoPanelProps = {
	type: "Service";
	item: Service;
}

export type NoneInfoPanelProps = {
	type: "None";
	item?: null;
}

export type InfoPanelProps = ServiceInfoPanelProps | NoneInfoPanelProps;