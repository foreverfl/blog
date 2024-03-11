import React from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

const MainContent: React.FC = () => {
  const { userName, userId, email, photo, isLoggedOut } = useAppSelector(
    (state) => state.user
  );

  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold">포스트 목록</h1>
    </div>
  );
};

export default MainContent;
