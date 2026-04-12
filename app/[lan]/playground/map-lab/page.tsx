"use client";

import { useAuth } from "@/lib/context/auth-context";
import MapLab from "@/components/organism/playground/MapLab";

export default function Page() {
  const { isReady, isAdmin } = useAuth();

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-gray-400 animate-pulse">Loading...</span>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400">
          Access denied. Admin login required.
        </p>
      </div>
    );
  }

  return <MapLab />;
}
