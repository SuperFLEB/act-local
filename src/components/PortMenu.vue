<script setup lang="ts">
import usePortInfo from "@/providers/PortInfoProvider/usePortInfo.ts";
import {computed, onMounted, ref, useTemplateRef} from "vue";
import type {Service, TransportProtocol} from "@t/ServicesTypes.ts";
import ServiceDesktopItem from "@/components/ServiceDesktopItem.vue";
import InfoPane from "@/components/InfoPane/index.vue";
import type {InfoPanelProps} from "@t/FrontendTypes.ts";

const {services, readyState} = usePortInfo();

const filters = {
	HTTP: (s: Service) => !!s.protocol?.startsWith("http"),
	TEXT: (s: Service) => !!s.contentType?.startsWith("text"),
	ACCEPTED: (s: Service) => [2, 3, 5].includes(Math.trunc((s.status ?? 0) / 100)),
	SUCCESS: (s: Service) => [2, 3].includes(Math.trunc((s.status ?? 0) / 100)),
};
const filter = ref<(keyof typeof filters)[]>(["HTTP", "TEXT", "ACCEPTED"]);
const preferTransport: TransportProtocol[] = ["tcp", "tcp6"];

const usableServices = computed(() => {
	const filtered = services.value.filter(s => !filter.value.map(f => filters[f](s)).includes(false));
	const combinedByPort: Map<number, Partial<Record<TransportProtocol, Service>>> = new Map();
	for (const s of filtered) {
		combinedByPort.set(s.port, {...combinedByPort.get(s.port), [s.transport]: s});
	}
	return new Map(
		Array.from(combinedByPort.keys())
			.map(k => [
				k,
				preferTransport.map(t => combinedByPort.get(k)?.[t]).filter(s => s !== undefined)
			])
	);
});

function go(_: Event, service: Service) {
	window.open(service.url, "_blank");
}

const portMenuRef = useTemplateRef("portMenu");

onMounted(() => {
	portMenuRef.value?.querySelectorAll(":scope > .services > li .title").forEach((el: Element) => {
		const range = document.createRange();
		range.selectNodeContents(el);
		const box = range.getBoundingClientRect();
		console.log(box);
		(el as HTMLElement).style.width = box.width + "px";
		(el as HTMLElement).style.height = box.height + "px";
	});
});

const selected = ref<Service|undefined>();
const infoPanel = ref<InfoPanelProps>({ type: "None" });
function focusEvent(event: FocusEvent, service: Service) {
	infoPanel.value = {
		type: "Service",
		item: service
	};
	selected.value = service;
}

function defocusClick(event: MouseEvent) {
	if (event.target !== event.currentTarget) return;
	selected.value = undefined;
	infoPanel.value = { type: "None" };
}
</script>

<template>
	<div class="portMenu" ref="portMenu">
		<InfoPane :="infoPanel" class="infoPanel" />
		<ul :class="['services', { waiting: !readyState }]" @click="defocusClick">
			<li v-for="service in usableServices.values()" :key="service[0].ident">
				<ServiceDesktopItem
					:service="service[0]"
					:focus="service[0] === selected"
					@focus="focusEvent"
					@activate="go"
				/>
			</li>
		</ul>
	</div>
</template>

<style scoped>
* {
	box-sizing: border-box;
}

.portMenu {
	display: flex;
	flex-direction: row;
}


.services {
	list-style-type: none;
	display: flex;
	flex-wrap: wrap;
	align-content: flex-start;
	align-items: start;
	font-family: Arial Narrow, Arial, Helvetica, sans-serif;
	margin: 2em;

	&.waiting > li{
		opacity: 50%;
	}

	.service {
		margin: 0;
		padding: 0;
	}
}
</style>
