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
