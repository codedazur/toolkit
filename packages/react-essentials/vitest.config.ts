import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./test/setup.ts",
    passWithNoTests: true,
    coverage: {
      provider: "c8",
      reporter: ["text", "html", "clover", "json", "lcov"],
      exclude: ["./test/setup.ts"],
    },
  },
});
