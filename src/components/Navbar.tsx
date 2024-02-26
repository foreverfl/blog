"use client";

import React, { useState } from "react";
import Link from "next/link";

// React.FC는 "Function Component"의 약자로, 이 타입은 컴포넌트가 React 요소를 반환한다는 것과 props 타입을 지정할 수 있는 기능을 제공
const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  return (
    <nav className="bg-slate-50 p-4 flex justify-between items-center">
      {/* 메뉴 토글 버튼 */}
      <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="z-30">
        {isMenuOpen ? "X" : "☰"}
      </button>

      {/* 블로그 이름 */}
      <span className="text-3xl font-sacramento">mogumogu&#39;s sundries</span>

      {/* 프로필 버튼 */}
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

      {/* 메뉴 내용 */}
      {isMenuOpen && (
        <div className="fixed top-0 left-0 w-3/4 md:w-1/4 h-full z-10 bg-white shadow-md transition-transform duration-500 ease-in-out">
          <ul className="pt-20">
            <li className="p-4 border-b">Home</li>
            <li className="p-4 border-b">About</li>
            <li className="p-4">Contact</li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
