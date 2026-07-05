"use client";

import { listBuckets } from "@/lib/assets/api";
import { useAuth } from "@/lib/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";

// Admin-only asset file manager (skeleton — list/upload UI comes in later units).
const AssetsContent: React.FC = () => {
  const { isReady, isAdmin } = useAuth();

  const { data: bucketData } = useQuery({
    queryKey: ["assets", "buckets"],
    queryFn: listBuckets,
    enabled: isReady && isAdmin,
  });

  // null until the admin picks one; fall back to the server default.
  const [pickedBucket, setPickedBucket] = useState<string | null>(null);
  const selectedBucket = pickedBucket ?? bucketData?.default;

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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Assets</h1>
          <select
            value={selectedBucket ?? ""}
            onChange={(event) => setPickedBucket(event.target.value)}
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-neutral-800"
          >
            {(bucketData?.buckets ?? []).map((bucketName) => (
              <option key={bucketName} value={bucketName}>
                {bucketName}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default AssetsContent;
