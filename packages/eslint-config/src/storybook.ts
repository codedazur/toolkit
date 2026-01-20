import * as mdxPlugin from "eslint-plugin-mdx";
import storybookPlugin from "eslint-plugin-storybook";
import { Config, defineConfig } from "eslint/config";

export default defineConfig(
  storybookPlugin.configs["flat/recommended"] as Config[],
  mdxPlugin.configs.flat,
  {
    ignores: [".storybook/**/*"],
  },
);
