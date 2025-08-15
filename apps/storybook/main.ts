import { StorybookConfig } from "@storybook/nextjs";
import { VanillaExtractPlugin } from "@vanilla-extract/webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import { dirname, join, resolve } from "path";
import { Configuration } from "webpack";

const config: StorybookConfig = {
  staticDirs: ["./public"],
  stories: [
    "./stories/**/*.mdx",
    "./stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-docs"),
    createVanillaExtractAddon(),
  ],
  framework: {
    name: getAbsolutePath("@storybook/nextjs"),
    options: {
      nextConfigPath: resolve(__dirname, "../next/next.config.js"),
    },
  },
  webpackFinal: async (config) => {
    config = withTranspileModules(config, [
      getAbsolutePath("@codedazur/fusion-ui"),
      getAbsolutePath("@apps/next"),
    ]);

    return config;
  },
};

export default config;

/**
 * Although both Storybook and Vanilla Extract have official integrations for
 * Next.js, there is no official integration for using them together. Instead,
 * we have to explicitly configure the webpack plugin for Vanilla Extract. This
 * configuration was generated using `npx @storybook/auto-config@latest` after
 * installing the `@storybook/addon-styling-webpack` addon.
 * @see https://storybook.js.org/addons/@storybook/addon-styling-webpack
 */
function createVanillaExtractAddon() {
  return {
    name: getAbsolutePath("@storybook/addon-styling-webpack"),
    options: {
      plugins: [new VanillaExtractPlugin(), new MiniCssExtractPlugin()],
      rules: [
        {
          test: /\.css$/,
          sideEffects: true,
          use: [
            require.resolve("style-loader"),
            {
              loader: require.resolve("css-loader"),
              options: {},
            },
          ],
          exclude: /\.vanilla\.css$/,
        },
        {
          test: /\.vanilla\.css$/i,
          sideEffects: true,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: require.resolve("css-loader"),
              options: {
                url: false,
              },
            },
          ],
        },
      ],
    },
  };
}

/**
 * Takes a webpack configuration and some module names and configures webpack to
 * transpile those modules using Babel.
 */
function withTranspileModules(
  config: Configuration,
  modules: string[],
): Configuration {
  if (!config.module) config.module = { rules: [] };
  if (!config.module.rules) config.module.rules = [];

  config.module.rules.push({
    test: /\.(js|jsx|ts|tsx)$/,
    include: modules,
    use: [
      {
        loader: require.resolve("babel-loader"),
        options: {
          presets: [["next/babel", { flow: false, typescript: true }]],
        },
      },
    ],
  });

  return config;
}

/**
 * This function is used to resolve the absolute path of a package. It is needed
 * in projects that use Yarn PnP or are set up within a monorepo.
 *
 * The return value is typed as `T` despite technically being `string`, so that
 * the Storybook configuration still considers the input string as a literal,
 * allowing it to determine the add-on options type using unions.
 */
function getAbsolutePath<T extends string>(value: T): T {
  return dirname(require.resolve(join(value, "package.json"))) as T;
}
