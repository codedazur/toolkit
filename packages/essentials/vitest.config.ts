import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "clover", "json", "lcov"],
      thresholdAutoUpdate: true,
      lines: 91.28,
      functions: 90.9,
      statements: 91.28,
      branches: 89.71,
      all: true,
    },
  },
});
