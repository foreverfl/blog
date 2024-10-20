"use client";

import crypto from "crypto";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const Good = () => {
  const pathname = usePathname();
  const [heartState, setHeartState] = useState("before");
  const [likeCount, setLikeCount] = useState(0);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const cleanPath = pathname.split("/").slice(2).join("/");
  const pathHash = crypto.createHash("sha256").update(cleanPath).digest("hex");

  useEffect(() => {
    // 좋아요 상태 및 개수 가져오기
    const fetchLikeData = async () => {
      try {
        const res = await fetch(`/api/like/count?pathHash=${pathHash}`);
        const data = await res.json();
        if (data && data.likeCount !== undefined) {
          setLikeCount(data.likeCount);
        }
      } catch (error) {
        console.error("Error fetching like count:", error);
      }
    };

    fetchLikeData();
  }, [pathHash]);

  // 사용자 이메일 가져오기 및 좋아요 상태 가져오기
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/auth/status");
        const data = await res.json();
        if (data?.user?.email) {
          setUserEmail(data.user.email);

          // 사용자 좋아요 상태 가져오기
          const resStatus = await fetch(
            `/api/like/check?pathHash=${pathHash}&userEmail=${data.user.email}`
          );
          const statusData = await resStatus.json();
          setHeartState(statusData.isLiked ? "after" : "before");
        }
      } catch (error) {
        console.error("Error fetching user data or like status:", error);
      }
    };

    fetchUserData();
  }, [pathHash]);

  const addLike = async () => {
    try {
      const res = await fetch("/api/like/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pathHash, userEmail }),
      });

      if (res.ok) {
        setLikeCount((prevCount) => prevCount + 1);
        setHeartState("after");
      }
    } catch (error) {
      console.error("Error adding like:", error);
    }
  };

  const removeLike = async () => {
    try {
      const res = await fetch("/api/like/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pathHash, userEmail }),
      });

      if (res.ok) {
        setLikeCount((prevCount) => prevCount - 1);
        setHeartState("before");
      }
    } catch (error) {
      console.error("Error removing like:", error);
    }
  };

  const handleClick = () => {
    if (!userEmail) {
      window.location.href = "/login";
      return;
    }

    if (heartState === "before") {
      addLike();
    } else {
      removeLike();
    }
  };

  return (
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
  );
};

export default Good;
