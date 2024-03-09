"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

const SetLanguage: React.FC = () => {
  // 언어 설정
  const getInitialLanguage = () => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("siteLanguage");
      if (savedLang) {
        return savedLang;
      }
      const browserLang = navigator.language; // 브라우저의 언어 설정 확인
      return browserLang.startsWith("ko") ? "ko" : "ja"; // 한국어 설정이면 'ko'
    }

    return "ja";
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "ko" ? "ja" : "ko"));
  };

  const [language, setLanguage] = useState(getInitialLanguage);
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("siteLanguage", language);
    }
  }, [language]);

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
              language === "ko" ? "translate-x-6" : ""
            }`}
          >
            <Image
              src={
                language === "ko" ? "/images/korea.png" : "/images/japan.png"
              }
              alt={language === "ko" ? "Korean Flag" : "Japanese Flag"}
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
