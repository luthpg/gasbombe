/// <reference types="vitest/config" />

import path from "node:path";
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
    alias: [
      {
        find: /^\/([^/]+\.(svg|png|jpg|jpeg|gif|webp|ico))$/,
        replacement: path.resolve(import.meta.dirname, "public/$1"),
      },
    ],
  },
  resolve: {
    tsconfigPaths: true,
  },
  // Note: `gas()` is only required when using GAS scriptlets (`HtmlService.createTemplateFromFile()`).
  // If using `createHtmlOutputFromFile()`, remove `gas()` to avoid URL stripping in template literals and JSDoc removal.
  plugins: [react(), gas(), viteSingleFile()],
});
