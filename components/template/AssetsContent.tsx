"use client";

import { useAuth } from "@/lib/context/auth-context";
import React from "react";

// Admin-only asset file manager (skeleton — list/upload UI comes in later units).
const AssetsContent: React.FC = () => {
  const { isReady, isAdmin } = useAuth();

  // Wait for the auth check to avoid a "not found" flash for the admin.
  if (!isReady) return null;

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Page not found</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-screen">
      <div className="w-full px-5 md:w-3/5 my-56">
        <h1 className="text-2xl font-bold">Assets</h1>
      </div>
    </div>
  );
};

export default AssetsContent;
