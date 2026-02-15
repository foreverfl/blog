// instrumentation.ts is used to initialize Sentry on both server and client side
// This file is automatically loaded by Next.js when the app starts
import * as Sentry from "@sentry/nextjs";

declare global {
  // eslint-disable-next-line no-var
  var __didSyncPostsOnStartup: boolean | undefined;
}

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");

    if (
      process.env.NODE_ENV === "development" &&
      !globalThis.__didSyncPostsOnStartup
    ) {
      globalThis.__didSyncPostsOnStartup = true;

      const { syncAllPosts } = await import("@/lib/postgres/sync-posts");
      syncAllPosts().catch((e) =>
        console.error("[sync-posts] Failed to sync posts on startup:", e),
      );
    }
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
