import React, { useEffect, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";

type NavbarSubProps = {
  postIdx: string;
  textColor: string;
  title: string;
  updatedDate?: Date;
  category?: string;
  status: string;
};

const SubNavbar: React.FC<NavbarSubProps> = ({
  postIdx,
  textColor,
  title,
  updatedDate,
  category,
  status,
}) => {
  // Utilities
  const pathname = usePathname();

  function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  }

  // Redux

  // State
  const [isPostPage, setIsPostPage] = useState(pathname.startsWith("/post/"));

  // 로딩 중 UI 처리
  const backgroundImageUrl = postIdx
    ? "/images/subnav_background1_darker.jpg"
    : "";

  return (
    <div
      id="subNavbar"
      className={`w-full h-screen flex flex-col items-center justify-center space-y-3 select-none bg-neutral-200 dark:bg-neutral-950 ${textColor}`}
      style={{
        backgroundImage: `url(${backgroundImageUrl})`,
        backgroundSize: "cover", // 배경 이미지를 컨테이너에 맞게 조절
        backgroundPosition: "center", // 배경 이미지를 중앙에 위치
      }}
    >
      {/* 제목 */}
      {status === "loading" ? (
        <div className="text-xl md:text-2xl font-bold dark:text-slate-50 font-navbar">
          <Image
            src="/images/gear.gif"
            width={250}
            height={250}
            alt="loading"
            priority={true}
            className="w-8 h-8 object-fit"
          />
        </div>
      ) : isPostPage ? (
        title && (
          <h1 className="text-5xl md:text-7xl text-center font-bold dark:text-slate-50 font-navbar">
            {title}
          </h1>
        )
      ) : (
        <h1 className="text-5xl md:text-7xl font-bold dark:text-slate-50 font-navbar">
          mogumogu&#39;s sundries
        </h1>
      )}

      {/* 날짜 */}
      {updatedDate &&
        isPostPage &&
        status !== "loading" && ( // 로딩 중이 아닐 때만 날짜와 카테고리를 표시
          <p className="text-lg md:text-lg font-bold dark:text-slate-50 font-navbar">
            {`${formatDate(new Date(updatedDate!))} | ${category}`}
          </p>
        )}
    </div>
  );
};

export default React.memo(SubNavbar);
