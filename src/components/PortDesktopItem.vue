<script setup lang="ts">
import ServiceIcon from "@/components/ServiceIcon.vue";
import {type CSSProperties, nextTick, ref, useTemplateRef, watch} from "vue";

import type {UnifiedService} from "@t/Connection.ts";
import useDefinitiveService from "@/providers/DefinitiveServiceProvider/useDefinitiveService.ts";
import {getUrl} from "@/util/service.ts";

const props = defineProps<{ focus: boolean }>();
const emit = defineEmits<{
	focus: [FocusEvent, UnifiedService],
	activate: [KeyboardEvent | MouseEvent, string],
	keypress: [KeyboardEvent, UnifiedService],
}>();

const { service, unifiedService, hostname } = useDefinitiveService();

function activate(e: MouseEvent | KeyboardEvent) {
	emit("activate", e, getUrl(service.value, hostname.value, "/"));
}

const titleStyle = ref<CSSProperties>({});
const titleRef = useTemplateRef("title");
function shrinkwrap() {
	nextTick(() => {
		const range = document.createRange();
		range.selectNodeContents(titleRef.value!);
		titleStyle.value.maxWidth = Math.max(0, ...Array.from(range.getClientRects()).map(r => r.width)) + "px";
	});
}
watch(() => service.value.title, shrinkwrap, {immediate: true});
</script>
<template>
	<div
		:class="['item', {focus: props.focus}]"
		tabindex="0"
		@focusin="emit('focus', $event, unifiedService)"
		@dblclick="activate"
	>
		<ServiceIcon class="icon" :service :hostname />
		<div ref="title" class="title" :style="titleStyle">{{ service.title }}</div>
	</div>
</template>

<style scoped>
.item {
	width: 120px;
	display: flex;
	flex-direction: column;
	align-items: center;

	margin-bottom: 2em;

	.title {
		text-align: center;
		padding: .2em .2em;
		margin-top: 0.2em;
	}

	&.focus .title {
		color: #fff;
		background-color: #008;
	}

	.icon {
		width: 48px;
		height: 48px;
	}

}
</style>