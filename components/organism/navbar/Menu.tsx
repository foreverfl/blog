"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import SetLanguage from "./SetLanguage";
import SetMode from "./SetMode";
import Link from "next/link";
import Search from "./Search";

interface MenuProps {
  isMenuOpen: boolean;
  closeMenu: () => void;
  menuColor: string;
  isProfileOpen: boolean;
  toggleMenu: () => void;
}

interface Category {
  name_ko: string;
  name_ja: string;
  link: string;
}

interface Classification {
  name_ko: string;
  name_ja: string;
  link: string;
  categories: Category[];
}

const Menu: React.FC<MenuProps> = ({
  isMenuOpen,
  closeMenu,
  menuColor,
  isProfileOpen,
  toggleMenu: originalToggleMenu,
}) => {
  // Utilities
  const pathname = usePathname();
  const lan = pathname.split("/")[1];

  // State
  const [inputValue, setInputValue] = useState(""); // 검색창 텍스트
  const [isInputFilled, setIsInputFilled] = useState(false); // 검색창 상태
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({}); // Menu Expansion

  // Other Hooks
  // 토글 메뉴 재정의
  const toggleMenu = () => {
    originalToggleMenu(); // 원래의 토글 함수 호출
    setInputValue(""); // 검색창 텍스트 비우기
    setIsInputFilled(false); // 검색창 채워짐 상태 업데이트
  };

  useEffect(() => {
    // JSON 파일에서 데이터 가져오기
    const fetchData = async () => {
      try {
        const response = await fetch("/category.json");
        const data: Classification[] = await response.json();
        setClassifications(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // 메뉴 열리면 메인 스크롤 비활성화
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

  useEffect(() => {
    const initialToggleStates = classifications.reduce(
      (acc, classification) => {
        acc[classification.link] = false; // 기본적으로 모든 분류를 접혀있는 상태로 초기화
        return acc;
      },
      {} as { [key: string]: boolean },
    );
    setToggleStates(initialToggleStates);
  }, [classifications]);

  // Handler
  // 분류 토글 핸들러
  const handleToggle = (classificationId: string) => {
    setToggleStates((prevStates) => ({
      ...prevStates,
      [classificationId]: !prevStates[classificationId],
    }));
  };

  return (
    <>
      {/* 메뉴 열기 버튼 */}
      <button
        onClick={() => toggleMenu()}
        className={`z-30 transition-opacity duration-300 ${menuColor} ${
          isMenuOpen || isProfileOpen ? "opacity-0" : "opacity-100"
        }`}
      >
        <svg
          className="w-6 h-6 dark:fill-current dark:text-slate-50"
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

      {/* 메뉴 */}
      {/* 메뉴 배경 */}
      <div
        className={`h-screen overflow-y-auto fixed inset-0 bg-gradient-to-r from-neutral-800 to-transparent dark:from-neutral-600 dark:to-transparent z-10 transition-opacity duration-500 ease-in-out ${
          isMenuOpen ? "opacity-100" : "opacity-0"
        } ${isMenuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      >
        {/* 메뉴 컨테이너 */}
        <div
          className={`md:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6 min-h-screen z-10 pb-10 transition-all duration-500 ease-out ${
            isMenuOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0"
          }`}
        >
          <ul className="py-20 space-y-4">
            {/* 메뉴 닫기 버튼 */}
            <div className="absolute top-0 left-0 pt-6 pl-5">
              <svg
                onClick={() => toggleMenu()}
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

            {/* 다크모드 및 다국어 스위치 - 모바일 */}
            <div className="mx-8 rounded-md md:hidden bg-transparent">
              <div className="flex justify-end gap-4">
                {/* 다국어 스위치 */}
                <div className="flex">
                  <SetLanguage />
                </div>

                {/* 다크모드 스위치 */}
                <div className="flex">
                  <SetMode />
                </div>
              </div>
            </div>

            {/* 검색창 */}
            <div className="mx-8 flex items-center">
              <Search isMenuOpen={isMenuOpen} closeMenu={closeMenu} />
            </div>

            <div className="mx-8 divide-y divide-gray-400 bg-gray-100 rounded-md">
              {/* 내 정보 */}
              <a
                href="https://foreverfl.github.io/portfolio-v2/"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-8 py-4 flex items-center hover:bg-gray-200 rounded-t-md space-x-2"
              >
                <li className="flex items-center">
                  <Image
                    src={"/images/smile.png"}
                    alt={"Portfolio"}
                    width={15}
                    height={15}
                    className="flex-shrink-0"
                    style={{ width: "auto", height: "auto" }}
                  />
                  <span className="ml-3 text-black">portfolio</span>
                </li>
              </a>

              {/* 문서 */}
              <a
                href="https://docs.mogumogu.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-8 py-4 flex items-center hover:bg-gray-200 rounded-t-md space-x-2"
              >
                <li className="flex items-center">
                  <Image
                    src={"/images/icons8-document-white.svg"}
                    alt={"docs"}
                    width={15}
                    height={15}
                    className="flex-shrink-0"
                  />
                  <span className="ml-3 text-black">docs</span>
                </li>
              </a>

              {/* github */}
              <a
                href="https://github.com/foreverfl"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-8 py-4 flex items-center hover:bg-gray-200 space-x-2"
              >
                <li className="flex items-center">
                  <Image
                    src={"/logo/github.svg"}
                    alt={"Github"}
                    width={15}
                    height={15}
                    className="flex-shrink-0"
                  />
                  <span className="ml-3 text-black">github</span>
                </li>
              </a>

              {/* qiita */}
              <a
                href="https://qiita.com/mogumogusityau"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-8 py-4 flex items-center hover:bg-gray-200 rounded-b-md space-x-2"
              >
                {/* qiita */}
                <li className="flex items-center">
                  <Image
                    src={"/logo/qiita.png"}
                    alt={"Qiita"}
                    width={15}
                    height={15}
                    className="flex-shrink-0"
                  />
                  <span className="ml-3 text-black">qiita</span>
                </li>
              </a>
            </div>

            {/* 메뉴 */}
            <div className="space-y-4">
              {classifications.map((classification) => (
                <div
                  key={classification.link}
                  className="mx-8 divide-y divide-gray-400 bg-gray-100 rounded-md cursor-pointer"
                >
                  <div
                    className="px-8 py-4 rounded-t-md hover:bg-gray-200 text-black font-bold text-lg flex justify-between items-center"
                    onClick={() => handleToggle(classification.link)}
                  >
                    {lan === "ja"
                      ? classification.name_ja
                      : classification.name_ko}
                    {/* 조건부 아이콘 렌더링 */}
                    {toggleStates[classification.link] ? (
                      <svg
                        className="w-6 h-6 text-gray-800"
                        aria-hidden="true"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m5 15 7-7 7 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-6 h-6 text-gray-800"
                        aria-hidden="true"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m19 9-7 7-7-7"
                        />
                      </svg>
                    )}
                  </div>

                  {/* 조건부 카테고리 목록 렌더링 */}
                  <div
                    className={`overflow-hidden transition-all duration-1000 ${
                      toggleStates[classification.link]
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    {classification.categories.map((category) => (
                      <Link
                        key={category.link}
                        href={`/${lan}/${classification.link}/${category.link}`}
                        scroll={false}
                      >
                        <div
                          className={`px-8 py-4 hover:bg-gray-200 text-black`}
                          onClick={(e) => e.stopPropagation()} // 이벤트 버블링 방지
                        >
                          {/* 카테고리 이름 표시 */}
                          {lan === "ja" ? category.name_ja : category.name_ko}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 메뉴 템플릿*/}
            {/* <div className="mx-8 divide-y divide-gray-400 bg-gray-100 rounded-md cursor-pointer">
              <li className="px-8 py-4 rounded-t-md hover:bg-gray-20 text-black">
                menu 1-1
              </li>
              <li className="px-8 py-4 hover:bg-gray-200 text-black">
                menu 1-2
              </li>
              <li className="px-8 py-4 rounded-b-md hover:bg-gray-200 text-black">
                menu 1-3
              </li>
            </div> */}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Menu;
