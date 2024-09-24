"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import NavbarSub from "./NavbarSub";
import Menu from "./Menu";
import Profile from "./Profile";
import SetLanguage from "./SetLanguage";
import SetMode from "./SetMode";

interface PostInfo {
  fileName: string;
  title: string;
  date: string;
  image: string;
}

const Navbar: React.FC = () => {
  // Utilities
  const pathname = usePathname();
  const lan = pathname.split("/")[1];

  // Check if the current page is a post page
  const isPostPage = useCallback(() => {
    const pathSegments = pathname.split("/").filter(Boolean);
    return pathSegments.length === 4;
  }, [pathname]);

  // Fetch post metadata
  const fetchPostInfo = useCallback(async () => {
    const pathSegments = pathname.split("/").filter(Boolean);

    if (isPostPage()) {
      const classification = pathSegments[1];
      const category = pathSegments[2];
      const slug = pathSegments[3];

      try {
        const response = await fetch(
          `/api/post-metadata?lan=${lan}&classification=${classification}&category=${category}&slug=${slug}`
        );

        if (response.ok) {
          const data = await response.json();
          setPostInfo(data); // Set the post info in state
        } else {
          console.error("Failed to fetch post metadata");
        }
      } catch (error) {
        console.error("Error fetching post metadata:", error);
      }
    }
  }, [pathname, lan, isPostPage]);

  // State
  const [isPost, setIsPost] = useState(isPostPage());

  // 스크롤바
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollColor, setScrollColor] = useState(
    "bg-gray-900 dark:bg-neutral-50"
  );

  // 네비게이션
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [menuColor, setMenuColor] = useState(
    isPost ? "text-white dark:text-white" : "text-black dark:text-white"
  );
  const [titleColor, setTitleColor] = useState(
    isPost
      ? "text-transparent dark:text-transparent"
      : "text-black dark:text-transparent"
  );
  const [titleBackgroundColor, setTitleBackgroundColor] = useState(
    isPost ? "bg-transparent" : "bg-slate-50 dark:bg-neutral-800"
  );
  const [title, setTitle] = useState("mogumogu"); // Title
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false); // 프로필
  const [navbarTitleColor, setnavbarTitleColor] = useState(
    isPost ? "text-white" : "text-black dark:text-white"
  );
  const [titleIsHovered, setTitleIsHovered] = useState(false);

  // 서브 네비게이션
  const [subnavTitle, setSubnavTitle] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [updatedDate, setUpdatedDate] = useState<Date | undefined>(undefined);

  // 포스트 정보
  const [postInfo, setPostInfo] = useState<PostInfo | null>(null);

  // 포스트 정보 업데이트
  useEffect(() => {
    const postPage = isPostPage();
    setIsPost(postPage);

    if (postPage) {
      fetchPostInfo();
    }
  }, [pathname, fetchPostInfo, isPostPage]);

  // 가로 스크롤
  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setScrollProgress(scrolled);
    };

    window.addEventListener("scroll", updateScrollProgress); // 스크롤 이벤트 리스너 추가

    return () => {
      window.removeEventListener("scroll", updateScrollProgress); // 컴포넌트가 언마운트될 때 이벤트 리스너 제거
    };
  }, []);

  // hover에 따른 title 변경
  useEffect(() => {
    if (isPost) {
      const subNavbar = document.getElementById("subNavbar");
      if (!subNavbar) return; // SubNavbar 요소가 없으면 함수 종료

      const subNavbarHeight = subNavbar.offsetHeight;
      const scrollPosition = window.scrollY;

      // 스크롤이 맨 위에 있을 때만 hover에 따른 title 변경
      if (scrollPosition === 0) {
        setTitleColor("text-white dark:text-white");

        if (titleIsHovered) {
          if (lan === "ja") {
            setTitle("ホームに移動します。");
          } else {
            setTitle("홈으로 이동합니다.");
          }
        } else {
          setTitleColor("text-transparent dark:text-transparent");
        }
      }
      // 스크롤이 맨 위에 있지 않으면 postInfo?.title 또는 기본 타이틀을 설정
      else {
        setTitleColor("text-white dark:text-white");
        setTitle(postInfo?.title || "mogumogu");
        setSubnavTitle(postInfo?.title || "");
      }
    } else {
      setTitle("mogumogu");
    }
  }, [isPost, lan, titleIsHovered, postInfo?.title]);

  // 스크롤 바 위치에 따른 효과
  useEffect(() => {
    const handleScroll = () => {
      const subNavbar = document.getElementById("subNavbar");
      if (!subNavbar) return; // SubNavbar 요소가 없으면 함수 종료

      const subNavbarHeight = subNavbar.offsetHeight;
      const scrollPosition = window.scrollY;

      if (isPost) {
        // subNavbar가 보이지 않을 때
        if (scrollPosition > subNavbarHeight) {
          setTitleBackgroundColor("bg-slate-50 dark:bg-neutral-800");
          setTitleColor("text-black dark:text-white");
          setMenuColor("text-black dark:text-white");
        }

        // SubNavbar가 보일 때
        else {
          setTitleBackgroundColor("bg-transparent");
          setTitleColor("text-transparent dark:text-transparent");
          setMenuColor("text-white dark:text-white");
        }
      } else {
        setTitleColor("text-black dark:text-white");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isPost]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center ${titleBackgroundColor}`}
      >
        {/* 메뉴 열기 버튼 */}
        <div className="flex-1">
          <Menu
            isMenuOpen={isMenuOpen}
            menuColor={menuColor}
            isProfileOpen={isProfileOpen}
            toggleMenu={() => setIsMenuOpen(!isMenuOpen)}
          />
        </div>

        {/* 블로그 이름 */}
        <div
          onMouseEnter={() => setTitleIsHovered(true)}
          onMouseLeave={() => setTitleIsHovered(false)}
          className="flex-1 flex w-72 justify-center"
        >
          <Link href="/">
            <div
              className={`min-w-32 text-2xl md:text-3xl truncate text-center font-navbar dark:text-slate-50 px-5 select-none cursor-pointer ${titleColor}`}
            >
              {title}
            </div>
          </Link>
        </div>

        {/* 다국어 / 다크모드 / 프로필 컨테이너 */}
        <div className="flex-1 flex justify-end items-center gap-8 select-none">
          {/* 다국어 스위치 */}
          <div className="hidden md:flex">
            <SetLanguage />
          </div>

          {/* 다크모드 스위치 */}
          <div className="hidden md:flex">
            <SetMode />
          </div>

          {/* 프로필 버튼 */}
          <Profile
            isProfileOpen={isProfileOpen}
            isMenuOpen={isMenuOpen}
            toggleProfile={() => setIsProfileOpen(!isProfileOpen)}
          />
        </div>
      </nav>

      {/* 가로 스크롤바 */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="w-full h-0.5 bg-transparent">
          <div
            className={`h-full ${scrollColor}`}
            style={{ width: `${scrollProgress}%` }}
          ></div>
        </div>
      </div>

      {/* 서브 네이게이션 바*/}
      <NavbarSub
        isPost={isPost}
        textColor={navbarTitleColor}
        title={postInfo?.title || subnavTitle}
      />
    </>
  );
};

export default Navbar;
