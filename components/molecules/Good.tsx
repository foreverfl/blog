"use client";

import { getValidAccessToken } from "@/lib/auth/token";
import { useAuth, useUserScopedState } from "@/lib/context/auth-context";
import { useLoginModal } from "@/lib/context/login-modal-context";
import { useClientPathname } from "@/lib/hooks/useClientPathname";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

const RUST_API = import.meta.env.PUBLIC_API_RUST_URL || "http://localhost:8002";

const Good = () => {
  const { openLoginModal } = useLoginModal();
  const { userData } = useAuth();
  const userEmail = userData?.email ?? null;

  // path
  const pathname = useClientPathname();
  const parts = pathname.split("/");
  const classification = parts[2] || "";
  const category = parts[3] || "";
  const slug = parts[4].replace(/-(ko|ja|en)$/, "") || "";

  const [heartState, setHeartState] = useUserScopedState<"before" | "after">(
    "before",
  );
  const [likeCount, setLikeCount] = useState(0);

  const addLike = useCallback(async (): Promise<boolean> => {
    const token = await getValidAccessToken();
    if (!token) return false;
    try {
      const res = await fetch(
        `${RUST_API}/likes/${classification}/${category}/${slug}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return res.ok;
    } catch (error) {
      console.error("Error adding like:", error);
      return false;
    }
  }, [category, classification, slug]);

  const removeLike = useCallback(async (): Promise<boolean> => {
    const token = await getValidAccessToken();
    if (!token) return false;
    try {
      const res = await fetch(
        `${RUST_API}/likes/${classification}/${category}/${slug}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return res.ok;
    } catch (error) {
      console.error("Error removing like:", error);
      return false;
    }
  }, [category, classification, slug]);

  const handleAddLike = async () => {
    const ok = await addLike();
    if (ok) {
      setLikeCount((prev) => prev + 1);
      setHeartState("after");
    }
  };

  const handleRemoveLike = async () => {
    const ok = await removeLike();
    if (ok) {
      setLikeCount((prev) => prev - 1);
      setHeartState("before");
    }
  };

  const handleClick = () => {
    if (!userEmail) {
      openLoginModal();
      return;
    }

    if (heartState === "before") {
      handleAddLike();
    } else {
      handleRemoveLike();
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Bearer is only needed for the caller-specific `liked` flag; the count
        // is public, so an anonymous read still returns it.
        const token = userEmail ? await getValidAccessToken() : null;
        const res = await fetch(
          `${RUST_API}/likes/${classification}/${category}/${slug}`,
          token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
        );
        const data = await res.json();
        if (cancelled) return;
        if (data && data.like_count !== undefined) {
          setLikeCount(data.like_count);
        }
        if (data && data.liked !== undefined) {
          setHeartState(data.liked ? "after" : "before");
        }
      } catch (error) {
        console.error("Error fetching like count:", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [classification, category, slug, userEmail, setHeartState]);

  return (
    <div className="flex items-center justify-center">
      <div className="w-full md:w-3/5">
        <div className="flex items-center justify-between my-4">
          {/* 하트 버튼 */}
          <div className="flex items-center space-x-2 py-2 px-4 rounded-full shadow border border-gray-200 dark:border-gray-700">
            <motion.button
              onClick={handleClick}
              className="flex items-center justify-center p-1 rounded-full"
              whileTap={{ scale: 0.8 }} // animated when clicked
              transition={{ duration: 0.2, ease: "easeInOut" }} // animation transition
            >
              <img
                src={
                  heartState === "before"
                    ? "/images/heart_before.png"
                    : "/images/heart_after.png"
                }
                alt="Like"
                width={40}
                height={40}
                className="h-5 w-5 object-cover"
              />
            </motion.button>
            <span>{likeCount}</span>
          </div>
          {/* Creative Commons */}
          <div>
            <a
              href={"https://creativecommons.org/licenses/by-nc-nd/4.0/"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={"/images/by-nc-nd.svg"}
                alt={"Creative Commons"}
                width={100}
                height={100}
                className="w-32 object-cover"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Good;
