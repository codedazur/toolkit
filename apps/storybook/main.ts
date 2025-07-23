import { StorybookConfig } from "@storybook/react-vite";
import { dirname, join } from "path";

const config: StorybookConfig = {
  stories: ["./stories/**/*.stories.@(js|jsx|ts|tsx)"],

  addons: [
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-docs"),
  ],

  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },
};

export default config;

/**
 * The return value is typed as `T` despite technically being `string`, so that
 * the Storybook configuration still considers the input string as a literal,
 * allowing it to determine the add-on options type using unions.
 */
function getAbsolutePath<T extends string>(value: T): T {
  return dirname(require.resolve(join(value, "package.json"))) as T;
}
