import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "clover", "json", "lcov"],
      thresholdAutoUpdate: true,
      lines: 91.23,
      functions: 91.66,
      branches: 89.93,
      statements: 91.23,
      all: true,
    },
  },
});
