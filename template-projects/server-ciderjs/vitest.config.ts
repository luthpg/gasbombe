import { mockGas } from "@ciderjs/vitest-plugin-gas-mock";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      include: ["src/**/*.ts"],
    },
  },
  plugins: [tsconfigPaths(), mockGas()],
});
