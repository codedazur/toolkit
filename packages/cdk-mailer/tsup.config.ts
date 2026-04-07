import { defineConfig } from "tsup";
import fs from "fs";
import path from "path";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  onSuccess: async () => {
    fs.cpSync(
      path.join(__dirname, "src/functions"),
      path.join(__dirname, "dist/functions"),
      { recursive: true },
    );
    fs.cpSync(
      path.join(__dirname, "src/utilities"),
      path.join(__dirname, "dist/utilities"),
      { recursive: true, filter: (src) => !src.endsWith(".test.ts") },
    );
    fs.cpSync(
      path.join(__dirname, "src/types"),
      path.join(__dirname, "dist/types"),
      { recursive: true },
    );
  },
});
