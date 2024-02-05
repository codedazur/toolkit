import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./test/setup.ts",
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "clover", "json", "lcov"],
      exclude: ["./test/setup.ts"],
      thresholdAutoUpdate: true,
      lines: 36.51,
      functions: 28.57,
      branches: 73.33,
      statements: 36.51,
      all: true,
    },
  },
});
