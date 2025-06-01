"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

const SetLanguage: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [currentLanguage, setCurrentLanguage] = useState(
    pathname.split("/")[1],
  );
  const [isReady, setIsReady] = useState(false); // 로딩 상태 관리
  const [isTransitioning, setIsTransitioning] = useState(false); // 애니메이션 상태 관리

  useEffect(() => {
    setIsReady(true);
  }, []);

  const toggleLanguage = async () => {
    setIsTransitioning(true); // 애니메이션 시작
    const newLanguage = currentLanguage === "ko" ? "ja" : "ko";
    setCurrentLanguage(newLanguage);

    const pathParts = pathname.split("/");
    // first part
    pathParts[1] = newLanguage;

    // last part
    const last = pathParts[pathParts.length - 1];
    const slugLangMatch = last.match(/-(ko|ja)$/);
    if (slugLangMatch) {
      const newSlug = last.replace(/-(ko|ja)$/, `-${newLanguage}`);
      pathParts[pathParts.length - 1] = newSlug;
    }

    // combine the path parts
    const newPathname = pathParts.join("/");

    try {
      await fetch(`/api/language/${newLanguage}`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Failed to update language cookie", error);
    }

    setTimeout(() => {
      router.push(newPathname, { scroll: false });
      setIsTransitioning(false); // 전환 종료
    }, 500); // 애니메이션 후 경로 변경
  };

  if (!isReady) {
    return (
      <div className="animate-pulse">
        <div className="rounded-full bg-gray-400 h-8 w-14"></div>
      </div>
    );
  }

  return (
    <>
      {/* 스위치 컨테이너 */}
      <div
        className="relative inline-block w-14 h-8 cursor-pointer"
        onClick={toggleLanguage}
      >
        <input type="checkbox" className="hidden" />
        {/* 스위치 배경 */}
        <motion.div
          className="rounded-full h-8 bg-gray-400 p-1 transition-colors duration-200 ease-in-out"
          initial={{ backgroundColor: "rgb(156, 163, 175)" }}
          animate={{
            backgroundColor: isTransitioning ? "#666666" : "rgb(156, 163, 175)",
          }}
        >
          {/* 스위치 토글 핸들 */}
          <motion.div
            className="bg-white w-6 h-6 rounded-full shadow-md"
            initial={{ x: 0 }}
            animate={{
              x: currentLanguage === "ko" ? "1.5rem" : 0, // 이동 거리
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={
                  currentLanguage === "ko"
                    ? "/images/korea.png"
                    : "/images/japan.png"
                }
                alt={currentLanguage === "ko" ? "Korean Flag" : "Japanese Flag"}
                width={24}
                height={24}
                className="rounded-full"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default SetLanguage;
