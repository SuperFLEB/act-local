<script setup lang="ts">
import k from "./keys.ts";
import {computed, onMounted, onUnmounted, provide, ref, watch} from "vue";
import type {Service, UpdatePacket} from "@t/ServicesTypes.ts";
import type {Timeout} from "@t/Timeout.ts";
import useServerInfo from "@/providers/ServerInfoProvider/useServerInfo.ts";
import {server} from "@vitest/browser/context";

type WebSocketWithFlags = WebSocket & { intentClosed?: boolean };

type Props = { autoConnect?: boolean, wsHost?: string, wsPort?: number, wsProtocol?: "ws" | "wss" };
const props = withDefaults(defineProps<Props>(), {
	autoConnect: true,
	wsHost: window.location.hostname,
	wsProtocol: window.location.protocol.endsWith("s") ? "wss" : "ws",
	wsPort: undefined,
});

const lastServicesByIdent = ref<Record<string, Service>>({});
const servicesByIdent = ref<Record<string, Service>>({});
const readyState = ref<boolean>(false);

const services = computed(() => Object.values(servicesByIdent.value));
const servicesRef = computed(() => {
	return readyState.value ? services.value : Object.values(lastServicesByIdent.value);
});

let ws: WebSocketWithFlags | undefined;
let revival: Timeout | undefined;

function update(packet: string | UpdatePacket) {
	let event: UpdatePacket;

	if (typeof packet === "string") {
		try {
			event = JSON.parse(packet) as UpdatePacket;
		} catch (e) {
			console.error(`Invalid JSON from ${ws?.url ?? "Unknown WebSocket"}:`, packet);
			return;
		}
	} else {
		event = packet;
	}

	switch (event.type) {
		case "DELETE":
			delete servicesByIdent.value[event.ident];
			return;
		case "UPDATE":
			servicesByIdent.value[event.ident] = event.service;
			return;
		case "META":
			switch (event.meta) {
				case "NOOP":
					return;
				case "RESET":
					lastServicesByIdent.value = servicesByIdent.value;
					servicesByIdent.value = {};
					readyState.value = false;
					return;
				case "READY":
					readyState.value = true;
					return;
			}
	}

	console.warn("Unhandled WebSocket packet", event);
}

const intf = {
	connect(host?: string, port?: number, protocol?: "ws" | "wss", forceReconnect: boolean = false) {
		host ??= props.wsHost;
		port ??= props.wsPort;
		protocol ??= props.wsProtocol;
		this.connectUrl(`${protocol}://${host}:${port}`, forceReconnect);
	},
	connectUrl(url: string, forceReconnect: boolean = false) {
		if (revival !== undefined && !forceReconnect) return;
		this.disconnect();

		ws = new WebSocket(url);
		ws.intentClosed = false;

		ws.onmessage = (event) => {
			update(event.data);
		};
		ws.onerror = (event) => {
			console.error(event);
		};
		ws.onclose = (event) => {
			if (!ws) return;
			if (!ws.intentClosed) {
				console.warn("WebSocket closed unexpectedly. Reviving...");
				this.revive();
			}
		};
	},
	disconnect() {
		this.devive();
		if (!ws) return;
		ws.intentClosed = true;
		ws.close();
		ws = undefined;
	},
	revive() {
		if (!ws || ws.intentClosed) return;
		if (revival !== undefined) return;
		const url = ws.url;
		this.disconnect();
		this.connectUrl(url, true);
	},
	devive() {
		if (revival === undefined) return;
		clearTimeout(revival);
		revival = undefined;
	}
};

const {serverInfo} = useServerInfo();

onMounted(() => {
	if (props.autoConnect) {
		watch(serverInfo, () => {
			const si = serverInfo.value;
			if (!si) return;
			const port = si.ports[props.wsProtocol];
			intf.connect(props.wsHost, port, props.wsProtocol);
		}, {immediate: true});
	}
});

onUnmounted(() => {
	intf.disconnect();
});

provide(k.INTERFACE, intf);
provide(k.SERVICES_REF, servicesRef);
provide(k.READY_STATE, readyState);
</script>

<template>
	<slot/>
</template>

<style scoped>

</style>
