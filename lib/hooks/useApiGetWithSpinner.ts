"use client";

import { useLoadingDispatch } from "@/lib/context/loading-context";
import { apiGet } from "@/lib/query/query";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

export function useApiGetWithSpinner<T>(
  key: string[],
  url: string,
  options?: UseQueryOptions<T>,
) {
  const dispatch = useLoadingDispatch();

  return useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      dispatch({ type: "START_LOADING" });
      try {
        return await apiGet<T>(url);
      } finally {
        dispatch({ type: "STOP_LOADING" });
      }
    },
    ...options,
  });
}
