import * as Sentry from "@sentry/nextjs";

/**
 * This file configures the initialization of Sentry for edge features
 * (middleware, edge routes, and so on). The config you add here will be used
 * whenever one of the edge features is loaded. Note that this config is
 * unrelated to the Vercel Edge Runtime and is also required when running
 * locally.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
 */
Sentry.init({
  enabled: process.env.NODE_ENV === "production",
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,

  tracesSampleRate: 0.1,
});
