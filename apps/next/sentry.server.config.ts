import * as Sentry from "@sentry/nextjs";

/**
 * This file configures the initialization of Sentry on the server. The config
 * you add here will be used whenever the server handles a request.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
 */
Sentry.init({
  enabled: process.env.NODE_ENV === "production",
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,

  tracesSampleRate: 0.1,
});
