<script setup lang="ts">
import k from "./keys.ts";
import {computed, onMounted, onUnmounted, provide, ref} from "vue";
// import useServerInfo from "@/providers/ServerInfoProvider/useServerInfo.ts";
import PortsWebSocketClient from "@/websocket/PortsWebSocketClient.ts";
import type { Service } from "@/types/Service.ts";

type Props = { autoConnect?: boolean, wsHost?: string, wsPort?: number, wsProtocol?: "ws" | "wss" };
const props = withDefaults(defineProps<Props>(), {
	autoConnect: true,
	wsHost: window.location.hostname,
	wsProtocol: window.location.protocol.endsWith("s") ? "wss" : "ws",
	wsPort: undefined,
});

// const {serverInfo} = useServerInfo();

const servicesRef = ref(new Map<string, Service>());

const client = new PortsWebSocketClient(
	"localhost",
	8881,
	false,
	servicesRef,
);

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
		client.connect();
	},
	disconnect() {
		client.disconnect();
	}
};
export type PortInfoProviderInterface = typeof intf;

provide(k.INTERFACE, intf);
provide(k.SERVICES_REF, computed(() => [...servicesRef.value.values()]));
</script>

<template>
	<slot/>
</template>
