import { defineConfig } from "rolldown";
import { removeExportPlugin } from "rolldown-plugin-remove-export";

const outputFile = "app.js";

export default defineConfig({
  input: "src/app.js",
  output: {
    format: "esm",
    file: `dist/${outputFile}`,
  },
  plugins: [removeExportPlugin(outputFile)],
});
