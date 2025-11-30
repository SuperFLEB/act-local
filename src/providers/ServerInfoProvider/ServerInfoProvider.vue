<script setup lang="ts">
import {provide, readonly, ref} from "vue";
import type {ServerInfo} from "@t/ServerInfo.ts";
import k from "./keys.ts";

const serverInfo = ref<ServerInfo | undefined>();

if (!serverInfo.value) {
	const url = import.meta.env.DEV ? "http://localhost:" + (import.meta.env.VITE_API_SERVER_PORT ?? 8881) : window.location.origin;
	fetch(url + "/serverinfo.json")
		.then(r => r.json())
		.then(info => {
			serverInfo.value = info;
		});
}

provide(k.SERVER_INFO, readonly(serverInfo));
</script>

<template>
	<slot v-if="serverInfo"></slot>
</template>

<style scoped>

</style>