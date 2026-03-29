// instrumentation.ts is used to initialize Sentry on both server and client side
// This file is automatically loaded by Next.js when the app starts
import * as Sentry from "@sentry/nextjs";

declare global {
  // eslint-disable-next-line no-var
  var __didImportOnStartup: boolean | undefined;
}

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");

    if (!globalThis.__didImportOnStartup) {
      globalThis.__didImportOnStartup = true;

      const rustApi =
        process.env.NEXT_PUBLIC_API_RUST_URL || "http://localhost:8002";
      const importSecret = process.env.IMPORT_SECRET || "";
      const headers = { "X-Import-Secret": importSecret };

      fetch(`${rustApi}/import/mdx`, { method: "POST", headers })
        .then(async (res) => {
          const data = await res.json();
          console.log("[import-mdx] result:", data);
        })
        .catch((e) => console.error("[import-mdx] failed:", e));

      fetch(`${rustApi}/import/json?from=250324`, { method: "POST", headers })
        .then(async (res) => {
          const data = await res.json();
          console.log("[import-json] job started:", data);
        })
        .catch((e) => console.error("[import-json] failed:", e));
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
