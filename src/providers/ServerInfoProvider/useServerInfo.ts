import k from "./keys.ts";
import {hasInjectionContext, inject, type Ref} from "vue";
import {ComposableOutOfContextError} from "@/errors.ts";
import type {ServerInfo} from "@t/ServerInfo.ts";

export default function useServerInfo(): { serverInfo: Ref<ServerInfo | undefined> } {
	const serverInfo = inject<Ref<ServerInfo | undefined>>(k.SERVER_INFO);
	if (!serverInfo) throw new ComposableOutOfContextError("Cannot use useServerInfo outside of a ServerInfoProvider");
	return {serverInfo};
}