import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "clover", "json", "lcov"],
      thresholdAutoUpdate: true,
      lines: 91.83,
      functions: 90.81,
      statements: 91.83,
      branches: 91.17,
      all: true,
    },
  },
});
