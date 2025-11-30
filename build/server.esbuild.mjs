import * as esbuild from 'esbuild';
import {fileURLToPath} from "node:url";
import {dirname, join} from "node:path";
import * as fs from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const home = (...paths) => join(__dirname, "../", ...paths);

const entryPoints = [home("src/server.ts")];

console.log(`Building ${entryPoints.join("+")}`);

const defines = (definesObject) => Object.fromEntries(
	Object.entries(definesObject)
		.map(([env, defaultValue]) => [`process.env.DEFAULT_${env}`, process.env[env] ?? defaultValue])
)

const httpPort = process.env.ACT_LOCAL_HTTP_PORT ?? "8880";
const wsPort = process.env.ACT_LOCAL_WS_PORT ?? (Number(httpPort) + 1).toString();

const options = {
	tsconfig: home("tsconfig.server.json"),
	entryPoints,
	bundle: true,
	outfile: home("dist/server.js"),
	format: 'cjs',
	platform: 'node',
	target: ['node16'],
	external: ["./node_modules/*"],
	metafile: true,
	define: defines({
		"ACT_LOCAL_HTTP_PORT": httpPort,
		"ACT_LOCAL_WS_PORT": wsPort,
	}),
	banner: {
		js: "#!/usr/bin/env node"
	}
};

console.log("Building with options:\n", options);

const result = await esbuild.build(options);
for (const e of result.errors) {
	console.error("   [ERROR]:", e);
}
for (const w of result.warnings) {
	console.warn("   [WARNING]:", w);
}
for (const f of Object.entries(result.metafile.outputs)) {
	console.log(` - Wrote ${f[0]}: ${f[1].bytes} bytes`);
}

console.log("Done.");