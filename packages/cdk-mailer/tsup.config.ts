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
  },
});
