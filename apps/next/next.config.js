/* eslint-disable @typescript-eslint/no-var-requires */
const { createVanillaExtractPlugin } = require("@vanilla-extract/next-plugin");
const { withSentryConfig } = require("@sentry/nextjs");

/**
 * @type {import("next").NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  transpilePackages: ["ui", "@codedazur/fusion-ui", "@codedazur/fusion-next"],
  /**
   * @todo The trailing slash redirects may cause issues when Next.js sends
   * preload requests (i.e. GET requests with the `_rsc` query parameter) for
   * links that contain a trailing slash, because when those are redirected to
   * drop the trailing slash, Next.js does not include the query parameter. If
   * the resulting response is cached, subsequent requests for the same route
   * will return the cached preload data instead of the actual page. When this
   * issue is fixed by Vercel (or if your project is not affected), we can
   * remove this setting.
   */
  skipTrailingSlashRedirect: true,
  experimental: {
    /**
     * The instrumentation hook is required for Sentry integration. This can be
     * removed when we upgrade to `next@15`.
     * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#create-initialization-config-files
     */
    instrumentationHook: true,
  },
  webpack(config) {
    return withUrlLoader(config, ["woff2"]);
  },
};

const withVanillaExtract = createVanillaExtractPlugin();

const withSentry = createSentryPlugin({
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  hideSourceMaps: true,
  widenClientFileUpload: true,
  /**
   * Uncomment the following line to enable tunneling for Sentry requests to
   * avoid ad blockers.
   * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#configure-tunneling-to-avoid-ad-blockers
   */
  // tunnelRoute: "/sentry/tunnel",
});

module.exports = withSentry(withVanillaExtract(nextConfig));

/**
 * @todo move to a shared location such as `@codedazur/webpack-essentials`.
 */
function withUrlLoader(config, modules) {
  return withLoaders(config, modules, ["url-loader"]);
}

/**
 * @todo move to a shared location such as `@codedazur/webpack-essentials`.
 */
function withLoaders(config, modules, loaders) {
  config.module.rules.push({
    test: new RegExp(`\\.(${modules.join("|")})$`),
    issuer: {
      and: [/\.(js|ts)x?$/],
    },
    use: loaders,
  });

  return config;
}

/**
 * @todo Check if this isn't already exorted by Sentry and otherwise move this
 * function to a shared location such as `@codedazur/webpack-essentials`.
 */
function createSentryPlugin(sentryConfig) {
  return function (nextConfig) {
    if (!sentryConfig.org || !sentryConfig.project) {
      return nextConfig;
    }

    return withSentryConfig(nextConfig, sentryConfig);
  };
}
