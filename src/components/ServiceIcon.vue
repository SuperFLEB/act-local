<script setup lang="ts">
import {ref, watch} from "vue";
import {fallbackIcon, icon} from "@/util/icon.ts";
import type {Service} from "@t/ServicesTypes.ts";

const props = defineProps<{ service: Service }>();
const src = ref<string>(icon(props.service));
watch(() => props.service, () => {
	src.value = icon(props.service);
});
</script>
<template><img :="$attrs" :src @error="src = fallbackIcon(props.service)" /></template>
