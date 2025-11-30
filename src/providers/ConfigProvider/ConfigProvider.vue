<script setup lang="ts">
import {onMounted, provide, ref} from "vue";
import getConfig, {type Config} from "@/config.ts";
import k from "./keys.ts";

const config = ref<Config|undefined>();
onMounted(() => getConfig().then(c => config.value = c));
provide(k.CONFIG, config);
</script>
<template>
<slot v-if="config" />
</template>