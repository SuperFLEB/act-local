<script setup lang="ts">
import type {NoneInfoPanelProps} from "@t/FrontendTypes.ts";
defineProps<NoneInfoPanelProps>();
</script>
<template>
	<section class="infoPane">
		<h2>Act Local</h2>
		<p>To the right is a list of all open ports serving HTTP and HTTPS services on the local host. Double-click any
			of them to open the page in a new window.</p>
	</section>
</template>
<style scoped>
@import "./infoPane.css";
</style>