import React from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

const MainContent: React.FC = () => {
  const { userName, userId, email, photo, isLoggedOut } = useAppSelector(
    (state) => state.user
  );

  return (
    <div className="flex h-screen">
      {/* 왼쪽 부분: Classifications */}
      <div className="w-1/2 border-r border-gray-200">
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Classifications</h2>
          <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700">
            추가
          </button>
        </div>
        <ul className="overflow-auto">
          {/* 여기에 Classifications 목록을 동적으로 렌더링 */}
        </ul>
      </div>

      {/* 오른쪽 부분: Categories */}
      <div className="w-1/2">
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Categories</h2>
          <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700">
            추가
          </button>
        </div>
        <ul className="overflow-auto">
          {/* 여기에 선택된 Classification에 따른 Categories 목록을 동적으로 렌더링 */}
        </ul>
      </div>
    </div>
  );
};

export default MainContent;
