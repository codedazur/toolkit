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
      lines: 55.58,
      functions: 44.44,
      branches: 80,
      statements: 55.58,
      all: true,
    },
  },
});
