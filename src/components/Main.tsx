"use client";

import React, { useEffect } from "react";
import Image from "next/image";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setCurrentView } from "@/features/blog/blogSlice";

import AdminCategoryManagement from "@/components/main/AdminCategoryManagement";
import AdminPostList from "@/components/main/AdminPostList";
import AdminCreatePost from "@/components/main/AdminCreatePost";
import UserComments from "@/components/main/UserComments";
import UserPostList from "@/components/main/UserPostList";
import MainContent from "@/components/main/MainContent";
import UserPostListSearch from "./main/UserPostListSearch";

const Main: React.FC = () => {
  // Redux
  const dispatch = useAppDispatch();

  const { currentView, loading } = useAppSelector((state) => state.blog);

  useEffect(() => {
    const savedView = sessionStorage.getItem("currentView") || "main";
    dispatch(setCurrentView({ view: savedView }));
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-transparent">
          <Image
            src="/images/gear.webp"
            width={250}
            height={250}
            alt="loading"
            priority={true}
          />
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case "adminCategoryManagement":
        return <AdminCategoryManagement />;
      case "adminPostList":
        return <AdminPostList />;
      case "adminCreatePost":
        return <AdminCreatePost />;
      case "userComments":
        return <UserComments />;
      case "userPostList":
        return <UserPostList />;
      case "userPostListSearch":
        return <UserPostListSearch />;
      default:
        return <MainContent />; // 기본적으로 메인 페이지 컨텐츠를 렌더링
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center dark:bg-neutral-900">
      <div className="w-full md:w-3/5">{renderContent()}</div>
    </div>
  );
};

export default Main;
