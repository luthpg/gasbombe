import { defineConfig } from "vite";
import { gas } from "vite-plugin-google-apps-script";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  build: {
    outDir: "dist",
  },
  // Note: `gas()` is only required when using GAS scriptlets (`HtmlService.createTemplateFromFile()`).
  // If using `createHtmlOutputFromFile()`, remove `gas()` to avoid URL stripping in template literals and JSDoc removal.
  plugins: [gas(), viteSingleFile()],
});
