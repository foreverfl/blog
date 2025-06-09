"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { redirectToLoginWithReturnUrl } from "@/lib/auth";

interface ProfileProps {
  isProfileOpen: boolean;
  isMenuOpen: boolean;
  toggleProfile: () => void;
}

const Profile: React.FC<ProfileProps> = ({
  isProfileOpen,
  isMenuOpen,
  toggleProfile,
}) => {
  // Utilities
  const router = useRouter();
  const pathname = usePathname();
  const lan = pathname.split("/")[1];

  // State
  const [isReady, setIsReady] = useState(false); // 렌더링 이전에 보여줄 요소
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 여부 상태
  const [userData, setUserData] = useState<any>(null); // 사용자 데이터
  useEffect(() => {
    console.log("userData: ", userData);
  }, [userData]);

  // authStatus 체크
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch("/api/auth/status", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("data: ", data);
          if (data.isAuthenticated) {
            setUserData(data.user); // 사용자 정보 설정
            setIsLoggedIn(true); // 로그인 상태 설정
          }
        }
      } catch (error) {
        console.error("Error fetching authentication status:", error);
      }

      setIsReady(true); // 상태가 확정되면 준비 상태를 true로 설정
    };

    checkAuthStatus();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (response.ok) {
        setIsLoggedIn(false);
        setUserData(null);
        toggleProfile(); // 프로필 창 닫기
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
      {isLoggedIn ? (
        <>
          {/* 프로필 버튼 */}
          <button
            className="border border-gray-300 dark:border-transparent rounded-full bg-white dark:bg-black overflow-hidden"
            onClick={toggleProfile}
          >
            <Image
              src={userData?.photo || "/default_profile.jpg"}
              alt={userData?.username || "Profile"}
              width={100}
              height={100}
              className="w-8 h-8 rounded-full object-cover"
            />
          </button>

          {/* 프로필 창 */}
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
                    onClick={toggleProfile}
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
                        src={userData?.photo || "/images/smile.png"}
                        alt="Inner Profile"
                        width={100}
                        height={100}
                        priority={true}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    {/* 사용자 이름 */}
                    <div className="absolute bottom-10">
                      <p className="text-white text-lg text-center">
                        {userData?.userName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 환영 인사 */}
                <div className="mx-8 my-2">
                  <p className="px-8 py-4 text-center text-sm font-semibold text-gray-700 bg-white rounded-md">
                    {`${userData?.username}`}
                  </p>
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
      ) : (
        <button
          className="border border-gray-300 dark:border-transparent rounded-full bg-white dark:bg-black p-2 overflow-hidden"
          onClick={redirectToLoginWithReturnUrl}
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
      )}
    </>
  );
};

export default Profile;
