// instrumentation.ts is used to initialize Sentry on both server and client side
// This file is automatically loaded by Next.js when the app starts
import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// onRequestError is called when a React Server Component throws an error
export async function onRequestError(
  error: Error,
  request: {
    path: string;
    method: string;
    headers: Record<string, string>;
  },
) {
  Sentry.withScope((scope) => {
    scope.setTag("runtime", process.env.NEXT_RUNTIME || "unknown");
    scope.setTag("component", "server");
    scope.setContext("request", {
      path: request.path,
      method: request.method,
    });
    Sentry.captureException(error);
  });
}
