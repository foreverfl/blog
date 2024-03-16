"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { logout, loginSuccess } from "@/features/user/userSlice";
import { setCurrentView, resetView } from "@/features/blog/blogSlice";
import NavbarSub from "./NavbarSub";
import Menu from "./navbar/Menu";
import Profile from "./navbar/Profile";
import SetLanguage from "./navbar/SetLanguage";
import SetMode from "./navbar/SetMode";
import { fetchClassificationsAndCategories } from "@/features/category/categorySlice";
import { fetchPosts } from "@/features/post/postsSlice";
import { resetTitle, setCurrentTitle } from "@/features/blog/blogTitleSlice";

// React.FC는 "Function Component"의 약자로, 이 타입은 컴포넌트가 React 요소를 반환한다는 것과 props 타입을 지정할 수 있는 기능을 제공
const Navbar: React.FC = () => {
  // Redux
  const dispatch = useAppDispatch();

  // User
  const { userName, userId, email, photo, isLoggedOut } = useAppSelector(
    (state) => state.user
  );

  // Blog
  const { currentView, currentCategory, postId } = useAppSelector(
    (state) => state.blog
  );

  // Title
  const initialTitle = useAppSelector((state) => state.blogTitle.initialTitle);
  const currentTitle = useAppSelector((state) => state.blogTitle.currentTitle);

  useEffect(() => {
    dispatch(fetchClassificationsAndCategories());
    dispatch(fetchPosts());
  }, [dispatch]);

  // State
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false); // 메뉴
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false); // 프로필
  const [scrollProgress, setScrollProgress] = useState(0); // 가로 스크롤바
  const [title, setTitle] = useState(initialTitle); // Title

  const handleLogoClick = () => {
    dispatch(setCurrentView({ view: "main" })); // 'main' 뷰로 상태 변경
  };

  useEffect(() => {
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

  // 스크롤 바에 따른 제목 변경
  useEffect(() => {
    const handleScroll = () => {
      const subNavbar = document.getElementById("subNavbar");
      if (!subNavbar) return; // SubNavbar 요소가 없으면 함수 종료

      const subNavbarHeight = subNavbar.offsetHeight;
      const scrollPosition = window.scrollY;

      if (scrollPosition > subNavbarHeight) {
        setTitle(currentTitle);
      } else {
        setTitle(initialTitle);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentTitle, initialTitle]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-slate-50 dark:bg-neutral-800 p-4 flex justify-between items-center">
        {/* 메뉴 열기 버튼 */}
        <div className="flex-1">
          <Menu
            isMenuOpen={isMenuOpen}
            isProfileOpen={isProfileOpen}
            toggleMenu={() => setIsMenuOpen(!isMenuOpen)}
          />
        </div>

        {/* 블로그 이름 */}
        <div className="flex-1 flex justify-center">
          <div
            onClick={handleLogoClick}
            className="text-2xl md:text-3xl font-navbar dark:text-slate-50 cursor-pointer"
          >
            {title}
          </div>
        </div>

        {/* 다국어 / 다크모드 / 프로필 컨테이너 */}
        <div className="flex-1 flex justify-end items-center gap-8">
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
            className="h-full bg-gray-900 dark:bg-neutral-50"
            style={{ width: `${scrollProgress}%` }}
          ></div>
        </div>
      </div>

      {/* 서브 네이게이션 바*/}
      <NavbarSub />
    </>
  );
};

export default Navbar;
