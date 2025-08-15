import * as Sentry from "@sentry/nextjs";

/**
 * This file configures the initialization of Sentry on the client. The config
 * you add here will be used whenever a users loads a page in their browser.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
 */
Sentry.init({
  enabled: process.env.NODE_ENV === "production",
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,

  tracesSampleRate: 0.1,
  replaysOnErrorSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
});
