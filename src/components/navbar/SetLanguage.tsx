"use client";

import React from "react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setLanguage } from "@/features/language/languageSlice";

const SetLanguage: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentLanguage = useAppSelector((state) => state.language.value);

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === "ko" ? "ja" : "ko";
    dispatch(setLanguage(newLanguage));
  };

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
