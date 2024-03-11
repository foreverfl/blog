import React from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

const MainContent: React.FC = () => {
  const { userName, userId, email, photo, isLoggedOut } = useAppSelector(
    (state) => state.user
  );

  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold">댓글 관리하기(유저)</h1>
    </div>
  );
};

export default MainContent;
