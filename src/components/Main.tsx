"use client";

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import AdminCategoryManagement from "@/components/main/AdminCategoryManagement";
import AdminPostList from "@/components/main/AdminPostList";
import AdminCreatePost from "@/components/main/AdminCreatePost";
import UserComments from "@/components/main/UserComments";
import UserPostList from "@/components/main/UserPostList";
import UserPostDetail from "@/components/main/UserPostDetail";
import MainContent from "@/components/main/MainContent";
import { setCurrentView } from "@/features/blog/blogSlice";

const Main: React.FC = () => {
  // Redux
  const dispatch = useAppDispatch();

  const { currentView } = useAppSelector((state) => state.blog);

  useEffect(() => {
    const savedView = sessionStorage.getItem("currentView") || "main";
    dispatch(setCurrentView({ view: savedView }));
  });

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
      case "userPostDetail":
        return <UserPostDetail />;
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
