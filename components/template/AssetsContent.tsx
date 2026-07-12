"use client";

import FileIcon from "@/components/atom/FileIcon";
import ConfirmModal from "@/components/modal/ConfirmModal";
import Pagination from "@/components/molecules/Pagination";
import {
  AssetResponse,
  deleteAsset,
  listAssets,
  listBuckets,
  uploadAssets,
} from "@/lib/assets/api";
import { useAuth } from "@/lib/context/auth-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import React, { useRef, useState } from "react";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Only text-like assets get an inline content preview; the rest stay an icon.
const PREVIEW_MAX_BYTES = 64 * 1024;

// Synced assets carry a guessed mime (often octet-stream), so fall back to the
// file extension — otherwise a .json synced by the pipeline never previews.
const TEXT_EXTENSIONS = [
  "json",
  "txt",
  "md",
  "csv",
  "log",
  "xml",
  "yaml",
  "yml",
];

function isTextLike(asset: { mime_type: string; file_name: string }) {
  if (
    asset.mime_type === "application/json" ||
    asset.mime_type.startsWith("text/")
  ) {
    return true;
  }
  const extension = asset.file_name.split(".").pop()?.toLowerCase();
  return !!extension && TEXT_EXTENSIONS.includes(extension);
}

// Fetch just the head of the object (Range caps huge files like the 1.5MB json).
async function fetchTextPreview(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { Range: `bytes=0-${PREVIEW_MAX_BYTES - 1}` },
  });
  if (!res.ok) throw new Error(`Preview failed (${res.status})`);
  const text = (await res.text()).slice(0, PREVIEW_MAX_BYTES);
  // Pretty-print when the (possibly truncated) body is still complete JSON.
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

// Admin-only asset file manager (skeleton — list/upload UI comes in later units).
const AssetsContent: React.FC = () => {
  const { isReady, isAdmin } = useAuth();

  // Local UI state.
  const [pickedBucket, setPickedBucket] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState<AssetResponse | null>(
    null,
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Server state (react-query).
  const queryClient = useQueryClient();
  const { data: bucketData } = useQuery({
    queryKey: ["assets", "buckets"],
    queryFn: listBuckets,
    enabled: isReady && isAdmin,
  });
  const selectedBucket = pickedBucket ?? bucketData?.default;
  const { data: assetData, isLoading } = useQuery({
    queryKey: ["assets", selectedBucket, page],
    queryFn: () => listAssets(selectedBucket as string, page),
    enabled: !!selectedBucket,
  });
  const canPreviewText = !!selectedAsset && isTextLike(selectedAsset);
  const {
    data: textPreview,
    isLoading: textLoading,
    isError: textError,
  } = useQuery({
    queryKey: ["asset-text", selectedAsset?.id],
    queryFn: () => fetchTextPreview(selectedAsset!.url),
    enabled: canPreviewText,
  });
  const uploadMutation = useMutation({
    mutationFn: (files: File[]) =>
      uploadAssets(selectedBucket as string, files),
    onSuccess: (uploaded) => {
      // Drop every cached page of this bucket; new items sort first.
      queryClient.invalidateQueries({ queryKey: ["assets", selectedBucket] });
      setPage(1);
      if (uploaded.length > 0) setSelectedAsset(uploaded[0]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets", selectedBucket] });
      // Deleting the last item of a page would leave an empty page behind.
      if (assetData?.items.length === 1 && page > 1) setPage(page - 1);
      setSelectedAsset(null);
      setConfirmingDelete(false);
    },
  });

  // Derived values and handlers.
  const totalPages = assetData
    ? Math.max(1, Math.ceil(assetData.total / assetData.per_page))
    : 1;
  const copyUrl = (asset: AssetResponse) => {
    navigator.clipboard.writeText(asset.url);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 1500);
  };
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0 || !selectedBucket) return;
    uploadMutation.mutate(Array.from(files));
  };

  const renderMedia = () => {
    if (!selectedAsset) return null;
    if (selectedAsset.kind === "image" && selectedAsset.url) {
      return (
        <img
          src={selectedAsset.url}
          alt={selectedAsset.file_name}
          className="max-h-80 w-full rounded object-contain"
        />
      );
    }
    if (canPreviewText) {
      let body;
      if (textLoading) {
        body = <p className="p-3 text-sm text-gray-500">Loading…</p>;
      } else if (textError) {
        body = <p className="p-3 text-sm text-red-500">Preview unavailable.</p>;
      } else {
        body = (
          <pre className="whitespace-pre-wrap break-all p-3 text-xs">
            {textPreview}
          </pre>
        );
      }
      return (
        <div className="max-h-80 overflow-auto rounded bg-gray-100 dark:bg-neutral-800">
          {body}
        </div>
      );
    }
    return (
      <div className="flex h-40 items-center justify-center rounded bg-gray-100 text-gray-400 dark:bg-neutral-800">
        <FileIcon kind={selectedAsset.kind} className="h-16 w-16" />
      </div>
    );
  };

  // Shared by the desktop side pane and the mobile bottom sheet.
  const previewContent = selectedAsset && (
    <div className="space-y-3">
      {renderMedia()}
      <div className="space-y-1 text-sm">
        <div className="flex items-start justify-between gap-2">
          <p className="break-all font-medium">{selectedAsset.file_name}</p>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => copyUrl(selectedAsset)}
              className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-neutral-800"
            >
              {copiedId === selectedAsset.id ? "Copied!" : "Copy URL"}
            </button>
            <button
              onClick={() => setConfirmingDelete(true)}
              disabled={deleteMutation.isPending}
              className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:hover:bg-red-950"
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
        {deleteMutation.isError && (
          <p className="text-xs text-red-500">
            {(deleteMutation.error as Error).message}
          </p>
        )}
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
      <ConfirmModal
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        title="Delete asset"
        description={
          selectedAsset
            ? `Delete "${selectedAsset.file_name}"? This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        danger
        onConfirm={() =>
          selectedAsset && deleteMutation.mutate(selectedAsset.id)
        }
      />
      <div className="w-full px-5 md:w-3/5 my-56">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Assets</h1>
          <div className="flex items-center gap-2">
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
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
              className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-neutral-800"
            >
              {uploadMutation.isPending ? "Uploading…" : "Upload"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              onChange={(event) => {
                handleFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </div>
        </div>

        {isLoading && <p className="mt-6 text-sm text-gray-500">Loading…</p>}
        {assetData && assetData.items.length === 0 && (
          <p className="mt-6 text-sm text-gray-500">
            No assets in this bucket.
          </p>
        )}
        {uploadMutation.isError && (
          <p className="mt-6 text-sm text-red-500">
            {(uploadMutation.error as Error).message}
          </p>
        )}

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              setIsDragging(false);
            }
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            handleFiles(event.dataTransfer.files);
          }}
          className={`mt-6 grid gap-6 landscape:grid-cols-2 ${
            isDragging ? "rounded ring-2 ring-blue-400" : ""
          }`}
        >
          <div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {assetData?.items.map((asset) => (
                <li key={asset.id} className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedAsset(asset);
                      setConfirmingDelete(false);
                    }}
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
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-gray-100 text-gray-400 dark:bg-neutral-800">
                        <FileIcon kind={asset.kind} className="h-6 w-6" />
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
