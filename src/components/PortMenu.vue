<script setup lang="ts">
import usePortServices from "@/providers/PortServicesProvider/usePortServices.ts";
import InfoPane from "@/components/InfoPane/index.vue";
import ServiceDesktopItem from "@/components/ServiceDesktopItem.vue";
import {ref} from "vue";
import type {InfoPanelProps} from "@t/FrontendTypes.ts";
import type { Service } from "@/types/Service";
import {serviceUrl} from "@/util/service.ts";

const {services: liveServices} = usePortServices();

const selected = ref<Service | undefined>();
const infoPanel = ref<InfoPanelProps>({type: "None"});

function go(_: Event, service: Service) {
	window.open(serviceUrl(service), "_blank");
}

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
	infoPanel.value = {type: "None"};
}
</script>

<template>
	<div class="portMenu" ref="portMenu">
		<InfoPane :="infoPanel" class="infoPanel" />
		<ul :class="['services']">
			<li v-for="service in liveServices" :key="service.id">
				<ServiceDesktopItem
					:service
					:focus="selected === service"
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

	&.waiting > li {
		opacity: 50%;
	}

	.service {
		margin: 0;
		padding: 0;
	}
}
</style>

