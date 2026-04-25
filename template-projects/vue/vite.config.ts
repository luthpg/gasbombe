/// <reference types="vitest/config" />

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
  },
  plugins: [vue(), gas(), viteSingleFile()],
});
