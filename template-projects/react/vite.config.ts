/// <reference types="vitest/config" />

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
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [react(), gas(), viteSingleFile()],
});
