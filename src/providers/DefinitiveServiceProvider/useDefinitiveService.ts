import k from "./keys.ts";
import type {Definitive, Service, UnifiedService} from "@t/Connection.ts";
import {inject, type Ref} from "vue";
import {ComposableOutOfContextError} from "@/errors.ts";

export type DefinitiveServiceResponse = {
	service: Ref<Service>,
	unifiedService: Ref<UnifiedService>,
	hostname: Ref<string>,
};

export default function useDefinitiveService(): DefinitiveServiceResponse {
	const service = inject<Ref<Service>>(k.SERVICE);
	const unifiedService = inject<Ref<UnifiedService>>(k.UNIFIED);
	const hostname = inject<Ref<string>>(k.HOSTNAME);
	if (!(service && unifiedService && hostname)) throw new ComposableOutOfContextError("Cannot use useDefinitiveService outside of a DefinitiveServiceProvider");
	return { unifiedService, service, hostname };
}