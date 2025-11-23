import k from "./keys.ts";
import {inject, type Ref} from "vue";
import {ComposableOutOfContextError} from "@/errors.ts";
import type { Service } from "@/types/Service.ts";

export default function usePortServices(): { interface: any, services: Ref<Service[]>} {
	const intf = inject(k.INTERFACE);
	const services = inject<Ref<Service[]>>(k.SERVICES_REF);
	if (!intf || !services) {
		throw new ComposableOutOfContextError("usePortInfo can only be used within a PortInfoProvider");
	}
	return {interface: intf, services};
}