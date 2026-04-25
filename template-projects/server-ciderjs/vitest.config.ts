import { mockGas } from "@ciderjs/vitest-plugin-gas-mock";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      include: ["src/**/*.ts"],
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [mockGas()],
});
