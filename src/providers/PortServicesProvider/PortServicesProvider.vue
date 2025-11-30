<script setup lang="ts">
import k from "./keys.ts";
import {computed, onMounted, onUnmounted, provide, ref, watch} from "vue";
import ServicesWebSocketClient from "@/websocket/ServicesWebSocketClient.ts";

import type {Service} from "@t/Connection.ts";
import unifyServices from "@/providers/PortServicesProvider/unifyServices.ts";
import useConfig from "@/providers/ConfigProvider/useConfig.ts";
import useServerInfo from "@/providers/ServerInfoProvider/useServerInfo.ts";

type Props = { autoConnect?: boolean, wsHost?: string, wsPort?: number, wsProtocol?: "ws" | "wss" };
const props = withDefaults(defineProps<Props>(), {
	autoConnect: true,
	wsHost: window.location.hostname,
	wsProtocol: window.location.protocol.endsWith("s") ? "wss" : "ws",
	wsPort: undefined,
});

const serverInfo = useServerInfo();

const servicesRef = ref(new Map<string, Service>());
const configRef = useConfig();

let connectBacklog = false;
let client: ServicesWebSocketClient | undefined = undefined;

watch(serverInfo, (is, was) => {
	if (is?.ports.ws !== was?.ports.ws) {
		if (client) {
			intf.disconnect();
		}

		if (!is?.ports.ws) {
			console.log("No server info found to connect WebSocket. Watching for it to arrive...");
		}

		client = new ServicesWebSocketClient(
			"localhost",
			serverInfo.value!.ports.ws,
			false,
			servicesRef,
		);

		if (connectBacklog) {
			intf.connect();
		}
	}
}, {immediate: true});

onMounted(() => {
	if (props.autoConnect) {
		intf.connect();
	}
});

onUnmounted(() => {
	intf.disconnect();
});

const intf = {
	connect() {
		if (!client) {
			connectBacklog = true;
			return;
		}
		client.connect();
		connectBacklog = false;
	},
	disconnect() {
		connectBacklog = false;
		if (client) client.disconnect();
	}
};
export type PortInfoProviderInterface = typeof intf;

const unifiedServicesRef = computed(() => unifyServices([...servicesRef.value.values()], configRef.value));

provide(k.INTERFACE, intf);
provide(k.SERVICES_REF, computed(() => [...servicesRef.value.values()]));
provide(k.UNIFIED_SERVICES_REF, computed(() => [...unifiedServicesRef.value.values()]));
</script>

<template>
	<slot/>
</template>
