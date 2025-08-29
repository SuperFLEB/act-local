<script setup lang="ts">
import PortMenu from "@/components/PortMenu.vue";
import PortInfoProvider from "@/providers/PortInfoProvider/PortInfoProvider.vue";
import ServerInfoProvider from "@/providers/ServerInfoProvider/ServerInfoProvider.vue";
</script>

<template>
	<ServerInfoProvider>
		<PortInfoProvider>
			<PortMenu/>
		</PortInfoProvider>
	</ServerInfoProvider>
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
