"use client";

import React, { useEffect, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/esm/styles/prism";
import "github-markdown-css";

interface PostProps {
  postIdx: string;
}

const Post: React.FC<PostProps> = ({ postIdx }) => {
  const pathname = usePathname();

  // Redux
  const dispatch = useAppDispatch();

  // Post
  const lan = useAppSelector((state) => state.language);
  const { currentPost, status } = useAppSelector((state) => state.postSelected);

  // State
  const [content, setContent] = useState("");

  // 스크롤 최상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const pathParts = pathname.split("/");
    const languageCode = pathParts[2];

    if (currentPost !== null) {
      if (languageCode === "ja") {
        setContent(currentPost.content_ja);
      } else {
        setContent(currentPost.content_ko);
      }
    }
  }, [currentPost, pathname]);

  // 로딩 중 UI 처리
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-transparent">
          <Image
            src="/images/gear.webp"
            width={250}
            height={250}
            alt="loading"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex justify-center items-center dark:bg-neutral-900">
        <div className="markdown-body w-full md:w-3/5 dark:bg-transparent">
          <div className="my-56"></div>
          {currentPost ? (
            <Markdown
              remarkPlugins={[remarkGfm]}
              components={{
                code(props) {
                  const { children, className, node, ...rest } = props;
                  const match = /language-(\w+)/.exec(className || "");
                  return match ? (
                    <SyntaxHighlighter
                      PreTag="div"
                      language={match[1]}
                      style={darcula}
                      customStyle={{ margin: "0", borderRadius: "20px" }} // pre 태그에 적용될 스타일
                      showLineNumbers={true}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code {...rest} className={className}></code>
                  );
                },
              }}
            >
              {content}
            </Markdown>
          ) : (
            <div>포스트가 존재하지 않습니다.</div>
          )}
          <div className="my-56"></div>
        </div>
      </div>
    </>
  );
};

export default Post;
