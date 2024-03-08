"use client";

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { logout, loginSuccess } from "@/features/user/userSlice";

const Main: React.FC = () => {
  const dispatch = useAppDispatch();
  const { userName, userId, email, photo, isLoggedOut } = useAppSelector(
    (state) => state.user
  );

  useEffect(() => {
    const fetchAuthStatus = async () => {
      try {
        let response;

        if (isLoggedOut) {
          return;
        }

        response = await fetch("/api/auth/status");

        if (response.ok) {
          const data = await response.json();
          if (data.isAuthenticated) {
            dispatch(
              loginSuccess({
                userId: data.user.userId,
                username: data.user.username,
                email: data.user.email,
                photo: data.user.photo,
              })
            );
          } else {
            dispatch(logout());
          }
        }
      } catch (error) {
        console.error("Failed to fetch auth status", error);
      }
    };

    fetchAuthStatus();
  }, [dispatch, isLoggedOut]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (response.ok) {
        dispatch(logout());
      } else {
        console.error("로그아웃 실패");
      }
    } catch (error) {
      console.error("로그아웃 시도 중 오류 발생", error);
    }
  };

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
          <button onClick={handleLogout}>Logout</button>
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
