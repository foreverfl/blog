"use client";

// 외부 라이브러리 모듈
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

// Redux와 관련된 훅스와 기능들
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { logout, loginSuccess } from "@/features/user/userSlice";
import { setCurrentView, resetView } from "@/features/blog/blogSlice";
import { fetchClassificationsAndCategories } from "@/features/category/categorySlice";
import { fetchPosts } from "@/features/post/postsSlice";

// 컴포넌트 모듈
import NavbarSub from "./NavbarSub";
import Menu from "./navbar/Menu";
import Profile from "./navbar/Profile";
import SetLanguage from "./navbar/SetLanguage";
import SetMode from "./navbar/SetMode";
import { resetTitle } from "@/features/blog/blogTitleSlice";

type NavbarProps = {
  postIdx: string;
};

// React.FC는 "Function Component"의 약자로, 이 타입은 컴포넌트가 React 요소를 반환한다는 것과 props 타입을 지정할 수 있는 기능을 제공
const Navbar: React.FC<NavbarProps> = ({ postIdx }) => {
  const pathname = usePathname();
  const router = useRouter();

  // Redux
  const dispatch = useAppDispatch();

  // Language
  const lan = useAppSelector((state) => state.language);

  // User
  const { userName, userId, email, photo, isLoggedOut } = useAppSelector(
    (state) => state.user
  );

  // Title
  const initialTitle = useAppSelector((state) => state.blogTitle.initialTitle);
  const currentTitle = useAppSelector((state) => state.blogTitle.currentTitle);

  // Post
  const { currentPost, status } = useAppSelector((state) => state.postSelected);

  useEffect(() => {
    dispatch(fetchClassificationsAndCategories());
    dispatch(fetchPosts());
  }, [dispatch]);

  // State
  // 스크롤바
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollColor, setScrollColor] = useState(
    "bg-gray-900 dark:bg-neutral-50"
  );

  // 네비게이션
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const [menuColor, setMenuColor] = useState(
    postIdx ? "text-white dark:text-white" : "text-black dark:text-white"
  );
  const [titleColor, setTitleColor] = useState(
    postIdx
      ? "text-transparent dark:text-transparent"
      : "text-black dark:text-transparent"
  );
  const [titleBackgroundColor, setTitleBackgroundColor] = useState(
    postIdx ? "bg-transparent" : "bg-slate-50 dark:bg-neutral-800"
  );
  const [title, setTitle] = useState(postIdx ? currentTitle : initialTitle); // Title
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false); // 프로필
  const [navbarTitleColor, setnavbarTitleColor] = useState(
    postIdx ? "text-white" : "text-black dark:text-white"
  );

  // 서브 네비게이션
  const [subnavTitle, setSubnavTitle] = useState(
    postIdx ? currentTitle : initialTitle + "'s sundries"
  );

  // Handler
  const handleLogoClick = () => {
    dispatch(setCurrentView({ view: "main" })); // main 뷰로 상태 변경
    sessionStorage.setItem("currentView", "main");
    router.push("/", { scroll: false });
  };

  useLayoutEffect(() => {
    const fetchAuthStatus = async () => {
      try {
        let response;

        response = await fetch("/api/auth/status");
        const data = await response.json();

        if (response.ok) {
          if (data.isAuthenticated) {
            dispatch(
              loginSuccess({
                userId: data.user.userId,
                username: data.user.username,
                email: data.user.email,
                photo: data.user.photo,
              })
            );
          } else {
            dispatch(logout());
          }
        }
      } catch (error) {
        console.error("Failed to fetch auth status", error);
      }
    };

    fetchAuthStatus();
  }, [dispatch, isLoggedOut]);

  // 가로 스크롤
  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setScrollProgress(scrolled);
    };

    // 스크롤 이벤트 리스너 추가
    window.addEventListener("scroll", updateScrollProgress);

    return () => {
      // 컴포넌트가 언마운트될 때 이벤트 리스너 제거
      window.removeEventListener("scroll", updateScrollProgress);
    };
  }, []);

  // 스크롤 바 위치에 따른 효과
  useEffect(() => {
    const handleScroll = () => {
      const subNavbar = document.getElementById("subNavbar");
      if (!subNavbar) return; // SubNavbar 요소가 없으면 함수 종료

      const subNavbarHeight = subNavbar.offsetHeight;
      const scrollPosition = window.scrollY;

      const postPageRegex = /^\/posts\/[\w-]+$/;
      if (postPageRegex.test(pathname)) {
        setTitle(currentTitle);
        setSubnavTitle(currentTitle);

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
        // subNavbar가 보이지 않을 때
        if (scrollPosition > subNavbarHeight) {
          setTitle(currentTitle);
          setSubnavTitle(currentTitle);
        }

        // SubNavbar가 보일 때
        else {
          setTitle(initialTitle);
          setSubnavTitle(initialTitle + "'s sundries");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentTitle, initialTitle, pathname]);

  useLayoutEffect(() => {
    if (currentPost) {
      const updatedTitle =
        lan.value === "ja" ? currentPost.title_ja : currentPost.title_ko;
      setTitle(updatedTitle);
      setSubnavTitle(updatedTitle);
    }
  }, [lan, currentPost]);

  // 링크 이동 시 Redux 초기화
  useEffect(() => {
    const url = `${pathname}`; // 링크 이동을 pathname으로 감지
    resetTitle();
  }, [pathname]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 p-4 flex justify-between items-center ${titleBackgroundColor}`}
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
        <div className="flex-1 flex justify-center">
          <div
            onClick={handleLogoClick}
            className={`text-2xl md:text-3xl font-navbar dark:text-slate-50 select-none cursor-pointer ${titleColor}`}
          >
            {title}
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
            userName={userName || ""}
            photo={photo!}
            email={email || ""}
            isLoggedOut={isLoggedOut}
          />
        </div>
      </nav>

      {/* 가로 스크롤바 */}
      <div className="fixed top-0 left-0 right-0">
        <div className="w-full h-0.5 bg-transparent">
          <div
            className={`h-full ${scrollColor}`}
            style={{ width: `${scrollProgress}%` }}
          ></div>
        </div>
      </div>

      {/* 서브 네이게이션 바*/}
      <NavbarSub
        postIdx={postIdx}
        textColor={navbarTitleColor}
        title={subnavTitle}
      />
    </>
  );
};

export default Navbar;
