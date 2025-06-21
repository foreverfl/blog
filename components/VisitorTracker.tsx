"use client";

import { useEffect } from "react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

export default function VisitorTracker() {
  useEffect(() => {
    (async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      const fingerprint = result.visitorId;

      await fetch("/api/visitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fingerprint }),
      });
    })();
  }, []);
  return null;
}
