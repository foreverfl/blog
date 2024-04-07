import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setCurrentView } from "@/features/blog/blogSlice";
import { setSelectedCategory } from "@/features/category/categorySelectedSlice";
import { setSearchTitle } from "@/features/category/searchTitleSlice";

import SetLanguage from "./SetLanguage";
import SetMode from "./SetMode";

interface MenuProps {
  isMenuOpen: boolean;
  menuColor: string;
  isProfileOpen: boolean;
  toggleMenu: () => void;
}

interface Category {
  _id: string;
  classification: string;
  name_ko: string;
  name_ja: string;
}

const Menu: React.FC<MenuProps> = ({
  isMenuOpen,
  menuColor,
  isProfileOpen,
  toggleMenu: originalToggleMenu,
}) => {
  // Utilities
  const router = useRouter();

  // Redux
  const dispatch = useAppDispatch();

  const { classifications, categories, loading } = useAppSelector(
    (state) => state.category
  );
  const currentLanguage = useAppSelector((state) => state.language.value);

  // State
  const [inputValue, setInputValue] = useState(""); // 검색창 텍스트
  const [isInputFilled, setIsInputFilled] = useState(false); // 검색창 상태
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({}); // Menu Expansion

  // Other Hooks
  // 토글 메뉴 재정의
  const toggleMenu = () => {
    originalToggleMenu(); // 원래의 토글 함수 호출
    setInputValue(""); // 검색창 텍스트 비우기
    setIsInputFilled(false); // 검색창 채워짐 상태 업데이트
  };

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
        acc[classification._id] = false; // 기본적으로 모든 분류를 접혀있는 상태로 초기화
        return acc;
      },
      {}
    );
    setToggleStates(initialToggleStates);
  }, [classifications]); // classifications 데이터가 변경될 때마다 초기 토글 상태 업데이트

  // Handler
  // 카테고리 관련 핸들러
  const handleViewChange = (view: string, category: Category) => {
    router.push("/", { scroll: false });
    dispatch(setCurrentView({ view }));
    sessionStorage.setItem("currentView", view);
    dispatch(setSelectedCategory(category));
    toggleMenu();
  };

  // 검색 관련 핸들러
  const handleInputChange = (e: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setInputValue(e.target.value);
    setIsInputFilled(e.target.value !== "");
  };

  const handleSearchSubmit = () => {
    router.push("/", { scroll: false });
    dispatch(setSearchTitle(`${inputValue}`)); // 검색 타이틀 설정
    sessionStorage.setItem("currentView", "userPostListSearch");
    dispatch(
      setCurrentView({ view: "userPostListSearch", category: undefined })
    ); // 뷰 변경
  };

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
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchSubmit();
                  }
                }}
              />
              <button className="ml-3" onClick={handleSearchSubmit}>
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

            {/* 내 정보 */}
            <div className="mx-8 divide-y divide-gray-400 bg-gray-100 rounded-md">
              <a
                href="https://foreverfl.github.io/web-portfolio/"
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
                  />
                  <span className="ml-3 text-black">
                    mogumogu&#39;s portfolio
                  </span>
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
                  <span className="ml-3 text-black">mogumogu&#39;s github</span>
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
                  <span className="ml-3 text-black">mogumogu&#39;s qiita</span>
                </li>
              </a>
            </div>

            {/* 메뉴 */}
            <div className="space-y-4">
              {classifications.map((classification) => (
                <div
                  key={classification._id}
                  className="mx-8 divide-y divide-gray-400 bg-gray-100 rounded-md cursor-pointer"
                >
                  <div
                    className="px-8 py-4 rounded-t-md hover:bg-gray-200 text-black font-bold text-lg flex justify-between items-center"
                    onClick={() => handleToggle(classification._id)}
                  >
                    {currentLanguage === "ko"
                      ? classification.name_ko
                      : classification.name_ja}
                    {/* 조건부 아이콘 렌더링 */}
                    {toggleStates[classification._id] ? (
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
                      toggleStates[classification._id]
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    {categories
                      .filter(
                        (category) =>
                          category.classification === classification._id
                      )
                      .map((category, index, arr) => (
                        <div
                          key={category._id}
                          className={`px-8 py-4 hover:bg-gray-200 text-black ${
                            index < arr.length - 1
                              ? "border-b border-gray-200"
                              : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation(); // 이벤트 버블링 방지
                            handleViewChange("userPostList", category);
                          }}
                        >
                          {currentLanguage === "ko"
                            ? category.name_ko
                            : category.name_ja}
                        </div>
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
