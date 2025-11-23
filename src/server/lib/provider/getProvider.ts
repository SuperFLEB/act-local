import type Provider from "@/server/lib/provider/Provider.ts";
import LsofProvider from "@/server/lib/provider/LsofProvider.ts";
import WindowsNetstatProvider from "@/server/lib/provider/WindowsNetstatProvider.ts";

export default async function getProvider(): Promise<Provider | null> {
	return (
		await LsofProvider.create() ??
		await WindowsNetstatProvider.create() ??
		null
	);
}