"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
  const pathname = usePathname();
  const lan = pathname.split("/")[1];

  const subNavbarRef = useRef<HTMLDivElement>(null);

  const [postData, setPostData] = useState<{
    path: string;
    info: PostInfo;
  } | null>(null);
  const postInfo = postData?.path === pathname ? postData.info : null;
  const [scrollY, setScrollY] = useState(0);
  const [scrollHeight, setScrollHeight] = useState(0);
  const [subNavbarHeight, setSubNavbarHeight] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const pathSegments = pathname.split("/").filter(Boolean);
  const isPost = pathSegments.length === 4;
  const isWritePage = pathname.includes("/write");
  const shouldHideNavbar = ["/login"].some((route) => pathname.includes(route));

  const title = isPost ? postInfo?.title || "" : "mogumogu";
  const subnavTitle = isPost ? postInfo?.title || "" : "mogumogu's lab";

  // Fetch post metadata on post pages
  useEffect(() => {
    if (!isPost) return;
    const [, , classification, category, slug] = pathname.split("/");
    if (!classification || !category || !slug) return;

    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(
          `/api/post/meta?lan=${lan}&classification=${classification}&category=${category}&slug=${slug}-${lan}`,
        );
        if (!response.ok) {
          console.error("Failed to fetch post metadata");
          return;
        }
        const data = await response.json();
        if (cancelled) return;
        setPostData({ path: pathname, info: data });
      } catch (error) {
        console.error("Error fetching post metadata:", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isPost, pathname, lan]);

  // Track scroll position + total scrollable height for progress bar
  useEffect(() => {
    const update = () => {
      setScrollY(window.scrollY || document.documentElement.scrollTop);
      setScrollHeight(
        document.documentElement.scrollHeight -
          document.documentElement.clientHeight,
      );
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Observe SubNavbar height so color transitions track its real height
  useEffect(() => {
    const node = subNavbarRef.current;
    if (!node) return;
    const ro = new ResizeObserver(() => {
      setSubNavbarHeight(node.offsetHeight);
    });
    ro.observe(node);
    setSubNavbarHeight(node.offsetHeight);
    return () => ro.disconnect();
  }, []);

  const scrollProgress = scrollHeight > 0 ? (scrollY / scrollHeight) * 100 : 0;
  const scrollColor = "bg-gray-900 dark:bg-neutral-50";

  const { titleColor, titleBackgroundColor, subNavbarTitleColor, menuColor } =
    useMemo(() => {
      if (isWritePage) {
        return {
          titleColor: "text-black dark:text-white",
          titleBackgroundColor: "bg-slate-50 dark:bg-neutral-800",
          subNavbarTitleColor: "text-black dark:text-white",
          menuColor: "text-black dark:text-white",
        };
      }

      const subNavbarVisible = scrollY <= subNavbarHeight;

      if (isPost) {
        if (subNavbarVisible) {
          return {
            titleColor: "text-transparent dark:text-transparent",
            titleBackgroundColor: "bg-transparent",
            subNavbarTitleColor: "text-white dark:text-white",
            menuColor: "text-white dark:text-white",
          };
        }
        return {
          titleColor: "bg-transparent",
          titleBackgroundColor: "bg-slate-50 dark:bg-neutral-800",
          subNavbarTitleColor: "text-white dark:text-white",
          menuColor: "text-black dark:text-white",
        };
      }

      if (subNavbarVisible) {
        return {
          titleColor: "text-transparent dark:text-transparent",
          titleBackgroundColor: "bg-slate-50 dark:bg-neutral-800",
          subNavbarTitleColor: "text-black dark:text-white",
          menuColor: "text-black dark:text-white",
        };
      }
      return {
        titleColor: "text-black dark:text-white",
        titleBackgroundColor: "bg-slate-50 dark:bg-neutral-800",
        subNavbarTitleColor: "text-black dark:text-white",
        menuColor: "text-black dark:text-white",
      };
    }, [isPost, isWritePage, scrollY, subNavbarHeight]);

  const handleNavbarClick = () => {
    if (window.scrollY === 0) {
      if (lan === "en" || lan === "ja" || lan === "ko") {
        window.location.href = `/${lan}`;
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const closeMenu = () => setIsMenuOpen(false);

  if (shouldHideNavbar) {
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
            className={`min-w-32 max-w-80 sm:max-w-96 md:max-w-full text-2xl sm:text-3xl truncate text-center font-navbar dark:text-slate-50 px-5 select-none cursor-pointer ${titleColor}`}
          >
            {title}
          </div>
        </div>

        {/* 다국어 / 다크모드 / 프로필 컨테이너 */}
        <div className="flex-1 flex justify-end items-center gap-8 select-none">
          {/* 다국어 스위치 */}
          <div className="hidden md:flex">
            <SetLanguage id="language-select-desktop" />
          </div>

          {/* 다크모드 스위치 */}
          <div className="hidden md:flex">
            <SetMode id="theme-toggle-desktop" />
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

      {/* 서브 네이게이션 바 (write 페이지에서는 숨김) */}
      {!isWritePage && (
        <NavbarSub
          ref={subNavbarRef}
          isPost={isPost}
          textColor={subNavbarTitleColor}
          title={postInfo?.title || subnavTitle}
          category={postInfo?.category || ""}
          date={postInfo?.date || ""}
        />
      )}
    </>
  );
};

export default Navbar;
