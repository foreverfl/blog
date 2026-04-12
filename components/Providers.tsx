"use client";

import Spinner from "@/components/atom/Spinner";
import VisitorTracker from "@/components/VisitorTracker";
import {
  LoadingProvider,
  useLoadingState,
} from "@/lib/context/loading-context";
import { AuthProvider } from "@/lib/context/auth-context";
import { LoginModalProvider } from "@/lib/context/login-modal-context";
import LoginModal from "@/components/modal/LoginModal";
import { useStopLoadingOnPathChange } from "@/lib/hooks/useStopLoadingOnPathChange";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { ReactNode, useEffect } from "react";

const queryClient = new QueryClient();

function InnerProviders({ children }: { children: ReactNode }) {
  const { isLoading } = useLoadingState();
  useStopLoadingOnPathChange();

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
    <ThemeProvider
      attribute="class"
      enableSystem={true}
      defaultTheme="system"
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LoadingProvider>
            <LoginModalProvider>
              <InnerProviders>{children}</InnerProviders>
              <LoginModal />
            </LoginModalProvider>
          </LoadingProvider>
        </AuthProvider>
        {process.env.ENV_STAGE === "local" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
