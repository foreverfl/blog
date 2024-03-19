"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import React, { useEffect, useLayoutEffect, useState } from "react";
import "github-markdown-css";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";

interface PostProps {
  postIdx: string;
}

const Post: React.FC<PostProps> = ({ postIdx }) => {
  // Redux
  const dispatch = useAppDispatch();

  // Post
  const lan = useAppSelector((state) => state.language);
  const { currentPost, status } = useAppSelector((state) => state.postSelected);

  // State
  const [contentKoMarked, setContentKoMarked] = useState("");
  const [contentJaMarked, setContentJaMarked] = useState("");

  useEffect(() => {
    const updateContent = async () => {
      // Marked 인스턴스 설정
      const marked = new Marked(
        markedHighlight({
          langPrefix: "hljs language-", // CSS 클래스 접두사 설정
          highlight(code, lang, info) {
            const language = hljs.getLanguage(lang) ? lang : "plaintext";
            return hljs.highlight(code, { language }).value;
          },
        })
      );

      // marked.parse가 Promise를 반환하는 경우 처리
      if (currentPost !== null) {
        const parsedContent = await marked.parse(currentPost!.content_ko);
        setContentKoMarked(parsedContent);
      }
    };

    updateContent();
  }, [currentPost]);

  // 스크롤 최상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 로딩 중 UI 처리
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="min-h-screen flex justify-center items-center dark:bg-transparent">
        <div className="w-full md:w-3/5">
          <div className="my-56"></div>

          {currentPost ? (
            <div
              className="markdown-body min-h-screen"
              dangerouslySetInnerHTML={{ __html: contentKoMarked }}
            />
          ) : (
            // 포스트가 없는 경우
            <div>포스트가 존재하지 않습니다.</div>
          )}
          <div className="my-56"></div>
        </div>
      </div>
    </>
  );
};

export default Post;
