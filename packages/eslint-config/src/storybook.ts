import * as mdxPlugin from "eslint-plugin-mdx";
import storybookPlugin from "eslint-plugin-storybook";
import { Config, defineConfig } from "eslint/config";

export const storybook = defineConfig(
  storybookPlugin.configs["flat/recommended"] as Config[],
  mdxPlugin.configs.flat,
  {
    ignores: [".storybook/**/*"],
  },
);
