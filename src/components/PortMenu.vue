<script setup lang="ts">
import usePortServices from "@/providers/PortServicesProvider/usePortServices.ts";
import InfoPane from "@/components/InfoPane/index.vue";
import PortDesktopItem from "@/components/PortDesktopItem.vue";
import {ref} from "vue";
import type {InfoPanelProps} from "@t/FrontendTypes.ts";
import type {UnifiedService} from "@t/Connection.ts";
import DefinitiveServiceProvider from "@/providers/DefinitiveServiceProvider/DefinitiveServiceProvider.vue";

const {unifiedServices} = usePortServices();

const selected = ref<string | undefined>();
const infoPanel = ref<InfoPanelProps>({type: "None"});

function go(_: Event, serviceUrl: string) {
	window.open(serviceUrl, "_blank");
}

function focusEvent(event: FocusEvent, uni: UnifiedService) {
	infoPanel.value = {
		type: "UnifiedService",
		item: uni
	};
	selected.value = uni.id;
}

function defocusClick(event: MouseEvent) {
	if (event.target !== event.currentTarget) return;
	selected.value = undefined;
	infoPanel.value = {type: "None"};
}
</script>

<template>
	<div class="portMenu" ref="portMenu">
		<InfoPane :="infoPanel" class="infoPanel"/>
		<ul :class="['services']">
			<li v-for="uni in unifiedServices" :key="uni.id">
				<DefinitiveServiceProvider :unified="uni">
					<PortDesktopItem
						:focus="selected === uni.id"
						@focus="focusEvent"
						@activate="go"
					/>
				</DefinitiveServiceProvider>
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

