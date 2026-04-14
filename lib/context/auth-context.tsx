"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

const API_AUTH_URL =
  process.env.NEXT_PUBLIC_API_AUTH_URL || "http://localhost:8001/auth";

const ADMIN_EMAILS =
  process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",")
    .map((e) => e.trim())
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
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

async function tryRefreshToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_AUTH_URL}/refresh`, {
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
        const res = await fetch(`${API_AUTH_URL}/me`, {
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
            const retryRes = await fetch(`${API_AUTH_URL}/me`, {
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
