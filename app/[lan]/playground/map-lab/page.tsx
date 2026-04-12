"use client";

import { useEffect, useState } from "react";
import MapLab from "@/components/organism/playground/MapLab";

const AUTH_API_URL =
  process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:8001";

const ADMIN_EMAILS =
  process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",").map((e) => e.trim()) ?? [];

export default function Page() {
  const [status, setStatus] = useState<"loading" | "authorized" | "denied">(
    "loading",
  );

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setStatus("denied");
          return;
        }

        const res = await fetch(`${AUTH_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          setStatus("denied");
          return;
        }

        const data = await res.json();
        setStatus(ADMIN_EMAILS.includes(data.email) ? "authorized" : "denied");
      } catch {
        setStatus("denied");
      }
    };

    checkAdmin();
  }, []);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-gray-400 animate-pulse">Loading...</span>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400">
          Access denied. Admin login required.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full md:w-4/5 lg:w-3/5">
        <MapLab />
      </div>
    </div>
  );
}
