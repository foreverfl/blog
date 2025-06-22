"use client";

import Spinner from "@/components/atom/Spinner";
import VisitorTracker from "@/components/VisitorTracker";
import {
  LoadingProvider,
  useLoadingState,
} from "@/lib/context/loading-context";
import { useStopLoadingOnPathChange } from "@/lib/hooks/useStopLoadingOnPathChange";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode, useEffect } from "react";

const queryClient = new QueryClient();

function InnerProviders({ children }: { children: ReactNode }) {
  const { isLoading } = useLoadingState();
  useStopLoadingOnPathChange();

  // useEffect(() => {
  //   if (localStorage.getItem("indexed") === "1") return;
  //   localStorage.setItem("indexed", "1");
  //   fetch("/api/indexing", {
  //     method: "POST",
  //     headers: {
  //       Authorization: `Bearer ${process.env.NEXT_PUBLIC_HACKERNEWS_API_KEY}`,
  //       "Content-Type": "application/json",
  //     },
  //   }).catch(() => {});
  // }, []);

  useEffect(() => {
    fetch("/api/indexing", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_HACKERNEWS_API_KEY}`,
        "Content-Type": "application/json",
      },
    }).catch(() => {});
  }, []);

  return (
    <>
      <VisitorTracker />
      {isLoading && <Spinner />}
      {children}
    </>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <LoadingProvider>
        <InnerProviders>{children}</InnerProviders>
      </LoadingProvider>
      {process.env.ENV_STAGE === "local" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
