import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import React, { useEffect, useLayoutEffect, useState } from "react";

type NavbarSubProps = {
  postIdx: string;
  textColor: string;
  title: string;
};

const SubNavbar: React.FC<NavbarSubProps> = ({ postIdx, textColor, title }) => {
  // Redux

  // State

  // 로딩 중 UI 처리
  const backgroundImageUrl = postIdx
    ? "/images/subnav_background1_darker.jpg"
    : "";

  return (
    <div
      id="subNavbar"
      className={`w-full h-screen flex items-center justify-center select-none bg-neutral-200 dark:bg-neutral-950 ${textColor}`}
      style={{
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundSize: "cover", // 배경 이미지를 컨테이너에 맞게 조절
        backgroundPosition: "center", // 배경 이미지를 중앙에 위치
      }}
    >
      <h1 className="text-5xl md:text-7xl font-bold dark:text-slate-50 font-navbar">
        {title}
      </h1>
    </div>
  );
};

export default SubNavbar;
