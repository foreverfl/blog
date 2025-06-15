import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

// Common fetcher
async function baseFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    let message = "Network error";
    try {
      const err = await res.json();
      message = err.message || JSON.stringify(err);
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

// GET
export function apiGet<T>(url: string, options?: RequestInit) {
  return baseFetch<T>(url, { ...options, method: "GET" });
}

// POST
export function apiPost<T>(url: string, body: any, options?: RequestInit) {
  return baseFetch<T>(url, {
    ...options,
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
}

// PUT
export function apiPut<T>(url: string, body: any, options?: RequestInit) {
  return baseFetch<T>(url, {
    ...options,
    method: "PUT",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
}

// PATCH
export function apiPatch<T>(url: string, body: any, options?: RequestInit) {
  return baseFetch<T>(url, {
    ...options,
    method: "PATCH",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
}

// DELETE
export function apiDelete<T>(url: string, options?: RequestInit) {
  return baseFetch<T>(url, { ...options, method: "DELETE" });
}
