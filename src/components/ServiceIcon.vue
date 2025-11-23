<script setup lang="ts">
import {ref, watch} from "vue";
import {fallbackIcon, icon} from "@/util/service.ts";
import type { Service } from "@/types/Service";

const props = defineProps<{ service: Service }>();
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

watch(() => props.service, () => {
	const image = new Image();
	image.src = icon(props.service);

	image.onload = switchImage;
	image.onerror = fallbackImage;
	fallbackTimeout = setTimeout(fallbackImage, 2000);
}, {immediate: true});

</script>
<template>
	<img :alt="props.service.title ?? 'icon'" :="$attrs" :src="src" />
</template>
