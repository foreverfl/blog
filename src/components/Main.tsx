"use client";

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { logout, loginSuccess } from "@/features/user/userSlice";

const Main: React.FC = () => {
  const { userName, userId, email, photo, isLoggedOut } = useAppSelector(
    (state) => state.user
  );

  return (
    <div className="min-h-screen">
      {isLoggedOut ? (
        <>
          <p>로그인을 진행해주세요.</p>
        </>
      ) : userName ? ( // userName이 실제로 존재하는지 여부를 체크
        <>
          <p>안녕하세요!! {userName}님</p>
          <p>이메일: {email}</p>
          <p>사진: {photo}</p>
        </>
      ) : (
        // userName이 없을 경우 로그인 상태가 아니라고 가정하고 메시지 출력
        <>
          <p>로그인을 진행해주세요.</p>
        </>
      )}
    </div>
  );
};

export default Main;
