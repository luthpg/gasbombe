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
});
