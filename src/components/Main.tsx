"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface DataItem {
  name: string;
}

const Main: React.FC = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const authCookie = Cookies.get("auth");
    console.log("authCookie:", authCookie);

    if (authCookie) {
      // JWT 토큰에서 사용자 ID 디코딩
      const decoded = jwtDecode<{ userId: string }>(authCookie);
      console.log("jwt_decoded:", decoded);
      fetchUserData();
    } else {
      setData([]); // 로그아웃 상태일 때는 데이터를 비움
    }
  }, []);

  const fetchUserData = async () => {
    const authCookie = Cookies.get("auth");
    if (!authCookie) return;

    const decoded = jwtDecode<{ userId: string }>(authCookie);
    const userId = decoded.userId;

    const response = await fetch(`/api/user/${userId}`);
    if (response.ok) {
      const userData = await response.json();
      setUserName(userData.name);
    } else {
      console.error("Failed to fetch user data");
    }
  };

  const handleLogout = () => {
    // 쿠키에서 JWT 토큰 삭제
    Cookies.remove("auth");
    window.location.reload(); // 페이지 새로고침
  };

  return (
    <div className="min-h-screen">
      <p>This is the main content area.</p>
      {userName ? (
        <>
          <p>Welcome, {userName}</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <p>Please log in.</p>
      )}
    </div>
  );
};

export default Main;
