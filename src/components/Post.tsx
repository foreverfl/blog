"use client";

import React, { useEffect, useLayoutEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/esm/styles/prism";
import "github-markdown-css";
import { deletePost, getUsersInfoByIds } from "@/lib/mongodb";
import { setCurrentView } from "@/features/blog/blogSlice";
import {
  fetchPostByIndex,
  likePostByUser,
  unlikePostByUser,
} from "@/features/post/postSelectedSlice";
import {
  createComment,
  fetchCommentsByPost,
} from "@/features/comment/commentsSlice";
import CommentUser from "./ui/CommentUser";
import CommentUserUpdate from "./ui/CommentUserUpdate";
import { setCurrentTitle } from "@/features/blog/blogTitleSlice";

interface PostProps {
  postIdx: string;
  post: Post;
}

interface Post {
  _id: string;
  index: number;
  category: string;
  title_ko: string;
  title_ja: string;
  content_ko: string;
  content_ja: string;
  images: string[];
  image: string;
  like: string[];
  likeCount?: number;
  createdAt: Date;
  updatedAt?: Date;
}

const Post: React.FC<PostProps> = ({ postIdx, post }) => {
  // Utilities
  const router = useRouter();
  const pathname = usePathname();

  // Redux
  const dispatch = useAppDispatch();
  const lan = useAppSelector((state) => state.language); // Language
  const { userName, userId, email, photo, isLoggedOut } = useAppSelector(
    (state) => state.user
  ); // User
  const { currentPost, status } = useAppSelector((state) => state.postSelected); // Post
  const {
    comments,
    status: commentStatus,
    error,
  } = useAppSelector((state) => state.comments); // Comment
  const { editingCommentId, replyingCommentId } = useAppSelector(
    (state) => state.commentsUI
  ); // CommentUI

  // State
  const [isAdmin, setIsAdmin] = useState(false);
  const [content, setContent] = useState("");
  const [heartState, setHeartState] = useState("before");
  const [commentContent, setCommentContent] = useState("");
  interface UserInfo {
    _id: string;
    username: string;
    photo: string;
  }

  interface UsersState {
    [key: string]: UserInfo;
  }
  const [usersInfo, setUsersInfo] = useState<UsersState>({});

  // Other Hooks
  // 포스트 가져오기
  useEffect(() => {
    const index = Number(postIdx);
    if (!isNaN(index)) {
      dispatch(fetchPostByIndex(index));
    }
  }, [dispatch, postIdx]);

  // 포스트 본문 redux에 담기
  useEffect(() => {
    if (lan.value === "ja") {
      if (currentPost) {
        dispatch(setCurrentTitle(currentPost.title_ja));
      }
    } else {
      if (currentPost) {
        dispatch(setCurrentTitle(currentPost.title_ko));
      }
    }
  }, [dispatch, currentPost, lan.value]);

  // 스크롤 최상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Admin 여부 확인
  useEffect(() => {
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

  // 댓글 불러오기
  useEffect(() => {
    if (currentPost?._id) {
      dispatch(fetchCommentsByPost(currentPost._id));
    }
  }, [currentPost?._id, dispatch]);

  // 유저 정보 조회를 위한 Map
  useEffect(() => {
    const userIds = comments
      .map((comment) => comment.user)
      .filter((value, index, self) => self.indexOf(value) === index);

    // 사용자 정보 조회
    getUsersInfoByIds(userIds).then((users) => {
      const usersMap = users.reduce((acc, user) => {
        acc[user._id] = user;
        return acc;
      }, {} as UsersState);

      setUsersInfo(usersMap);
    });
  }, [comments]);

  // Handler
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

  const handleCreateComment = async () => {
    if (!content.trim()) return; // 빈 내용의 댓글은 제출하지 않음

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

    dispatch(
      createComment({
        postId: currentPost!._id,
        userId,
        content: commentContent,
        lan: lan.value,
      })
    );
    setCommentContent("");
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
      <div className="min-h-screen flex justify-center items-center bg-white dark:bg-neutral-900">
        <div className="markdown-body relative w-full md:w-3/5 bg-white dark:bg-transparent">
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
                      customStyle={{ margin: "0" }} // pre 태그에 적용될 스타일
                      showLineNumbers={true}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code {...rest} className={className}>
                      {children}
                    </code>
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
              <Link
                href={"https://creativecommons.org/licenses/by-nc-nd/4.0/"}
                target="_blank"
              >
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
            {comments
              .filter((comment) => comment.lan === lan.value)
              .map((comment) => {
                // 수정 중이거나 답변 중인 댓글에 따라 다른 컴포넌트를 렌더링
                if (comment._id === editingCommentId) {
                  return (
                    <CommentUserUpdate
                      key={comment._id}
                      userIdInComment={usersInfo[comment.user]?._id}
                      username={
                        usersInfo[comment.user]?.username ||
                        (lan.value === "ja"
                          ? "存在しないユーザー"
                          : "알 수 없는 사용자")
                      }
                      userPhoto={
                        usersInfo[comment.user]?.photo || "/images/smile.png"
                      }
                      commentId={comment._id}
                      content={comment.content}
                      updatedAt={comment.updatedAt}
                    />
                  );
                } else {
                  return (
                    <CommentUser
                      key={comment._id}
                      userIdInComment={usersInfo[comment.user]?._id}
                      username={
                        usersInfo[comment.user]?.username ||
                        (lan.value === "ja"
                          ? "存在しないユーザー"
                          : "알 수 없는 사용자")
                      }
                      userPhoto={
                        usersInfo[comment.user]?.photo || "/images/smile.png"
                      }
                      commentId={comment._id}
                      content={comment.content}
                      updatedAt={comment.updatedAt}
                      answer={comment.answer}
                      answeredAt={comment.answeredAt}
                    />
                  );
                }
              })}
          </div>

          {/* 댓글 달기 */}
          <div className="flex items-start mt-4">
            {isLoggedOut ? (
              <button className="border border-gray-300 dark:border-transparent rounded-full bg-white dark:bg-black p-2 overflow-hidden">
                <svg
                  className="h-6 w-6 dark:fill-current dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    d="M7 17v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3Zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              </button>
            ) : (
              <button
                className={`rounded-full overflow-hidden transition-opacity duration-300 `}
              >
                {photo ? (
                  <Image
                    src={photo}
                    alt="Profile Image"
                    width={100}
                    height={100}
                    className="w-10 h-10 object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 flex justify-center items-center"></div>
                )}
              </button>
            )}

            <div className="flex flex-col w-full">
              <div className="relative bg-gray-200 dark:bg-neutral-700 rounded-lg p-3 mx-3 flex-grow">
                <textarea
                  className="w-full h-full bg-gray-200 dark:bg-neutral-700 rounded-md text-lg dark:text-white leading-relaxed mb-14 p-2 resize-none"
                  rows={4}
                  placeholder={
                    lan.value === "ja"
                      ? "ここにコメントを書いてください。"
                      : "회원님의 댓글을 여기에 작성해 주세요."
                  }
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                ></textarea>
                <div className="absolute right-3 bottom-5">
                  <button
                    className="bg-transparent hover:bg-transparent py-2 px-4 rounded transition duration-300 ease-in-out"
                    onClick={handleCreateComment}
                  >
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
                        fillRule="evenodd"
                        d="M12 2a1 1 0 0 1 .932.638l7 18a1 1 0 0 1-1.326 1.281L13 19.517V13a1 1 0 1 0-2 0v6.517l-5.606 2.402a1 1 0 0 1-1.326-1.281l7-18A1 1 0 0 1 12 2Z"
                        clipRule="evenodd"
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
