<script setup lang="ts">
import ServiceIcon from "@/components/ServiceIcon.vue";
import {serviceUrl} from "@/util/service.ts";
import type {ServiceInfoPanelProps} from "@t/FrontendTypes.ts";
import {computed} from "vue";

const props = defineProps<ServiceInfoPanelProps>();
const url = computed(() => serviceUrl(props.item))
</script>

<template>
	<section class="infoPane">
		<ServiceIcon :service="props.item" class="infoServiceIcon"/>
		<h2>{{ props.item.title }}</h2>
		<table>
			<tbody>
			<tr>
				<th>Port</th>
				<td>{{ props.item.port }}</td>
			</tr>
			<tr>
				<th>URL</th>
				<td><a :href="url">{{ url }}</a></td>
			</tr>
			</tbody>
		</table>
	</section>
</template>

<style scoped>
@import "./infoPane.css";
</style>