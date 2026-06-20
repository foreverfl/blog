"use client";

import { useState } from "react";

// Replacement for next's usePathname in a client-only island.
// In an Astro MPA every navigation is a full page reload, so the pathname is
// fixed for the island's lifetime — read it once from window on mount.
export function useClientPathname(): string {
  const [pathname] = useState(() =>
    typeof window !== "undefined" ? window.location.pathname : "/",
  );
  return pathname;
}
