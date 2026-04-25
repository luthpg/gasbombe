/// <reference types="vitest/config" />

import { cityGasRouter } from "@ciderjs/city-gas/plugin";
import { gasnuki } from "@ciderjs/gasnuki/vite";
import { mockGas } from "@ciderjs/vitest-plugin-gas-mock";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import { gas } from "vite-plugin-google-apps-script";
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: "dist",
  },
  test: {
    environment: "jsdom",
    coverage: {
      include: ["src/**/*.ts", "src/**/*.vue", "server/**/*.ts"],
      exclude: ["src/generated/**/*"],
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    vue(),
    cityGasRouter(),
    gasnuki({
      srcDir: "server",
      outDir: "types/appsscript",
      outputFile: "client.ts",
    }),
    gas(),
    mockGas(),
    viteSingleFile(),
  ],
});
