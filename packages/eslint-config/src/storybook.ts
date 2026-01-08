import * as mdx from "eslint-plugin-mdx";
import storybook from "eslint-plugin-storybook";
import { Config, defineConfig } from "eslint/config";

export default defineConfig(
  storybook.configs["flat/recommended"] as Config[],
  mdx.configs.flat,
  {
    ignores: [".storybook/**/*"],
  },
);
