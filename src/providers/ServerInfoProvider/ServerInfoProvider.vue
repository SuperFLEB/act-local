<script setup lang="ts">
import {onMounted, provide, readonly, ref} from "vue";
import type {ServerInfo} from "@t/ServerInfo.ts";
import k from "./keys.ts";

const serverInfo = ref<ServerInfo | undefined>();

if (!serverInfo.value) {
	fetch("/serverinfo.json")
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