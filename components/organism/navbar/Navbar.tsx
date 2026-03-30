"use client";

import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
} from "react";
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
          `/api/post/meta?lan=${lan}&classification=${classification}&category=${category}&slug=${slug}-${lan}`,
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
      if (lan === "en") {
        window.location.href = "/en";
      } else if (lan === "ja") {
        window.location.href = "/ja";
      } else if (lan === "ko") {
        window.location.href = "/ko";
      }
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Refs
  const subNavbarRef = useRef<HTMLDivElement>(null);

  // States
  // Initialize as false to match server render and avoid hydration mismatch.
  // useLayoutEffect below sets the correct value before paint.
  const [isPost, setIsPost] = useState(false);
  const [postInfo, setPostInfo] = useState<PostInfo | null>(null);
  const [title, setTitle] = useState("");
  const [hoveredTitle, setHoveredTitle] = useState(title);
  const [subnavTitle, setSubnavTitle] = useState("");

  // Styles - initialize with non-post defaults to match server render (isPost starts as false)
  const [titleColor, setTitleColor] = useState("text-black dark:text-white");
  const [subNavbarTitleColor, setSubNavbarTitleColor] = useState(
    "text-black dark:text-white",
  );
  const [titleBackgroundColor, setTitleBackgroundColor] = useState(
    "bg-slate-50 dark:bg-neutral-800",
  );
  const [menuColor, setMenuColor] = useState("text-black dark:text-white");

  // Scroll progress
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollColor = "bg-gray-900 dark:bg-neutral-50";

  // Menu / Profile
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // Fetch post info when navigating to a post page
  useEffect(() => {
    if (isPost) {
      fetchPostInfo();
    }
  }, [isPost, fetchPostInfo]);

  // Horizontal scroll progress bar
  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setScrollProgress(scrolled);
    };

    window.addEventListener("scroll", updateScrollProgress);

    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
    };
  }, []);

  // Title text
  useEffect(() => {
    if (isPost) {
      setTitle(postInfo?.title || "");
      setSubnavTitle(postInfo?.title || "");
      setHoveredTitle(postInfo?.title || "");
    } else {
      setTitle("mogumogu");
      setHoveredTitle("mogumogu");
      setSubnavTitle("mogumogu's lab");
    }
  }, [isPost, postInfo?.title]);

  // Fix navbar style when SubNavbar is not rendered (e.g. /write page)
  const isWritePage = pathname.includes("/write");

  // Sync isPost and styles before paint to prevent CSR navigation flash
  useLayoutEffect(() => {
    const postPage = isPostPage();
    setIsPost(postPage);

    if (isWritePage) {
      setTitleColor("text-black dark:text-white");
      setTitleBackgroundColor("bg-slate-50 dark:bg-neutral-800");
      setMenuColor("text-black dark:text-white");
      return;
    }

    if (postPage) {
      setTitleColor("text-transparent dark:text-transparent");
      setTitleBackgroundColor("bg-transparent");
      setSubNavbarTitleColor("text-white dark:text-white");
      setMenuColor("text-white dark:text-white");
    } else {
      setTitleColor("text-transparent dark:text-transparent");
      setTitleBackgroundColor("bg-slate-50 dark:bg-neutral-800");
      setSubNavbarTitleColor("text-black dark:text-white");
      setMenuColor("text-black dark:text-white");
    }
  }, [pathname, isWritePage, isPostPage]);

  // Scroll-based style updates
  useEffect(() => {
    if (isWritePage) return;
    const subNavbar = subNavbarRef.current;
    if (!subNavbar) return;

    const updateStyles = (scrollPosition: number) => {
      const subNavbarHeight = subNavbar.offsetHeight;

      if (isPost) {
        if (scrollPosition <= subNavbarHeight) {
          // SubNavbar visible
          setTitleColor("text-transparent dark:text-transparent");
          setTitleBackgroundColor("bg-transparent");
          setSubNavbarTitleColor("text-white dark:text-white");
          setMenuColor("text-white dark:text-white");
        } else {
          // SubNavbar scrolled out
          setTitleColor("bg-transparent");
          setTitleBackgroundColor("bg-slate-50 dark:bg-neutral-800");
          setSubNavbarTitleColor("text-white dark:text-white");
          setMenuColor("text-black dark:text-white");
        }
      } else {
        if (scrollPosition <= subNavbarHeight) {
          // SubNavbar visible
          setTitleColor("text-transparent dark:text-transparent");
          setSubNavbarTitleColor("text-black dark:text-white");
        } else {
          // SubNavbar scrolled out
          setTitleColor("text-black dark:text-white");
          setSubNavbarTitleColor("text-black dark:text-white");
        }
      }
    };

    // Apply styles immediately based on current scroll position
    updateStyles(window.scrollY);

    const handleScroll = () => {
      updateStyles(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isPost, isWritePage]);

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
            className={`min-w-32 max-w-80 sm:max-w-96 md:max-w-full text-2xl sm:text-3xl truncate text-center font-navbar dark:text-slate-50 px-5 select-none cursor-pointer ${titleColor}`}
          >
            {hoveredTitle}
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
      {!pathname.includes("/write") && (
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
