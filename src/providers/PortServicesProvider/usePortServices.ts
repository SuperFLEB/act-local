import k from "./keys.ts";
import {inject, type Ref} from "vue";
import {ComposableOutOfContextError} from "@/errors.ts";

import type {UnifiedService, Service} from "@t/Connection.ts";
import type {PortInfoProviderInterface} from "@/providers/PortServicesProvider/PortServicesProvider.vue";

export default function usePortServices(): { interface: any, services: Ref<Service[]>, unifiedServices: Ref<UnifiedService[]> } {
	const intf = inject<PortInfoProviderInterface>(k.INTERFACE);
	const services = inject<Ref<Service[]>>(k.SERVICES_REF);
	const unifiedServices = inject<Ref<UnifiedService[]>>(k.UNIFIED_SERVICES_REF);
	if (!intf || !services || !unifiedServices) {
		throw new ComposableOutOfContextError("usePortInfo can only be used within a PortInfoProvider");
	}
	return {interface: intf, services, unifiedServices};
}