// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment configuration
  environment: process.env.SENTRY_ENVIRONMENT || process.env.ENV_STAGE || "development",

  // Performance Monitoring
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.ENV_STAGE === "prod" ? 0.1 : 1.0,

  // Release tracking
  release: process.env.SENTRY_RELEASE || undefined,

  // Session Replay
  replaysOnErrorSampleRate: 1.0, // Capture 100% of sessions with errors
  replaysSessionSampleRate: process.env.ENV_STAGE === "prod" ? 0.1 : 0.5, // Sample rate for normal sessions

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      // Mask sensitive content
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: false,
      // Sampling options
      networkDetailAllowUrls: process.env.NEXT_PUBLIC_BASE_URL
        ? [process.env.NEXT_PUBLIC_BASE_URL]
        : [],
    }),
    Sentry.browserTracingIntegration(),
  ],

  // Filter out certain errors
  beforeSend(event, hint) {
    // Filter out non-error events in production
    if (process.env.ENV_STAGE === "prod") {
      const error = hint.originalException;
      // Ignore specific errors
      if (error && typeof error === "object" && "message" in error) {
        const message = error.message as string;
        // Filter network errors, canceled requests, etc.
        if (
          message.includes("Network request failed") ||
          message.includes("Failed to fetch") ||
          message.includes("Load failed") ||
          message.includes("Non-Error promise rejection captured")
        ) {
          return null;
        }
      }
    }
    return event;
  },

  // Ignore certain transactions
  ignoreTransactions: ["/api/health", "/_next", "/monitoring"],
});

// Export the hook required for navigation tracking
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;