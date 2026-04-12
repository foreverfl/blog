"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

const AUTH_API_URL =
  process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:8001";

const ADMIN_EMAILS =
  process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",").map((e) => e.trim()) ?? [];

interface UserData {
  email: string;
  username: string;
  userName: string;
  photo: string;
  [key: string]: string | undefined;
}

interface AuthState {
  isReady: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  userData: UserData | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

async function tryRefreshToken(): Promise<boolean> {
  try {
    const res = await fetch(`${AUTH_API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem(
        "token_expires_at",
        String(Date.now() + data.expires_in * 1000),
      );
      return true;
    }
  } catch (e) {
    console.error("Token refresh failed:", e);
  }
  return false;
}

function clearAuth() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("token_expires_at");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setIsReady(true);
          return;
        }

        const expiresAt = localStorage.getItem("token_expires_at");
        if (expiresAt && Date.now() > Number(expiresAt)) {
          const refreshed = await tryRefreshToken();
          if (!refreshed) {
            clearAuth();
            setIsReady(true);
            return;
          }
        }

        const currentToken = localStorage.getItem("access_token");
        const res = await fetch(`${AUTH_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUserData(data);
          setIsLoggedIn(true);
        } else if (res.status === 401) {
          const refreshed = await tryRefreshToken();
          if (refreshed) {
            const retryToken = localStorage.getItem("access_token");
            const retryRes = await fetch(`${AUTH_API_URL}/auth/me`, {
              headers: { Authorization: `Bearer ${retryToken}` },
            });
            if (retryRes.ok) {
              const data = await retryRes.json();
              setUserData(data);
              setIsLoggedIn(true);
            } else {
              clearAuth();
            }
          } else {
            clearAuth();
          }
        }
      } catch (e) {
        console.error("Auth check failed:", e);
        clearAuth();
      } finally {
        setIsReady(true);
      }
    };

    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await fetch(`${AUTH_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error("Logout failed:", e);
    }
    clearAuth();
    setIsLoggedIn(false);
    setUserData(null);
  };

  const isAdmin = ADMIN_EMAILS.includes(userData?.email ?? "");

  return (
    <AuthContext.Provider
      value={{ isReady, isLoggedIn, isAdmin, userData, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
