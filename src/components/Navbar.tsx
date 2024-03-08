"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAppSelector } from "@/lib/hooks";
import NavbarSub from "./NavbarSub";

// React.FC는 "Function Component"의 약자로, 이 타입은 컴포넌트가 React 요소를 반환한다는 것과 props 타입을 지정할 수 있는 기능을 제공
const Navbar: React.FC = () => {
  // 메뉴
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState(""); // 검색창 텍스트
  const [isInputFilled, setIsInputFilled] = useState(false); // 검색창 상태

  useEffect(() => {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    if (isMenuOpen) {
      document.body.style.overflow = "hidden"; // 메뉴가 열리면 body 스크롤을 비활성화
      document.body.style.paddingRight = `${scrollbarWidth}px`; // 스크롤바 너비만큼 패딩 추가
    } else {
      document.body.style.overflow = "visible"; // 메뉴가 닫히면 body 스크롤을 다시 활성화
      document.body.style.paddingRight = "0px"; // 패딩 제거
    }
  }, [isMenuOpen]);

  const handleInputChange = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setInputValue(e.target.value);
    setIsInputFilled(e.target.value !== "");
  };

  // 프로필
  const { userName, isLoggedOut, photo } = useAppSelector(
    (state) => state.user
  );

  const handleProfileClick = () => {
    alert("이미 로그인 되었습니다.");
  };

  return (
    <>
      <nav className="bg-slate-50 p-4 flex justify-between items-center">
        {/* 메뉴 열기 버튼 */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`z-30 ${isMenuOpen ? "invisible" : "visible"}`}
        >
          <svg
            className="w-6 h-6"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
              d="M5 7h14M5 12h14M5 17h14"
            />
          </svg>
        </button>

        {/* 블로그 이름 */}
        <Link href="/" className="text-3xl font-sacramento cursor-pointer">
          mogumogu
        </Link>

        {/* 프로필 버튼 */}
        {!isLoggedOut ? (
          <button
            onClick={handleProfileClick}
            className="rounded-full border overflow-hidden"
          >
            <Image
              src={photo || "/images/smile.png"}
              alt="Profile Image"
              width={30}
              height={30}
            />
          </button>
        ) : (
          <Link href="/login">
            <button className="rounded-full p-2 border overflow-hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
        )}

        {/* 메뉴 */}
        {/* 메뉴 배경 */}
        <div
          className={`h-screen overflow-y-auto fixed inset-0 bg-gradient-to-r from-neutral-800 to-transparent z-10 transition-opacity duration-500 ease-in-out ${
            isMenuOpen ? "opacity-100" : "opacity-0"
          } ${isMenuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        >
          {/* 메뉴 컨테이너 */}
          <div
            className={`w-3/4 md:w-1/6 min-h-screen z-10 transition-all duration-500 ease-out ${
              isMenuOpen
                ? "translate-y-0 opacity-100"
                : "-translate-y-full opacity-0"
            }`}
          >
            <ul className="py-20 space-y-4">
              {/* 메뉴 닫기 버튼 */}
              <div className="absolute top-0 left-0 pt-6 pl-5">
                <svg
                  onClick={() => setIsMenuOpen(false)}
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

              {/* 검색창 */}
              <div className="mx-8 flex items-center">
                <svg
                  className="w-6 h-6 flex-shrink-0 mr-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="white"
                  viewBox="0 0 24 24"
                >
                  <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z" />
                  <path
                    fillRule="evenodd"
                    d="M21.7 21.7a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 0 1 1.4-1.4l3.5 3.5c.4.4.4 1 0 1.4Z"
                    clipRule="evenodd"
                  />
                </svg>

                <input
                  className="w-full p-4 bg-transparent border-none focus:ring-0 text-white"
                  type="search"
                  placeholder="Search..."
                  onChange={handleInputChange}
                  value={inputValue}
                />
                <button className="ml-3">
                  <svg
                    className={`w-6 h-6 ${
                      isInputFilled ? "text-white" : "text-gray-800"
                    }`}
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 12H5m14 0-4 4m4-4-4-4"
                    />
                  </svg>
                </button>
              </div>

              {/* 프로필 */}
              <div className="mx-8 divide-y divide-gray-400 bg-gray-100 rounded-md">
                {/* portfolio */}
                <li className="px-8 py-4 flex items-center hover:bg-gray-200 rounded-t-md space-x-2">
                  <Image
                    src={"/images/smile.png"}
                    alt={"Portfolio"}
                    width={15}
                    height={15}
                    className="flex-shrink-0"
                  />
                  <a
                    href="https://foreverfl.github.io/web-portfolio/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    mogumogu&#39;s portfolio
                  </a>
                  <span></span>
                </li>

                {/* github */}
                <li className="px-8 py-4 flex items-center hover:bg-gray-200 space-x-2">
                  <Image
                    src={"/logo/github.svg"}
                    alt={"Github"}
                    width={15}
                    height={15}
                    className="flex-shrink-0"
                  />
                  <a
                    href="https://github.com/foreverfl"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    mogumogu&#39;s github
                  </a>
                </li>

                {/* qiita */}
                <li className="px-8 py-4 flex items-center hover:bg-gray-200 rounded-b-md space-x-2">
                  <Image
                    src={"/logo/qiita.png"}
                    alt={"Qiita"}
                    width={15}
                    height={15}
                    className="flex-shrink-0"
                  />
                  <a
                    href="https://qiita.com/mogumogusityau"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    mogumogu&#39;s qiita
                  </a>
                </li>
              </div>

              {/* 메뉴 */}
              <div className="mx-8 divide-y divide-gray-400 bg-gray-100 rounded-md cursor-pointer">
                <li className="px-8 py-4  rounded-t-md hover:bg-gray-200">
                  메뉴1-1
                </li>
                <li className="px-8 py-4 hover:bg-gray-200">메뉴1-2</li>
                <li className="px-8 py-4 rounded-b-md hover:bg-gray-200">
                  메뉴1-3
                </li>
              </div>

              <div className="mx-8 divide-y divide-gray-400 bg-gray-100 rounded-md cursor-pointer">
                <li className="px-8 py-4 rounded-t-md hover:bg-gray-200">
                  메뉴2-1
                </li>
                <li className="px-8 py-4 hover:bg-gray-200">메뉴2-2</li>
                <li className="px-8 py-4 rounded-b-md hover:bg-gray-200">
                  메뉴2-3
                </li>
              </div>

              <div className="mx-8 divide-y divide-gray-400 bg-gray-100 rounded-md cursor-pointer">
                <li className="px-8 py-4 rounded-t-md hover:bg-gray-200">
                  메뉴3-1
                </li>
                <li className="px-8 py-4 hover:bg-gray-200">메뉴3-2</li>
                <li className="px-8 py-4 rounded-b-md hover:bg-gray-200">
                  메뉴3-3
                </li>
              </div>

              <div className="mx-8 divide-y divide-gray-400 bg-gray-100 rounded-md cursor-pointer">
                <li className="px-8 py-4  rounded-t-md hover:bg-gray-200">
                  메뉴4-1
                </li>
                <li className="px-8 py-4 hover:bg-gray-200">메뉴4-2</li>
                <li className="px-8 py-4 rounded-b-md hover:bg-gray-100">
                  메뉴4-3
                </li>
              </div>
            </ul>
          </div>
        </div>
      </nav>

      {/* 서브 네이게이션 바*/}
      <NavbarSub />
    </>
  );
};

export default Navbar;
