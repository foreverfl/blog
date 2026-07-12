"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { API_AUTH_URL, clearAuth, tryRefreshToken } from "@/lib/auth/token";

const ADMIN_EMAILS =
  import.meta.env.PUBLIC_ADMIN_EMAILS?.split(",")
    .map((e: string) => e.trim())
    .filter(Boolean) ?? [];

interface UserData {
  id: string;
  email: string;
  username: string;
  photo: string | null;
  auth_provider: string;
}

interface AuthState {
  isReady: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  userData: UserData | null;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  const refreshAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setIsLoggedIn(false);
        setUserData(null);
        return;
      }

      const expiresAt = localStorage.getItem("token_expires_at");
      if (expiresAt && Date.now() > Number(expiresAt)) {
        const refreshed = await tryRefreshToken();
        if (!refreshed) {
          clearAuth();
          setIsLoggedIn(false);
          setUserData(null);
          return;
        }
      }

      const currentToken = localStorage.getItem("access_token");
      const res = await fetch(`${API_AUTH_URL}/me`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUserData(data);
        setIsLoggedIn(true);
        return;
      }

      if (res.status === 401) {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
          const retryToken = localStorage.getItem("access_token");
          const retryRes = await fetch(`${API_AUTH_URL}/me`, {
            headers: { Authorization: `Bearer ${retryToken}` },
          });
          if (retryRes.ok) {
            const data = await retryRes.json();
            setUserData(data);
            setIsLoggedIn(true);
            return;
          }
        }
        clearAuth();
        setIsLoggedIn(false);
        setUserData(null);
      }
    } catch (e) {
      console.error("Auth check failed:", e);
      clearAuth();
      setIsLoggedIn(false);
      setUserData(null);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    void refreshAuth();
  }, [refreshAuth]);

  const logout = async () => {
    try {
      await fetch(`${API_AUTH_URL}/logout`, {
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

  const isAdmin =
    isLoggedIn && !!userData?.email && ADMIN_EMAILS.includes(userData.email);

  return (
    <AuthContext.Provider
      value={{ isReady, isLoggedIn, isAdmin, userData, refreshAuth, logout }}
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

/**
 * useState variant that automatically resets to `initial` when the logged-in
 * user changes (login, logout, account switch). Uses the render-time state
 * adjustment pattern so no extra effect or frame flicker.
 *
 * Use this for per-user UI state such as liked lists, draft comments, etc.
 */
export function useUserScopedState<T>(
  initial: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] {
  const { userData } = useAuth();
  const userKey = userData?.email ?? null;

  const [state, setState] = useState<T>(initial);
  const [prevUserKey, setPrevUserKey] = useState<string | null>(userKey);

  if (prevUserKey !== userKey) {
    setPrevUserKey(userKey);
    setState(typeof initial === "function" ? (initial as () => T)() : initial);
  }

  return [state, setState];
}
