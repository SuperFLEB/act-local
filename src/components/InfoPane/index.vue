<script setup lang="ts">
import type {InfoPanelProps} from "@t/FrontendTypes.ts";
import ServiceInfoView from "@/components/InfoPane/ServiceInfoView.vue";
import NoneInfoView from "@/components/InfoPane/NoneInfoView.vue";
import {computed} from "vue";

const props = withDefaults(defineProps<InfoPanelProps>(), {type: "None"});
const Component = computed(() => ({
	Service: ServiceInfoView,
	None: NoneInfoView
}[props.type]));
</script>

<template>
	<component :is="Component" :="props"/>
</template>
