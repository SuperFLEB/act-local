<script setup lang="ts">
import k from "./keys.ts";
import type {Service, UnifiedService} from "@t/Connection.ts";
import useConfig from "@/providers/ConfigProvider/useConfig.ts";
import type {PortPreferences} from "@/config.ts";
import {computed, provide, type Ref} from "vue";
import {getDefinitiveService, getHostName} from "@/util/unifiedService.ts";

type Props = { unified: UnifiedService, portPreferences?: PortPreferences };
const props = defineProps<Props>();

const configRef = useConfig();

const service = computed(() => getDefinitiveService(props.unified, props.portPreferences ?? configRef.value.prefer, configRef.value.systemDefaultIpVersion));
const hostname = computed(() => getHostName(props.unified, props.portPreferences ?? configRef.value.prefer));
const unified = computed(() => props.unified);

provide<Ref<UnifiedService>>(k.UNIFIED, unified);
provide<Ref<Service>>(k.SERVICE, service);
provide<Ref<string>>(k.HOSTNAME, hostname);

</script>
<template>
	<slot v-if="unified && service && hostname !== undefined" />
</template>