import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/cdk.ts",
    "src/next.ts",
    "src/react.ts",
    "src/sanity.ts",
    "src/storybook.ts",
  ],
  format: "esm",
  dts: true,
  clean: true,
  skipNodeModulesBundle: true,
});
