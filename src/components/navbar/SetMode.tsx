"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

const SetMode: React.FC = () => {
  // 모드 설정
  const getInitialDarkMode = () => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("siteDarkMode");
      if (savedMode !== null) {
        return savedMode === "true";
      }
      return (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    }

    return false;
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("siteDarkMode", isDarkMode.toString());
    }
  }, [isDarkMode]);

  return (
    <>
      {/* 스위치 컨테이너 */}
      <div
        className="relative inline-block w-14 h-8 cursor-pointer"
        onClick={toggleDarkMode}
      >
        <input type="checkbox" className="hidden" />
        {/* 스위치 배경 */}
        <div
          className={`rounded-full h-8 bg-gray-400 p-1 transition-colors duration-200 ease-in-out`}
        >
          {/* 스위치 토글 핸들 */}
          <div
            className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
              isDarkMode ? "translate-x-6" : ""
            }`}
          >
            <Image
              src={isDarkMode ? "/images/moon.png" : "/images/sun.png"}
              alt={isDarkMode ? "Dark Mode On" : "Dark Mode Off"}
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

export default SetMode;
