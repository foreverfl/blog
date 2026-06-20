"use client";

import Spinner from "@/components/atom/Spinner";
import LoginModal from "@/components/modal/LoginModal";
import {
  LoadingProvider,
  useLoadingState,
} from "@/lib/context/loading-context";
import { AuthProvider } from "@/lib/context/auth-context";
import { LoginModalProvider } from "@/lib/context/login-modal-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

const queryClient = new QueryClient();

function InnerProviders({ children }: { children: ReactNode }) {
  const { isLoading } = useLoadingState();

  return (
    <>
      {isLoading && <Spinner />}
      {children}
      <LoginModal />
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
            </LoginModalProvider>
          </LoadingProvider>
        </AuthProvider>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
