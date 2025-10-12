// This file configures the initialization of Sentry for edge features (middleware, edge functions, etc.)
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is separate from `sentry.server.config.ts` and `sentry.client.config.ts`.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment configuration
  environment: process.env.SENTRY_ENVIRONMENT || process.env.ENV_STAGE || "development",

  // Performance Monitoring for edge runtime
  // Lower sample rate for production to reduce costs
  tracesSampleRate: process.env.ENV_STAGE === "prod" ? 0.1 : 1.0,

  // Release tracking
  release: process.env.SENTRY_RELEASE || undefined,

  // Filter out certain errors
  beforeSend(event, hint) {
    // Filter out non-error events in production
    if (process.env.ENV_STAGE === "prod") {
      const error = hint.originalException;
      // Ignore specific errors
      if (error && typeof error === "object" && "message" in error) {
        const message = error.message as string;
        // Filter common non-critical errors
        if (
          message.includes("ECONNREFUSED") ||
          message.includes("ETIMEDOUT") ||
          message.includes("ENOTFOUND")
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