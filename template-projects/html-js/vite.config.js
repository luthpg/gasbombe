import { defineConfig } from "vite";
import { gas } from "vite-plugin-google-apps-script";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  build: {
    outDir: "dist",
  },
  plugins: [gas(), viteSingleFile()],
});
