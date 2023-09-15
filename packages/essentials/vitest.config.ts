import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "clover", "json", "lcov"],
      thresholdAutoUpdate: true,
      lines: 91.25,
      functions: 90.78,
      statements: 91.25,
      branches: 89.59,
      all: true,
    },
  },
});
