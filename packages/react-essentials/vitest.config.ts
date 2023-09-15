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
      lines: 9.53,
      functions: 33.33,
      branches: 53.84,
      statements: 9.53,
      all: true,
    },
  },
});
