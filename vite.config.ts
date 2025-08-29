/// <reference types="vitest/config" />
/// <reference types="vite/client" />

import vue from "@vitejs/plugin-vue";
import * as path from "node:path";

const config = {
	plugins: [
		vue(),
	],
	base: "./",
	appType: "mpa", // disable history fallback
	build: {
		assetsInlineLimit: 0,

	},
	resolve: {
		alias: [
			{find: "@t", replacement: path.resolve(__dirname, "./src/types")},
			{find: "@", replacement: path.resolve(__dirname, "./src")},
		],
	},
	test: {
		projects: [
			{
				test: {
					name: "vitest",
					include: ["./tests/vitest/**/*.test.ts", "./tests/vitest/**/*.test.js"],
					environment: "jsdom",
					root: ".",
					alias: [
						{find: "@t", replacement: path.resolve(__dirname, "./src/types")},
						{find: "@", replacement: path.resolve(__dirname, "./src")},
					],
				}
			},
		]
	},
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:11180",
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, ''),
      }
    }
  }
};

export default config;
