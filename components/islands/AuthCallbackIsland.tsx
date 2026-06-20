"use client";

import Providers from "@/components/Providers";
import { useAuth } from "@/lib/context/auth-context";
import { useEffect } from "react";

// Handles the OAuth redirect: the backend sends the browser to
// /auth/callback?access_token=...&expires_in=..., we persist the token,
// refresh the auth state, then bounce to the home page.
function CallbackHandler() {
  const { refreshAuth } = useAuth();

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get("access_token");
      const expiresIn = params.get("expires_in");

      if (accessToken) {
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem(
          "token_expires_at",
          String(Date.now() + Number(expiresIn) * 1000),
        );
        await refreshAuth();
      }

      window.location.href = "/";
    };

    run();
  }, [refreshAuth]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Logging in...</p>
    </div>
  );
}

export default function AuthCallbackIsland() {
  return (
    <Providers>
      <CallbackHandler />
    </Providers>
  );
}
