import k from "./keys.ts";
import {inject, type Ref} from "vue";
import {ComposableOutOfContextError} from "@/errors.ts";
import type {Service} from "@t/ServicesTypes.ts";

export default function usePortInfo(): { interface: any, services: Ref<Service[]>, readyState: Ref<boolean>} {
	const intf = inject(k.INTERFACE);
	const services = inject<Ref<Service[]>>(k.SERVICES_REF);
	const readyState = inject<Ref<boolean>>(k.READY_STATE);
	if (!intf || !services || !readyState) {
		throw new ComposableOutOfContextError("usePortInfo can only be used within a PortInfoProvider");
	}
	return {interface: intf, services, readyState};
}