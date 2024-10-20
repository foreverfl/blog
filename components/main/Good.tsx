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

  // 페이지 로드 시 좋아요 상태와 개수를 서버에서 가져옴
  useEffect(() => {
    // 사용자 이메일 가져오기
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/auth/status");
        const data = await res.json();
        if (data?.user?.email) {
          setUserEmail(data.user.email);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    // 좋아요 상태 및 개수 가져오기
    const fetchLikeData = async () => {
      try {
        const res = await fetch(`/api/like/count?pathHash=${pathHash}`);
        const data = await res.json();
        if (data && data.likeCount !== undefined) {
          setLikeCount(data.likeCount);
        }

        const resStatus = await fetch(
          `/api/like/check?pathHash=${pathHash}&userEmail=${userEmail}`
        );
        const statusData = await resStatus.json();
        setHeartState(statusData.isLiked ? "after" : "before");
      } catch (error) {
        console.error("Error fetching like data:", error);
      }
    };

    if (userEmail) {
      fetchLikeData();
    }

    fetchUserData();
  }, [pathHash, userEmail]);

  // 좋아요 요청을 보내는 함수
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

  // 좋아요 취소 요청을 보내는 함수
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
