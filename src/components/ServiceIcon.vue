<script setup lang="ts">
import {ref, watch, watchEffect} from "vue";

import type {Service} from "@t/Connection.ts";
import useConfig from "@/providers/ConfigProvider/useConfig.ts";
import {fallbackIcon, icon} from "@/util/service.ts";

const props = defineProps<{ service: Service, hostname: string }>();

const configRef = useConfig();
const src = ref<string>();

let fallbackTimeout: ReturnType<typeof setTimeout>;

function switchImage(e: Event) {
	clearTimeout(fallbackTimeout);
	src.value = (e.target as HTMLImageElement).src;
}

function fallbackImage() {
	clearTimeout(fallbackTimeout);
	src.value = fallbackIcon(props.service);
}

watchEffect(() => {
	src.value = fallbackIcon(props.service);

	const image = new Image();
	image.src = icon(props.service, props.hostname);

	image.onload = switchImage;
	image.onerror = fallbackImage;
	fallbackTimeout = setTimeout(fallbackImage, 2000);

})
</script>
<template>
	<img :alt="service.title ?? 'icon'" :="$attrs" :src="src" />
</template>
