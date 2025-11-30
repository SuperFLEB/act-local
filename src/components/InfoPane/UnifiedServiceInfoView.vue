<script setup lang="ts">
import ServiceIcon from "@/components/ServiceIcon.vue";
import type {ServiceInfoPanelProps} from "@t/FrontendTypes.ts";
import {computed} from "vue";
import useConfig from "@/providers/ConfigProvider/useConfig.ts";
import {getDefinitiveService, getHostName} from "@/util/unifiedService.ts";
import {getUrl} from "@/util/service.ts";
import httpCode from "@/util/httpCode.ts";

const props = defineProps<ServiceInfoPanelProps>();

const configRef = useConfig();
const service = computed(() => getDefinitiveService(props.item, configRef.value.prefer, configRef.value.systemDefaultIpVersion));
const hostname = computed(() => getHostName(props.item, configRef.value.prefer));

const url = computed(() => getUrl(service.value, hostname.value, "/"));
</script>

<template>
	<section class="infoPane">
		<ServiceIcon :service :hostname class="infoServiceIcon"/>
		<h2>{{ service.title }}</h2>
		<table class="details">
			<tbody>
			<tr>
				<th>URL</th>
				<td><a :href="url" target="_blank">{{ url }}</a></td>
			</tr>
			<tr>
				<th>Port</th>
				<td>{{ service.port }}</td>
			</tr>
			<tr>
				<th>Status</th>
				<td class="status">
					<div>
						<div>{{ service.success ? "✔️" : "❌" }}</div>
						<div>{{ httpCode(service.httpStatus ?? "") }} ({{ service.httpStatus }})</div>
					</div>
				</td>
			</tr>
			<tr>
				<th>Application</th>
				<td>{{ service.command }}</td>
			</tr>
			<tr class="advanced">
				<th>USID</th>
				<td>{{ item.id }}</td>
			</tr>
			<tr class="advanced">
				<th>SID</th>
				<td>{{ service.id }}</td>
			</tr>
			</tbody>
		</table>
		<label class="details showMore"><input type="checkbox">Show More&hellip;</label>
	</section>
</template>

<style scoped>
@import "./infoPane.css";

.showMore {
	color: #666;
	border-top: 1px dotted #666;
	font-style: italic;
	text-align: center;
	display: block;
	padding: 1em;
	margin-top: 1em;

	input {
		display: none;
	}
}

.advanced {
	display: none;
}

.infoPane:has(.showMore input:checked) {
	.showMore {
		display: none;
	}

	.advanced {
		display: table-row;
	}
}

.details {
	th, td {
		height: 1.5em;
		vertical-align: top;
		line-height: 1.5em;
	}

	td.status > div {
		display: flex;
	}

	th {
		text-align: right;
		padding-right: 0.5em;
	}
}
</style>