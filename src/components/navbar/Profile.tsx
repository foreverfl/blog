"use client";

import React, { useState, useEffect, useLayoutEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { logout, loginSuccess } from "@/features/user/userSlice";
import { setCurrentView } from "@/features/blog/blogSlice";
import locales, { Locales } from "@/locale";

interface ProfileProps {
  isProfileOpen: boolean;
  isMenuOpen: boolean;
  toggleProfile: () => void;
  userName: string;
  photo: string;
  email: string;
  isLoggedOut: boolean;
}

const Profile: React.FC<ProfileProps> = ({
  isProfileOpen,
  isMenuOpen,
  toggleProfile,
  userName,
  photo,
  email,
  isLoggedOut,
}) => {
  // Utilities
  const pathname = usePathname();
  const router = useRouter();

  // Redux
  const dispatch = useAppDispatch();

  const currentLanguage = useAppSelector((state) => state.language.value);
  const languageKey = currentLanguage as keyof Locales; // 타입 단언을 위한 Locales의 키

  // State
  const [isPostPage, setIsPostPage] = useState(pathname.startsWith("/post/"));
  const [isReady, setIsReady] = useState(false); // 렌더링 이전에 보여줄 요소
  const [isAdmin, setIsAdmin] = useState(false);
  const [visitorData, setVisitorData] = useState({
    total: 0,
    prev: 0,
    today: 0,
  });

  // Other Hooks
  // Admin 여부 확인
  useEffect(() => {
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") || []; // 현재 로그인한 유저의 이메일이 관리자 목록에 포함되어 있는지 확인

    if (email) {
      setIsAdmin(adminEmails.includes(email));
    }
  }, [email, isAdmin]);

  // 방문자 체크. 마운팅 시 처음에만 이루어져야함.
  useEffect(() => {
    const fetchVisitorData = async () => {
      try {
        const response = await fetch("/api/visitors/count");
        if (!response.ok) {
          throw new Error("Server response was not ok");
        }
        const data = await response.json();
        setVisitorData({
          total: data.total,
          prev: data.prev,
          today: data.today,
        });
      } catch (error) {
        console.error("Failed to fetch visitor data:", error);
      }
    };

    fetchVisitorData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // authStatus 체크
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsReady(true); // 상태가 확정되면 준비 상태를 true로 설정
    };

    checkAuthStatus();
  }, []); // 의존성 배열이 비어 있으므로 컴포넌트 마운트 시 한 번만 실행

  // Handler
  const handleViewChange = (view: string) => {
    dispatch(setCurrentView({ view }));
    sessionStorage.setItem("currentView", view);
    toggleProfile();
    router.push("/", { scroll: false });
  };

  const handleLoginRedirect = () => {
    document.cookie =
      "preLoginUrl=" +
      encodeURIComponent(window.location.href) +
      "; path=/; max-age=600"; // 현재 URL을 쿠키에 저장

    router.push("/login"); // 로그인 페이지로 리디렉트
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (response.ok) {
        dispatch(logout());
        toggleProfile(); // 프로필 창 닫기
        if (!isPostPage) {
          dispatch(setCurrentView({ view: "main" }));
          sessionStorage.setItem("currentView", "main");
        }
      } else {
        console.error("로그아웃 실패");
      }
    } catch (error) {
      console.error("로그아웃 시도 중 오류 발생", error);
    }
  };

  if (!isReady) {
    return (
      <div className="rounded-full p-2 border overflow-hidden animate-pulse">
        <div className="h-6 w-6"></div>
      </div>
    );
  }

  return (
    <>
      {isLoggedOut ? (
        <button
          className="border border-gray-300 dark:border-transparent rounded-full bg-white dark:bg-black p-2 overflow-hidden"
          onClick={handleLoginRedirect}
        >
          <svg
            className="h-6 w-6 dark:fill-current dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeWidth="2"
              d="M7 17v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3Zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        </button>
      ) : (
        <button
          onClick={() => toggleProfile()}
          className={`rounded-full overflow-hidden transition-opacity duration-300 ${
            isMenuOpen || isProfileOpen ? "opacity-0" : "opacity-100"
          }`}
        >
          {photo ? (
            <Image
              src={photo}
              alt="Profile Image"
              width={100}
              height={100}
              className="w-10 h-10 object-cover"
            />
          ) : (
            <div className="w-7 h-7 flex justify-center items-center"></div>
          )}
        </button>
      )}

      {/* 프로필 */}
      <div
        className={`h-screen overflow-y-auto fixed inset-0 flex justify-end bg-gradient-to-l from-neutral-800 to-transparent dark:from-neutral-600 dark:to-transparent z-10 transition-opacity duration-500 ease-in-out ${
          isProfileOpen ? "opacity-100" : "opacity-0"
        } ${isProfileOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        {/* 프로필 컨테이너 */}
        <div
          className={`w-full md:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6 min-h-screen pb-10 z-10 transition-all duration-500 ease-out ${
            isProfileOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0"
          }`}
        >
          <ul className="py-20 space-y-4">
            {/* 프로필 닫기 버튼 */}
            <div className="absolute top-0 right-0 pt-6 pr-5">
              <svg
                onClick={() => toggleProfile()}
                className="w-6 h-6 cursor-pointer stroke-sky-50 hover:stroke-slate-500"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="white"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18 18 6m0 12L6 6"
                />
              </svg>
            </div>

            {/* 프로필 이미지 및 사용자 이름 */}
            <div className="relative mx-8 mt-8">
              <div className="bg-gray-200 square rounded-lg flex justify-center items-center overflow-hidden">
                {/* 배경 이미지 */}
                <Image
                  src="/images/profile_background.webp"
                  alt="Background"
                  width={0}
                  height={0}
                  className="w-full h-full object-cover"
                />
                {/* 프로필 이미지 */}
                <div className="absolute">
                  <Image
                    src={photo || "/images/smile.png"}
                    alt="Inner Profile"
                    width={100}
                    height={100}
                    priority={true}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                {/* 사용자 이름 */}
                <div className="absolute bottom-10">
                  <p className="text-white text-lg text-center">{userName}</p>
                </div>
              </div>
            </div>

            {/* 방문자 수 표시 */}
            <div className="flex justify-between items-center mx-8 my-4 text-white gap-4">
              <div className="flex-1">
                <p className="text-sm">Total</p>
                <p className="text-xl font-bold">{visitorData.total}</p>
              </div>
              <div className="flex-initial text-right">
                <p className="text-xs">Prev</p>
                <p>{visitorData.prev}</p>
              </div>
              <div className="flex-initial text-right">
                <p className="text-xs">Today</p>
                <p>{visitorData.today}</p>
              </div>
            </div>

            {/* 메뉴 옵션 */}
            <div className="mx-8 divide-y divide-gray-400 bg-gray-100 rounded-md">
              {isAdmin ? (
                <>
                  <li
                    onClick={() => handleViewChange("adminCategoryManagement")}
                    className="px-8 py-4 flex items-center rounded-t-md hover:bg-gray-200 cursor-pointer"
                  >
                    <Image
                      src={"/images/category.png"}
                      alt={"Category Management"}
                      width={15}
                      height={15}
                      className="flex-shrink-0"
                    />
                    <span className="ml-3 text-black">
                      {locales[languageKey].categoryManagement}
                    </span>
                  </li>
                  <li
                    onClick={() => handleViewChange("adminCommentList")}
                    className="px-8 py-4 flex items-center hover:bg-gray-200 cursor-pointer"
                  >
                    <Image
                      src={"/images/list.png"}
                      alt={"Post Management"}
                      width={15}
                      height={15}
                      className="flex-shrink-0"
                    />
                    <span className="ml-3 text-black">
                      {locales[languageKey].postManagement}
                    </span>
                  </li>
                  <li
                    onClick={() => handleViewChange("adminCreatePost")}
                    className="px-8 py-4 flex items-center rounded-b-md hover:bg-gray-200 cursor-pointer"
                  >
                    <Image
                      src={"/images/add.png"}
                      alt={"Post Addition"}
                      width={15}
                      height={15}
                      className="flex-shrink-0"
                    />
                    <span className="ml-3 text-black">
                      {locales[languageKey].createPost}
                    </span>
                  </li>
                </>
              ) : (
                <li
                  onClick={() => handleViewChange("userComments")}
                  className="px-8 py-4 flex items-center hover:bg-gray-200 cursor-pointer"
                >
                  <Image
                    src={"/images/list.png"}
                    alt={"My Comments"}
                    width={15}
                    height={15}
                    className="flex-shrink-0"
                  />
                  <span className="ml-3 text-black">
                    {locales[languageKey].myComments}
                  </span>
                </li>
              )}
            </div>

            {/* 로그아웃 버튼 */}
            <div className="mx-8 my-4">
              <button
                onClick={handleLogout}
                className="w-full px-8 py-4 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Sign Out
              </button>
            </div>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Profile;
