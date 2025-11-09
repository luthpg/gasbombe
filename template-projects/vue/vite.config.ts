/// <reference types="vitest" />

import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import { gas } from "vite-plugin-google-apps-script";
import { viteSingleFile } from "vite-plugin-singlefile";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tsconfigPaths({
      loose: true,
    }),
    gas(),
    viteSingleFile(),
  ],
});
