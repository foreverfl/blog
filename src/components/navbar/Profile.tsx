import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  // Redux
  const dispatch = useAppDispatch();

  const currentLanguage = useAppSelector((state) => state.language.value);

  // State
  const [isReady, setIsReady] = useState(false); // 렌더링 이전에 보여줄 요소

  // Handler
  const languageKey = currentLanguage as keyof Locales; // 타입 단언을 위한 Locales의 키

  const handleViewChange = (view: string) => {
    dispatch(setCurrentView({ view }));
    toggleProfile();
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (response.ok) {
        dispatch(logout());
        toggleProfile(); // 프로필 창 닫기
      } else {
        console.error("로그아웃 실패");
      }
    } catch (error) {
      console.error("로그아웃 시도 중 오류 발생", error);
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsReady(true); // 상태가 확정되면 준비 상태를 true로 설정
    };

    checkAuthStatus();
  }, []); // 의존성 배열이 비어 있으므로 컴포넌트 마운트 시 한 번만 실행

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
        <Link href="/login">
          <button className="border border-gray-300 dark:border-neutral-50 rounded-full p-2 overflow-hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 dark:fill-current dark:text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 14.4c-2.982 0-5.6-1.456-5.6-3.2 0-.964 1.312-1.858 3.343-2.463a11.641 11.641 0 0 1 4.514 0c2.03.605 3.343 1.499 3.343 2.463 0 1.744-2.618 3.2-5.6 3.2z"
              />
            </svg>
          </button>
        </Link>
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
          className={`md:w-1/3 lg:w-1/6 min-h-screen z-10 transition-all duration-500 ease-out ${
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
                    className="w-full h-auto object-cover rounded-full"
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
                <p className="text-xl font-bold">10,000</p>
              </div>
              <div className="flex-initial text-right">
                <p className="text-xs">Prev</p>
                <p>300</p>
              </div>
              <div className="flex-initial text-right">
                <p className="text-xs">Today</p>
                <p>100</p>
              </div>
            </div>

            {/* 메뉴 옵션 */}
            <div className="mx-8 divide-y divide-gray-400 bg-gray-100 rounded-md">
              {email === "forevermfl@gmail.com" ? (
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
                    onClick={() => handleViewChange("adminPostList")}
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
                  onClick={toggleProfile}
                  className="px-8 py-4 flex items-center hover:bg-gray-200"
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
