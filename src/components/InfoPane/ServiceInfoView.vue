<script setup lang="ts">
import ServiceIcon from "@/components/ServiceIcon.vue";
import type {ServiceInfoPanelProps} from "@t/FrontendTypes.ts";

const props = defineProps<ServiceInfoPanelProps>();
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
				<td><a :href="props.item.url">{{ props.item.url }}</a></td>
			</tr>
			</tbody>
		</table>

<!--		<pre v-if="props.item.netstat">{{ props.item.netstat }}</pre>-->
	</section>
</template>

<style scoped>
@import "./infoPane.css";
</style>