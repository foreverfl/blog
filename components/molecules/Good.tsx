"use client";

import { useLoginModal } from "@/lib/context/login-modal-context";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const Good = () => {
  const { openLoginModal } = useLoginModal();

  // path
  const pathname = usePathname();
  const parts = pathname.split("/");
  const classification = parts[2] || "";
  const category = parts[3] || "";
  const slug = parts[4].replace(/-(ko|ja|en)$/, "") || "";

  const [heartState, setHeartState] = useState("before");
  const [likeCount, setLikeCount] = useState(0);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const fetchLikeData = useCallback(async () => {
    try {
      const url =
        `/api/like/${classification}/${category}/${slug}` +
        (userEmail ? `?userEmail=${userEmail}` : "");
      const res = await fetch(url);
      const data = await res.json();

      if (data && data.likeCount !== undefined) {
        setLikeCount(data.likeCount);
      }
      if (data && data.liked !== undefined) {
        setHeartState(data.liked ? "after" : "before");
      }
    } catch (error) {
      console.error("Error fetching like count:", error);
    }
  }, [category, classification, slug, userEmail]);

  const fetchUserEmail = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/status");
      const data = await res.json();
      if (data.isAuthenticated) {
        setUserEmail(data.user.email);
      }
    } catch (error) {
      console.error("Error fetching user email:", error);
    }
  }, []);

  const addLike = useCallback(
    async (userEmail: string | null): Promise<boolean> => {
      if (!userEmail) return false;
      try {
        const res = await fetch(
          `/api/like/${classification}/${category}/${slug}?userEmail=${userEmail}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userEmail }),
          },
        );
        return res.ok;
      } catch (error) {
        console.error("Error adding like:", error);
        return false;
      }
    },
    [category, classification, slug],
  );

  const removeLike = useCallback(
    async (userEmail: string | null): Promise<boolean> => {
      if (!userEmail) return false;
      try {
        const res = await fetch(
          `/api/like/${classification}/${category}/${slug}?userEmail=${userEmail}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userEmail }),
          },
        );
        return res.ok;
      } catch (error) {
        console.error("Error removing like:", error);
        return false;
      }
    },
    [category, classification, slug],
  );

  const handleAddLike = async () => {
    const ok = await addLike(userEmail);
    if (ok) {
      setLikeCount((prev) => prev + 1);
      setHeartState("after");
    }
  };

  const handleRemoveLike = async () => {
    const ok = await removeLike(userEmail);
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
    fetchUserEmail();
  }, [fetchUserEmail]);

  useEffect(() => {
    fetchLikeData();
  }, [fetchLikeData]);

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
              <Image
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
            <Link
              href={"https://creativecommons.org/licenses/by-nc-nd/4.0/"}
              target="_blank"
            >
              <Image
                src={"/images/by-nc-nd.svg"}
                alt={"Creative Commons"}
                width={100}
                height={100}
                priority={true}
                className="w-32 object-cover"
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Good;
