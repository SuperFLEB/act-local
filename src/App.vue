<script setup lang="ts">
import PortInfoProvider from "@/providers/PortServicesProvider/PortServicesProvider.vue";
import ServerInfoProvider from "@/providers/ServerInfoProvider/ServerInfoProvider.vue";
import PortMenu from "@/components/PortMenu.vue";
import ConfigProvider from "@/providers/ConfigProvider/ConfigProvider.vue";
</script>


<template>
	<ConfigProvider>
		<ServerInfoProvider>
			<PortInfoProvider autoConnect>
				<PortMenu/>
			</PortInfoProvider>
		</ServerInfoProvider>
	</ConfigProvider>
</template>

<style scoped>
.app {
	color: #000;
	background-color: #fff;

	margin: 0;
	padding: 0;
	list-style-type: none;
	height: 100%;
}

@media (prefers-color-scheme: dark) {
	.app {
		color: #ccc;
		background-color: #000;
	}
}
</style>
