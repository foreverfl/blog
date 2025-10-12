"use client";

import * as Sentry from "@sentry/nextjs";
import Error from "next/error";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body className="bg-gray-100">
        <div className="flex min-h-screen flex-col items-center justify-center p-5">
          <div className="w-full max-w-lg rounded-lg bg-white p-10 shadow-sm">
            <h1 className="mb-4 text-2xl font-bold text-gray-900">
              Application Error
            </h1>
            <p className="mb-6 leading-relaxed text-gray-600">
              A client-side exception has occurred. The error has been reported
              to our team and we'll look into it as soon as possible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={reset}
                className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
              >
                Go Home
              </button>
            </div>
            {process.env.NODE_ENV === "development" && error.digest && (
              <div className="mt-6 rounded bg-red-50 p-3 font-mono text-xs text-red-900">
                Error ID: {error.digest}
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}