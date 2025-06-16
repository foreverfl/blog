"use client";

import Spinner from "@/components/atom/Spinner";
import {
  LoadingProvider,
  useLoadingState,
} from "@/lib/context/loading-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode } from "react";

const queryClient = new QueryClient();

function InnerProviders({ children }: { children: ReactNode }) {
  const { isLoading } = useLoadingState();

  return (
    <>
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
