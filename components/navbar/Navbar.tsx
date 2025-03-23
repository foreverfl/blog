"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";

import NavbarSub from "./NavbarSub";
import Menu from "./Menu";
import Profile from "./Profile";
import SetLanguage from "./SetLanguage";
import SetMode from "./SetMode";

interface PostInfo {
  fileName: string;
  title: string;
  category: string;
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

  // 특정 경로에서는 Navbar를 숨김
  const shouldHideNavbar = useCallback(() => {
    const hiddenRoutes = ["/login"];
    return hiddenRoutes.some((route) => pathname.includes(route));
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

  const handleNavbarClick = () => {
    if (window.scrollY === 0) {
      if (lan === "ko") {
        window.location.href = "/ko";
      } else if (lan === "ja") {
        window.location.href = "/ja";
      }
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const handleMouseEnter = () => {
    if (window.scrollY === 0) {
      setTitleColor("text-white");
      if (lan === "ko") {
        setHoveredTitle("홈으로 이동합니다");
      } else if (lan === "ja") {
        setHoveredTitle("ホームに移動します");
      }
    }
  };

  const handleMouseLeave = () => {
    if (window.scrollY === 0) {
      setHoveredTitle(title);
      setTitleColor("text-transparent");
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Refs
  const subNavbarRef = useRef<HTMLDivElement>(null); // useRef로 DOM 요소 참조 생성

  // States
  // 페이지 정보
  const [isPost, setIsPost] = useState(isPostPage());
  const [postInfo, setPostInfo] = useState<PostInfo | null>(null);
  const [title, setTitle] = useState("");
  const [hoveredTitle, setHoveredTitle] = useState(title);
  const [subnavTitle, setSubnavTitle] = useState("");

  // 스타일
  const [titleColor, setTitleColor] = useState(
    isPost ? "text-transparent" : "text-black dark:text-white"
  );
  const [subNavbarTitleColor, setSubNavbarTitleColor] = useState(
    isPost ? "text-white dark:text-white" : "text-black dark:text-white"
  );
  const [titleBackgroundColor, setTitleBackgroundColor] = useState(
    isPost ? "bg-transparent" : "bg-slate-50 dark:bg-neutral-800"
  );
  const [menuColor, setMenuColor] = useState(
    isPost ? "text-white dark:text-white" : "text-black dark:text-white"
  );

  // 스크롤바
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollColor, setScrollColor] = useState(
    "bg-gray-900 dark:bg-neutral-50"
  );

  // 기타
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

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

  // 타이틀
  useEffect(() => {
    if (isPost) {
      setTitle(postInfo?.title || "");
      setSubnavTitle(postInfo?.title || "");
      setHoveredTitle(postInfo?.title || "");
    } else {
      setTitle("mogumogu");
      setHoveredTitle("mogumogu");
      setSubnavTitle("mogumogu's sundries");
    }
  }, [isPost, postInfo?.title]);

  // 스타일
  useEffect(() => {
    const subNavbar = subNavbarRef.current;
    if (!subNavbar) return;

    const updateStyles = (scrollPosition: number) => {
      const subNavbarHeight = subNavbar.offsetHeight;

      if (isPost) {
        if (scrollPosition <= subNavbarHeight) {
          // SubNavbar가 보일 때
          setTitleColor("text-transparent dark:text-transparent");
          setTitleBackgroundColor("bg-transparent");
          setSubNavbarTitleColor("text-white dark:text-white");
          setMenuColor("text-white dark:text-white");
        } else {
          // SubNavbar가 보이지 않을 때
          setTitleColor("bg-transparent");
          setTitleBackgroundColor("bg-slate-50 dark:bg-neutral-800");
          setSubNavbarTitleColor("text-white dark:text-white");
          setMenuColor("text-black dark:text-white");
        }
      } else {
        // SubNavbar가 보일 때
        if (scrollPosition <= subNavbarHeight) {
          setTitleColor("text-transparent dark:text-transparent");
          setSubNavbarTitleColor("text-black dark:text-white");
        }

        // SubNavbar가 보이지 않을 때
        else {
          setTitleColor("text-black dark:text-white");
          setSubNavbarTitleColor("text-black dark:text-white");
        }
      }
    };

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      updateStyles(scrollPosition);
    };

    // 초기 설정 - 현재 스크롤 위치에 따라 즉시 스타일 업데이트
    updateStyles(window.scrollY);

    // 스크롤 이벤트 리스너 추가
    window.addEventListener("scroll", handleScroll);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isPost]);

  if (shouldHideNavbar()) {
    return null;
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center ${titleBackgroundColor}`}
      >
        {/* 메뉴 열기 버튼 */}
        <div className="flex-1">
          <Menu
            isMenuOpen={isMenuOpen}
            closeMenu={closeMenu}
            menuColor={menuColor}
            isProfileOpen={isProfileOpen}
            toggleMenu={() => setIsMenuOpen(!isMenuOpen)}
          />
        </div>

        {/* 블로그 이름 */}
        <div className="flex-1 flex w-80 sm:w-96 md:w-full justify-center">
          <div
            onClick={handleNavbarClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`min-w-32 max-w-80 sm:max-w-96 md:max-w-full text-2xl sm:text-3xl truncate text-center font-navbar dark:text-slate-50 px-5 select-none cursor-pointer ${titleColor}`}
          >
            {hoveredTitle}
          </div>
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
        ref={subNavbarRef}
        isPost={isPost}
        textColor={subNavbarTitleColor}
        title={postInfo?.title || subnavTitle}
        category={postInfo?.category || ""}
        date={postInfo?.date || ""}
      />
    </>
  );
};

export default Navbar;
