import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "clover", "json", "lcov"],
      thresholdAutoUpdate: true,
      lines: 91.79,
      functions: 90.62,
      statements: 91.79,
      branches: 91,
      all: true,
    },
  },
});
