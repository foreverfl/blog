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
