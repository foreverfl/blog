"use client";

import Pagination from "@/components/molecules/Pagination";
import { listAssets, listBuckets } from "@/lib/assets/api";
import { useAuth } from "@/lib/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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

  const [page, setPage] = useState(1);
  const { data: assetData, isLoading } = useQuery({
    queryKey: ["assets", selectedBucket, page],
    queryFn: () => listAssets(selectedBucket as string, page),
    enabled: !!selectedBucket,
  });
  const totalPages = assetData
    ? Math.max(1, Math.ceil(assetData.total / assetData.per_page))
    : 1;

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
            onChange={(event) => {
              setPickedBucket(event.target.value);
              setPage(1);
            }}
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-neutral-800"
          >
            {(bucketData?.buckets ?? []).map((bucketName) => (
              <option key={bucketName} value={bucketName}>
                {bucketName}
              </option>
            ))}
          </select>
        </div>

        {isLoading && <p className="mt-6 text-sm text-gray-500">Loading…</p>}
        {assetData && assetData.items.length === 0 && (
          <p className="mt-6 text-sm text-gray-500">
            No assets in this bucket.
          </p>
        )}

        <ul className="mt-6 divide-y divide-gray-200 dark:divide-gray-700">
          {assetData?.items.map((asset) => (
            <li key={asset.id} className="flex items-center gap-4 py-3">
              {asset.kind === "image" && asset.url ? (
                <img
                  src={asset.url}
                  alt={asset.file_name}
                  className="h-12 w-12 shrink-0 rounded object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-gray-100 text-xs text-gray-500 dark:bg-neutral-800">
                  {asset.kind}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate">{asset.file_name}</p>
                <p className="text-sm text-gray-500">
                  {formatBytes(asset.size_bytes)} · {asset.kind}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

export default AssetsContent;
