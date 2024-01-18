import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "clover", "json", "lcov"],
      thresholdAutoUpdate: true,
      lines: 92,
      functions: 91.66,
      statements: 92,
      branches: 91.04,
      all: true,
    },
  },
});
