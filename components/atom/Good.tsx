"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const Good = () => {
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
      if (!userEmail) {
        return;
      }
      const res = await fetch(
        `/api/like/${classification}/${category}/${slug}?userEmail=${userEmail}`,
      );
      const data = await res.json();
      if (data && data.likeCount !== undefined) {
        setLikeCount(data.likeCount);
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
      window.location.href = "/login";
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
    fetchLikeData();
    addLike(userEmail);
    removeLike(userEmail);
  }, [addLike, fetchLikeData, fetchUserEmail, removeLike, userEmail]);

  return (
    <div className="flex items-center justify-center">
      <div className="w-full md:w-3/5">
        <div className="flex items-center justify-between my-4">
          {/* 하트 버튼 */}
          <div className="flex items-center space-x-2 py-2 px-4 rounded-full shadow">
            <motion.button
              onClick={handleClick}
              className="flex items-center justify-center p-1 rounded-full"
              whileTap={{ scale: 0.8 }} // 클릭 시 애니메이션
              transition={{ duration: 0.2, ease: "easeInOut" }} // 애니메이션 트랜지션
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
