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
import {
  likePostByUser,
  unlikePostByUser,
} from "@/features/post/postSelectedSlice";

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

  // 현재 사용자가 이 포스트에 좋아요를 했는지 확인
  useEffect(() => {
    if (userId !== null) {
      const isLiked = currentPost?.like.includes(userId);
      setHeartState(isLiked ? "after" : "before");
    }
  }, [currentPost, userId]);

  // 클릭 이벤트 핸들러
  const handleClick = () => {
    if (!userId) {
      const confirmMessage =
        lan.value === "ja"
          ? "ログイン後に利用可能です。"
          : "로그인 후 이용 가능합니다.";
      if (window.confirm(confirmMessage)) {
        router.push("/login");
      }
      return;
    }

    if (heartState === "before") {
      dispatch(likePostByUser({ postId: currentPost!._id, userId }));
      setHeartState("after");
    } else if (heartState === "after") {
      dispatch(unlikePostByUser({ postId: currentPost!._id, userId }));
      setHeartState("before");
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
            priority={true}
            alt="loading"
            className="w-32 h-32 object-fit"
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
            <div className="flex items-center space-x-2 py-2 px-4 rounded-full shadow">
              <button
                onClick={handleClick}
                className="flex items-center justify-center p-1 rounded-full transition duration-500 ease-in-out transform hover:scale-110"
              >
                <Image
                  src={
                    heartState === "before"
                      ? "/images/heart_before.png"
                      : "/images/heart_after.png"
                  }
                  alt="Like"
                  width={40}
                  height={40}
                  className="h-5 w-5 object-cover"
                />
              </button>
              <span>{currentPost?.like.length || 0}</span>
            </div>
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
            {/* 사용자의 댓글 */}
            <div className="flex items-start">
              <Image
                src={"/images/smile.png"}
                alt={"profile"}
                width={100}
                height={100}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <div className="relative bg-gray-200 dark:bg-neutral-700 rounded-lg p-3 mx-3">
                  <div className="absolute bg-gray-200 dark:bg-neutral-700 h-4 w-4 transform rotate-45 top-2 -left-1"></div>
                  {/* 댓글 내용 */}
                  <div className="text-lg dark:text-white leading-relaxed my-1">
                    회원의 댓글이 여기에 들어갑니다.
                  </div>
                </div>
                <div className="flex justify-between items-center px-4 py-2">
                  {/* 메타 정보 */}
                  <div className="text-xs dark:text-white space-x-2">
                    <span>닉네임</span>
                    <span>|</span>
                    <span>2023.01.01 15:13</span>
                  </div>

                  {/* 버튼 */}
                  <div className="flex items-center space-x-2">
                    <button>
                      <svg
                        className="w-4 h-4 text-gray-800 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m4.988 19.012 5.41-5.41m2.366-6.424 4.058 4.058-2.03 5.41L5.3 20 4 18.701l3.355-9.494 5.41-2.029Zm4.626 4.625L12.197 6.61 14.807 4 20 9.194l-2.61 2.61Z"
                        />
                      </svg>
                    </button>
                    <button>
                      <svg
                        className="w-4 h-4 text-red-400 dark:text-red-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18 17.94 6M18 18 6.06 6"
                        />
                      </svg>
                    </button>
                    <button>
                      <svg
                        className="w-4 h-4 text-gray-800 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M5.027 10.9a8.729 8.729 0 0 1 6.422-3.62v-1.2A2.061 2.061 0 0 1 12.61 4.2a1.986 1.986 0 0 1 2.104.23l5.491 4.308a2.11 2.11 0 0 1 .588 2.566 2.109 2.109 0 0 1-.588.734l-5.489 4.308a1.983 1.983 0 0 1-2.104.228 2.065 2.065 0 0 1-1.16-1.876v-.942c-5.33 1.284-6.212 5.251-6.25 5.441a1 1 0 0 1-.923.806h-.06a1.003 1.003 0 0 1-.955-.7A10.221 10.221 0 0 1 5.027 10.9Z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="text-xs dark:text-white px-4 space-x-2"></div>
              </div>
            </div>

            {/* 관리자의 댓글 */}
            <div className="flex items-start flex-row-reverse">
              <Image
                src={"/images/smile.png"}
                alt={"profile"}
                width={100}
                height={100}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <div className="relative bg-blue-500 rounded-lg p-3 mx-3">
                  <div className="absolute bg-blue-500 h-4 w-4 transform rotate-45 top-2 -right-1"></div>
                  <div className="text-lg text-white leading-relaxed my-1">
                    관리자의 댓글이 여기에 들어갑니다.
                  </div>
                </div>
                <div className="text-xs dark:text-white px-4 py-2 space-x-2 self-end">
                  <span>관리자</span>
                  <span>|</span>
                  <span>2023.01.01 15:13</span>
                </div>
              </div>
            </div>
          </div>

          {/* 댓글 달기 */}
          <div className="flex items-start mt-4">
            <Image
              src={"/images/smile.png"}
              alt={"profile"}
              width={100}
              height={100}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex flex-col w-full">
              <div className="relative bg-gray-200 dark:bg-neutral-700 rounded-lg p-3 mx-3 flex-grow">
                <textarea
                  className="w-full h-full bg-gray-200 dark:bg-neutral-700 rounded-md text-lg dark:text-white leading-relaxed mb-14 p-2 resize-none"
                  rows={4}
                  placeholder="회원님의 댓글을 여기에 작성해 주세요..."
                ></textarea>
                <div className="absolute right-3 bottom-5">
                  <button className="bg-transparent hover:bg-transparent py-2 px-4 rounded transition duration-300 ease-in-out">
                    <svg
                      className="w-6 h-6 text-gray-800 dark:text-white"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M12 2a1 1 0 0 1 .932.638l7 18a1 1 0 0 1-1.326 1.281L13 19.517V13a1 1 0 1 0-2 0v6.517l-5.606 2.402a1 1 0 0 1-1.326-1.281l7-18A1 1 0 0 1 12 2Z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="my-56"></div>
        </div>
      </div>
    </>
  );
};

export default Post;
