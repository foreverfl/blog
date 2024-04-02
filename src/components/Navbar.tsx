"use client";

// 외부 라이브러리 모듈
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

// Redux와 관련된 훅스와 기능들
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { logout, loginSuccess } from "@/features/user/userSlice";
import { setCurrentView, resetView } from "@/features/blog/blogSlice";
import { fetchClassificationsAndCategories } from "@/features/category/categorySlice";

// 컴포넌트 모듈
import NavbarSub from "./NavbarSub";
import Menu from "./navbar/Menu";
import Profile from "./navbar/Profile";
import SetLanguage from "./navbar/SetLanguage";
import SetMode from "./navbar/SetMode";
import { resetTitle } from "@/features/blog/blogTitleSlice";
import { addPreviousLink, setUsedImages } from "@/features/blog/blogRouteSlice";
import { deleteImage } from "@/lib/workers";

type NavbarProps = {
  postIdx: string;
};

// React.FC는 "Function Component"의 약자로, 이 타입은 컴포넌트가 React 요소를 반환한다는 것과 props 타입을 지정할 수 있는 기능을 제공
const Navbar: React.FC<NavbarProps> = ({ postIdx }) => {
  // Utilities
  const pathname = usePathname();
  const router = useRouter();

  // Redux
  const dispatch = useAppDispatch();
  const lan = useAppSelector((state) => state.language); // Language
  const { userName, userId, email, photo, isLoggedOut } = useAppSelector(
    (state) => state.user
  ); // User
  const { classifications, categories, loading } = useAppSelector(
    (state) => state.category
  ); // Cateogry
  const { currentPost, status } = useAppSelector((state) => state.postSelected); // Post
  // Link
  const { previousLinks, usedImages } = useAppSelector(
    (state) => state.blogRoute
  );

  // State
  // 주소 상태
  const [isPostPage, setIsPostPage] = useState(pathname.startsWith("/post/"));
  // 스크롤바
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollColor, setScrollColor] = useState(
    "bg-gray-900 dark:bg-neutral-50"
  );
  // 네비게이션
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [menuColor, setMenuColor] = useState(
    isPostPage ? "text-white dark:text-white" : "text-black dark:text-white"
  );
  const [titleColor, setTitleColor] = useState(
    isPostPage
      ? "text-transparent dark:text-transparent"
      : "text-black dark:text-transparent"
  );
  const [titleBackgroundColor, setTitleBackgroundColor] = useState(
    isPostPage ? "bg-transparent" : "bg-slate-50 dark:bg-neutral-800"
  );
  const [title, setTitle] = useState(""); // Title
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false); // 프로필
  const [navbarTitleColor, setnavbarTitleColor] = useState(
    isPostPage ? "text-white" : "text-black dark:text-white"
  );
  const [titleIsHovered, setTitleIsHovered] = useState(false);

  // 서브 네비게이션
  const [subnavTitle, setSubnavTitle] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [updatedDate, setUpdatedDate] = useState<Date | undefined>(undefined);

  // Other Hooks
  // 카테고리 가져오기
  useEffect(() => {
    dispatch(fetchClassificationsAndCategories());
  }, [dispatch]);

  // updatedDate 상태 업데이트
  useEffect(() => {
    if (currentPost) {
      // Category 정보 업데이트
      const currentCategory = categories.find(
        (cat) => cat._id === currentPost.category
      );
      if (currentCategory) {
        const currentCategoryName =
          lan.value === "ja"
            ? currentCategory.name_ja
            : currentCategory.name_ko;
        setCategory(currentCategoryName);
      } else {
        setCategory(undefined); // 또는 "기본 카테고리 이름" 같은 기본값 설정
      }

      setUpdatedDate(currentPost.updatedAt || currentPost.createdAt);
    }
  }, [dispatch, categories, currentPost, lan.value]); // Category 가져오기

  // Link를 이용한 'updating_시간_파일명' 삭제 로직
  useEffect(() => {
    dispatch(addPreviousLink(pathname));

    const containsEdit = previousLinks.some((link) => link.includes("edit"));
    if (containsEdit) {
      const deleteUsedImages = async () => {
        for (const image of usedImages) {
          await deleteImage(image); // 가정한 비동기 이미지 삭제 함수
        }
        dispatch(setUsedImages([])); // 모든 이미지 삭제 후 usedImages 상태를 초기화
      };
      deleteUsedImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, pathname]);

  // 회원 정보 redux에 저장
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

    window.addEventListener("scroll", updateScrollProgress); // 스크롤 이벤트 리스너 추가

    return () => {
      window.removeEventListener("scroll", updateScrollProgress); // 컴포넌트가 언마운트될 때 이벤트 리스너 제거
    };
  }, []);

  // 언어 및 페이지에 따른 title 변경
  useEffect(() => {
    if (isPostPage) {
      if (currentPost) {
        const updatedTitle =
          lan.value === "ja" ? currentPost.title_ja : currentPost.title_ko;

        setTitle(updatedTitle);
        setSubnavTitle(updatedTitle);
      }
    } else {
      setTitle("mogumogu");
      setSubnavTitle("mogumogu's sundries");
    }
  }, [lan, currentPost, isPostPage]);

  // hover에 따른 title 변경
  useEffect(() => {
    if (isPostPage) {
      const subNavbar = document.getElementById("subNavbar");
      if (!subNavbar) return; // SubNavbar 요소가 없으면 함수 종료

      const subNavbarHeight = subNavbar.offsetHeight;
      const scrollPosition = window.scrollY;

      // SubNavbar가 보일때만 적용
      if (scrollPosition < subNavbarHeight) {
        if (titleIsHovered) {
          setTitleColor("text-white dark:text-white");

          if (lan.value === "ja") {
            setTitle("ホームに移動します。");
          } else {
            setTitle("홈으로 이동합니다.");
          }
        } else {
          setTitleColor("text-transparent dark:text-transparent");
          if (currentPost) {
            const updatedTitle =
              lan.value === "ja" ? currentPost.title_ja : currentPost.title_ko;
            setTitle(updatedTitle);
            setSubnavTitle(updatedTitle);
          }
        }
      }
    }
  }, [currentPost, isPostPage, lan.value, titleIsHovered]);

  // 스크롤 바 위치에 따른 효과
  useEffect(() => {
    const handleScroll = () => {
      const subNavbar = document.getElementById("subNavbar");
      if (!subNavbar) return; // SubNavbar 요소가 없으면 함수 종료

      const subNavbarHeight = subNavbar.offsetHeight;
      const scrollPosition = window.scrollY;

      if (isPostPage) {
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
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isPostPage]);

  // Handler
  const handleLogoClick = () => {
    const subNavbar = document.getElementById("subNavbar");
    if (!subNavbar) return; // SubNavbar 요소가 없으면 함수 종료

    const subNavbarHeight = subNavbar.offsetHeight;
    const scrollPosition = window.scrollY;

    if (scrollPosition < subNavbarHeight) {
      dispatch(setCurrentView({ view: "main" })); // main 뷰로 상태 변경
      sessionStorage.setItem("currentView", "main");
      router.push("/", { scroll: false });
    } else {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }
  };

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
          className="flex-1 flex justify-center"
        >
          <div
            onClick={handleLogoClick}
            className={`min-w-32 text-2xl md:text-3xl font-navbar dark:text-slate-50 select-none cursor-pointer ${titleColor}`}
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
        postIdx={postIdx}
        textColor={navbarTitleColor}
        title={subnavTitle}
        updatedDate={updatedDate}
        category={category ?? ""}
        status={status}
      />
    </>
  );
};

export default Navbar;
