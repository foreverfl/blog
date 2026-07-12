import { getValidAccessToken } from "@/lib/auth/token";
import { apiGet } from "@/lib/query/query";

const RUST_API = import.meta.env.PUBLIC_API_RUST_URL || "http://localhost:8002";

export interface ListBucketsResponse {
  buckets: string[];
  default: string;
}

// Refresh the token if expired before every request, so a long-idle page
// doesn't send a stale token and get stuck on 401.
async function authHeader() {
  const token = await getValidAccessToken();
  return { Authorization: `Bearer ${token}` };
}

export async function listBuckets() {
  return apiGet<ListBucketsResponse>(`${RUST_API}/assets/buckets`, {
    headers: await authHeader(),
  });
}

export interface AssetResponse {
  id: string;
  bucket: string;
  object_key: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  sha256: string | null;
  width: number | null;
  height: number | null;
  duration_ms: number | null;
  kind: "image" | "video" | "audio" | "document";
  status: string;
  url: string;
  created_at: string;
  updated_at: string;
}

export interface ListAssetsResponse {
  items: AssetResponse[];
  total: number;
  page: number;
  per_page: number;
}

// Multipart body, so this bypasses the JSON helpers in lib/query/query.ts.
// No manual Content-Type: the browser sets the multipart boundary itself.
export async function uploadAssets(
  bucket: string,
  files: File[],
): Promise<AssetResponse[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("file", file);
  }
  const params = new URLSearchParams({ bucket });
  const res = await fetch(`${RUST_API}/assets?${params}`, {
    method: "POST",
    headers: await authHeader(),
    body: formData,
  });
  if (!res.ok) {
    throw new Error(`Upload failed (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

// 204 No Content on success, so this skips the JSON helpers too.
export async function deleteAsset(id: string): Promise<void> {
  const res = await fetch(`${RUST_API}/assets/${id}`, {
    method: "DELETE",
    headers: await authHeader(),
  });
  if (!res.ok) {
    throw new Error(`Delete failed (${res.status}): ${await res.text()}`);
  }
}

export async function listAssets(bucket: string, page: number, perPage = 20) {
  const params = new URLSearchParams({
    bucket,
    page: String(page),
    per_page: String(perPage),
  });
  return apiGet<ListAssetsResponse>(`${RUST_API}/assets?${params}`, {
    headers: await authHeader(),
  });
}
