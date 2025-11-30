import type {Config} from "@/config.ts";
import {ComposableOutOfContextError} from "@/errors.ts";
import {inject, type Ref} from "vue";
import k from "./keys.ts";

export default function useConfig(): Ref<Config> {
	const config = inject<Ref<Config>>(k.CONFIG);
	if (!config) throw new ComposableOutOfContextError("Cannot use useConfig outside of a ConfigProvider");
	return config;
}