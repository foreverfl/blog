"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";

const SetLanguage: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const currentLanguage = pathname.split("/")[1]; // URL에서 현재 로케일을 추출

  const [isReady, setIsReady] = useState(false); // 로딩 상태 관리

  useEffect(() => {
    // 언어 토글 스위치가 렌더링 준비가 완료되었다고 표시
    setIsReady(true);
  }, []);

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === "ko" ? "ja" : "ko";
    const pathParts = pathname.split("/"); // 언어 코드만 변경하고 나머지 경로는 유지
    pathParts[1] = newLanguage; // 첫 번째 부분을 새로운 언어 코드로 교체
    const newPathname = pathParts.join("/");

    router.push(newPathname, { scroll: false });
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
        <div
          className={`rounded-full h-8 bg-gray-400 p-1 transition-colors duration-200 ease-in-out`}
        >
          {/* 스위치 토글 핸들 */}
          <div
            className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
              currentLanguage === "ko" ? "translate-x-6" : ""
            }`}
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
          </div>
        </div>
      </div>
    </>
  );
};

export default SetLanguage;
