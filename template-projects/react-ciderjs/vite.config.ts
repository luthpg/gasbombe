/// <reference types="vitest/config" />

import path from "node:path";
import { cityGasRouter } from "@ciderjs/city-gas/plugin";
import { gasnuki } from "@ciderjs/gasnuki/vite";
import { mockGas } from "@ciderjs/vitest-plugin-gas-mock";
import react from "@vitejs/plugin-react";
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
    setupFiles: ["./tests/vitest.setup.ts"],
    coverage: {
      include: ["src/**/*.ts", "src/**/*.tsx", "server/**/*.ts"],
      exclude: ["src/generated/**/*"],
    },
    alias: [
      {
        find: /^\/(.*\.(svg|png|jpg|jpeg|gif|webp|ico))$/,
        replacement: path.resolve(__dirname, "public/$1"),
      },
    ],
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    react(),
    cityGasRouter(),
    gasnuki(),
    gas(),
    mockGas(),
    viteSingleFile(),
  ],
});
