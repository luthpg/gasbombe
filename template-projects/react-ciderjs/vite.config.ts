/// <reference types="vitest/config" />

import { cityGasRouter } from "@ciderjs/city-gas/plugin";
import { gasnuki } from "@ciderjs/gasnuki/vite";
import { mockGas } from "@ciderjs/vitest-plugin-gas-mock";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { gas } from "vite-plugin-google-apps-script";
import { viteSingleFile } from "vite-plugin-singlefile";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: "dist",
  },
  test: {
    coverage: {
      include: ["src/**/*.ts", "src/**/*.tsx", "server/**/*.ts"],
    },
  },
  plugins: [
    react(),
    tsconfigPaths(),
    cityGasRouter(),
    gasnuki(),
    gas(),
    mockGas(),
    viteSingleFile(),
  ],
});
