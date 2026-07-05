import { apiGet } from "@/lib/query/query";

const RUST_API = import.meta.env.PUBLIC_API_RUST_URL || "http://localhost:8002";

export interface ListBucketsResponse {
  buckets: string[];
  default: string;
}

function authHeader() {
  return { Authorization: `Bearer ${localStorage.getItem("access_token")}` };
}

export function listBuckets() {
  return apiGet<ListBucketsResponse>(`${RUST_API}/assets/buckets`, {
    headers: authHeader(),
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
    headers: authHeader(),
    body: formData,
  });
  if (!res.ok) {
    throw new Error(`Upload failed (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

export function listAssets(bucket: string, page: number, perPage = 20) {
  const params = new URLSearchParams({
    bucket,
    page: String(page),
    per_page: String(perPage),
  });
  return apiGet<ListAssetsResponse>(`${RUST_API}/assets?${params}`, {
    headers: authHeader(),
  });
}
