"use client";

import Pagination from "@/components/molecules/Pagination";
import { AssetResponse, listAssets, listBuckets } from "@/lib/assets/api";
import { useAuth } from "@/lib/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
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
  const [selectedAsset, setSelectedAsset] = useState<AssetResponse | null>(
    null,
  );
  const { data: assetData, isLoading } = useQuery({
    queryKey: ["assets", selectedBucket, page],
    queryFn: () => listAssets(selectedBucket as string, page),
    enabled: !!selectedBucket,
  });
  const totalPages = assetData
    ? Math.max(1, Math.ceil(assetData.total / assetData.per_page))
    : 1;

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyUrl = (asset: AssetResponse) => {
    navigator.clipboard.writeText(asset.url);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Shared by the desktop side pane and the mobile bottom sheet.
  const previewContent = selectedAsset && (
    <div className="space-y-3">
      {selectedAsset.kind === "image" && selectedAsset.url ? (
        <img
          src={selectedAsset.url}
          alt={selectedAsset.file_name}
          className="max-h-80 w-full rounded object-contain"
        />
      ) : (
        <div className="flex h-40 items-center justify-center rounded bg-gray-100 text-gray-500 dark:bg-neutral-800">
          {selectedAsset.kind}
        </div>
      )}
      <div className="space-y-1 text-sm">
        <div className="flex items-start justify-between gap-2">
          <p className="break-all font-medium">{selectedAsset.file_name}</p>
          <button
            onClick={() => copyUrl(selectedAsset)}
            className="shrink-0 rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-neutral-800"
          >
            {copiedId === selectedAsset.id ? "Copied!" : "Copy URL"}
          </button>
        </div>
        <p className="text-gray-500">
          {selectedAsset.mime_type} · {formatBytes(selectedAsset.size_bytes)}
          {selectedAsset.width && selectedAsset.height
            ? ` · ${selectedAsset.width}×${selectedAsset.height}`
            : ""}
        </p>
        <p className="text-gray-500">
          {new Date(selectedAsset.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  );

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

        <div className="mt-6 grid gap-6 landscape:grid-cols-2">
          <div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {assetData?.items.map((asset) => (
                <li key={asset.id} className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedAsset(asset)}
                    className={`flex min-w-0 flex-1 items-center gap-4 rounded px-2 py-3 text-left ${
                      selectedAsset?.id === asset.id
                        ? "bg-gray-100 dark:bg-neutral-800"
                        : "hover:bg-gray-50 dark:hover:bg-neutral-900"
                    }`}
                  >
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
                  </button>
                  <button
                    onClick={() => copyUrl(asset)}
                    className="shrink-0 rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-neutral-800"
                  >
                    {copiedId === asset.id ? "Copied!" : "Copy"}
                  </button>
                </li>
              ))}
            </ul>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>

          <aside className="hidden h-fit rounded border border-gray-200 p-4 dark:border-gray-700 landscape:block">
            {previewContent || (
              <p className="text-sm text-gray-500">Select a file to preview.</p>
            )}
          </aside>
        </div>

        {/* Narrow screens: preview slides up from the bottom instead of
            sitting below the fold. */}
        <AnimatePresence>
          {selectedAsset && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.2 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t border-gray-200 bg-white p-4 shadow-2xl dark:border-gray-700 dark:bg-neutral-900 landscape:hidden"
            >
              <div className="mb-2 flex justify-end">
                <button
                  onClick={() => setSelectedAsset(null)}
                  aria-label="Close preview"
                  className="rounded px-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800"
                >
                  ✕
                </button>
              </div>
              {previewContent}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AssetsContent;
