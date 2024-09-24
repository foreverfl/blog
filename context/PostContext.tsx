"use client";

import React, { createContext, useState, useContext } from "react";

// 프론트매터의 타입
interface FrontMatter {
  title: string;
  date: string;
  image: string;
}

// PostContext 타입
interface PostContextType {
  postInfo: FrontMatter | null;
  setPostInfo: (info: FrontMatter | null) => void;
}

// Context 생성
const PostContext = createContext<PostContextType | undefined>(undefined);

// Context Provider 생성
export const PostProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [postInfo, setPostInfo] = useState<FrontMatter | null>(null);

  return (
    <PostContext.Provider value={{ postInfo, setPostInfo }}>
      {children}
    </PostContext.Provider>
  );
};

// Context 사용을 위한 커스텀 훅
export const usePostContext = () => {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error("usePostContext must be used within a PostProvider");
  }
  return context;
};
