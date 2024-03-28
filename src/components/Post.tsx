"use client";

import React, { useEffect, useLayoutEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/esm/styles/prism";
import "github-markdown-css";
import { deletePost } from "@/lib/mongodb";
import { setCurrentView } from "@/features/blog/blogSlice";
import Link from "next/link";

interface PostProps {
  postIdx: string;
}

const Post: React.FC<PostProps> = ({ postIdx }) => {
  const router = useRouter();
  const pathname = usePathname();

  // Redux
  const dispatch = useAppDispatch();

  // User
  const { userName, userId, email, photo, isLoggedOut } = useAppSelector(
    (state) => state.user
  );

  // Post
  const lan = useAppSelector((state) => state.language);
  const { currentPost, status } = useAppSelector((state) => state.postSelected);

  // State
  const [isAdmin, setIsAdmin] = useState(false);
  const [content, setContent] = useState("");
  const [heartState, setHeartState] = useState("before");

  // 스크롤 최상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Admin 여부 확인
  useLayoutEffect(() => {
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") || [];

    if (email) {
      setIsAdmin(adminEmails.includes(email));
    }
  }, [email, isAdmin]);

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

  // 포스트 수정 핸들러
  const handleEditPost = (postId: string) => {
    router.push(`/post/${postId}/edit`, { scroll: false });
  };

  // 포스트 삭제 핸들러
  const handleDeletePost = async (postId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (confirmDelete) {
      try {
        const deletedCount = await deletePost(postId);
        if (deletedCount > 0) {
          alert("The post has been successfully deleted.");
        } else {
          alert("No post was found to delete.");
        }

        dispatch(setCurrentView({ view: "main" })); // main 뷰로 상태 변경
        sessionStorage.setItem("currentView", "main");
        router.push("/", { scroll: false });
      } catch (error) {
        console.error("Failed to delete the post", error);
        alert("An error occurred while trying to delete the post.");
      }
    }
  };

  // 클릭 이벤트 핸들러
  const handleClick = () => {
    if (heartState === "before") {
      setHeartState("clicked");
    } else if (heartState === "after") {
      setHeartState("unclicked");
    }
  };

  // 이미지 상태가 'clicked'나 'unclicked'로 변경될 때 애니메이션 재생 후 상태 변경
  useEffect(() => {
    if (heartState === "clicked") {
      setTimeout(() => {
        setHeartState("after");
      }, 500);
    } else if (heartState === "unclicked") {
      setTimeout(() => {
        setHeartState("before");
      }, 500);
    }
  }, [heartState]);

  // 이미지 상태에 따라 표시할 이미지 결정
  const getImageSrc = () => {
    switch (heartState) {
      case "before":
        return "/images/heart_before.png";
      case "after":
        return "/images/heart_after.png";
      case "clicked":
        return "/images/heart_clicked.gif";
      case "unclicked":
        return "/images/heart_unclicked.gif";
      default:
        return "/images/heart_before.png";
    }
  };

  // 로딩 중 UI 처리
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-transparent">
          <Image
            src="/images/gear.gif"
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
        <div className="markdown-body relative w-full md:w-3/5 dark:bg-transparent">
          {isAdmin && (
            <div className="absolute right-5 top-10 space-x-5">
              <button
                className="text-blue-500 border border-blue-500 hover:bg-blue-500 hover:text-white font-bold py-2 px-4 rounded"
                onClick={() => {
                  handleEditPost(currentPost!.index.toString());
                }}
              >
                Edit
              </button>
              <button
                className="text-red-500 border border-red-500 hover:bg-red-500 hover:text-white font-bold py-2 px-4 rounded"
                onClick={() => {
                  handleDeletePost(currentPost!._id.toString());
                }}
              >
                Delete
              </button>
            </div>
          )}

          <div className="my-56"></div>

          {/* 포스트 */}
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
            <div></div>
          )}

          <div className="my-56"></div>

          {/* 하트 버튼 및 Create Commons */}
          <div className="flex items-center justify-between my-4">
            {/* 하트 버튼 */}
            <button onClick={handleClick} className="p-2 rounded-full">
              <Image
                src={getImageSrc()}
                alt="Like"
                width={100}
                height={100}
                className="h-10 w-10 object-cover"
              />
            </button>
            {/* Create Commons */}
            <div>
              <Link href={"https://creativecommons.org/licenses/by-nc-nd/4.0/"}>
                <Image
                  src={"/images/by-nc-nd.svg"}
                  alt={"Creative Commons"}
                  width={100}
                  height={100}
                  priority={true}
                  className="w-32 object-cover"
                />
              </Link>
            </div>
          </div>

          <hr />

          {/* 댓글 */}
          <div className="space-y-4">
            {/* 다른 회원의 댓글 */}
            <div className="flex items-start space-x-3">
              <Image
                src={"/images/smile.png"}
                alt={"profile"}
                width={100}
                height={100}
                className="w-8 h-8 rounded-full"
              />
              <div className="bg-gray-200 dark:bg-neutral-700 rounded-lg p-3">
                <p className="text-sm dark:text-white">
                  회원의 댓글이 여기에 들어갑니다...
                </p>
              </div>
            </div>

            {/* 사용자의 댓글 */}
            <div className="flex items-start space-x-3 flex-row-reverse">
              <Image
                src={"/images/smile.png"}
                alt={"profile"}
                width={100}
                height={100}
                className="w-10 h-10 rounded-full"
              />
              <div className="bg-blue-500 rounded-lg p-3">
                <p className="text-sm text-white">
                  내 댓글이 여기에 들어갑니다...
                </p>
              </div>
            </div>
          </div>

          {/* 댓글 달기 */}

          <div className="my-56"></div>
        </div>
      </div>
    </>
  );
};

export default Post;
