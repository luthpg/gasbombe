/// <reference types="vitest/config" />

import path from "node:path";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import { gas } from "vite-plugin-google-apps-script";
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vite.dev/config/
export default defineConfig({
  test: {
    environment: "jsdom",
  },
  resolve: {
    tsconfigPaths: true,
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "~": path.resolve(import.meta.dirname, "./"),
    },
  },
  // Note: `gas()` is only required when using GAS scriptlets (`HtmlService.createTemplateFromFile()`).
  // If using `createHtmlOutputFromFile()`, remove `gas()` to avoid URL stripping in template literals and JSDoc removal.
  plugins: [vue(), gas(), viteSingleFile()],
});
