"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";

function CallbackHandler() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const accessToken = params.get("access_token");
    const expiresIn = params.get("expires_in");

    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem(
        "token_expires_at",
        String(Date.now() + Number(expiresIn) * 1000),
      );
    }

    router.push("/");
  }, [params, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Logging in...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-lg">Loading...</p>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
