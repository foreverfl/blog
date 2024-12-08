"use client";

import crypto from "crypto";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import CommentReplyPopup from "./CommentReplyPopup";

interface Comment {
  _id: string;
  userEmail: string;
  username: string;
  photo: string;
  comment: string;
  userCreatedAt: string;
  adminComment: string;
  adminCreatedAt: string | null;
}

const Comment = ({}) => {
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") || [];
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isEditing, setIsEditing] = useState<{ [key: string]: boolean }>({});
  const [editComment, setEditComment] = useState<{ [key: string]: string }>({});
  const [newComment, setNewComment] = useState<string>("");
  const [newAdminComments, setNewAdminComments] = useState<{
    [key: string]: string;
  }>({});
  const [isReplying, setIsReplying] = useState<{ [key: string]: boolean }>({});

  const lan = pathname.split("/")[1];
  const cleanPath = pathname.split("/").slice(2).join("/");
  const pathHash = crypto.createHash("sha256").update(cleanPath).digest("hex");

  // 사용자 정보 및 댓글 로드
  useEffect(() => {
    let isMounted = true;

    // 사용자 정보 가져오기
    const fetchUserData = async () => {
      const res = await fetch("/api/auth/status");
      const data = await res.json();
      if (isMounted && data.isAuthenticated) {
        setUser(data.user);
      }
    };

    // 댓글 가져오기
    const fetchComments = async () => {
      const res = await fetch(`/api/comment/user/get?pathHash=${pathHash}`);
      const data = await res.json();
      if (isMounted) {
        setComments(data);
      }
    };

    fetchUserData();
    fetchComments();

    return () => {
      isMounted = false;
    };
  }, [pathHash]);

  // 사용자 댓글 핸들러
  const handleAddComment = async () => {
    if (!user) {
      window.location.href = "/login"; // 로그인되지 않았을 경우 로그인 페이지로 리다이렉트
      return;
    }

    if (!newComment.trim()) return;

    const commentData = {
      userEmail: user.email,
      username: user.username,
      photo: user.photo,
      comment: newComment,
    };

    const res = await fetch("/api/comment/user/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pathHash, commentData }),
    });

    if (res.ok) {
      const newComment = await res.json();
      setComments((prevComments) => [...prevComments, newComment]); // 상태 업데이트 시 기존 comments를 유지한 채로 새로운 댓글을 추가
      setNewComment(""); // 새로운 댓글 입력 필드 초기화
    }
  };

  const handleEditComment = async (commentId: string) => {
    const updatedComment = editComment[commentId]?.trim();
    if (!updatedComment) return;

    const res = await fetch("/api/comment/user/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pathHash,
        commentId,
        newComment: updatedComment,
      }),
    });

    if (res.ok) {
      setIsEditing((prev) => ({ ...prev, [commentId]: false }));
      const updatedComments = await res.json();
      setComments(updatedComments);
    }
  };

  // const toggleEditMode = (commentId: string) => {
  //   setIsEditing((prev) => ({ ...prev, [commentId]: !prev[commentId] }));

  //   if (!isEditing[commentId]) {
  //     setEditComment((prev) => ({
  //       ...prev,
  //       [commentId]: comments.find((c) => c._id === commentId)?.comment || "",
  //     }));
  //   }
  // };

  const handleDeleteComment = async (commentId: string) => {
    const res = await fetch("/api/comment/user/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pathHash,
        commentId,
        userEmail: user.email,
      }),
    });

    if (res.ok) {
      const { deletedCommentId } = await res.json();

      setComments((prevComments) =>
        prevComments.filter((comment) => comment._id !== deletedCommentId)
      );
    }
  };

  const handleReplyComment = async (commentId: string, reply: string) => {
    const adminComment = reply.trim();
    console.log("adminComment: ", adminComment);
    if (!adminComment) return;

    const res = await fetch("/api/comment/admin/upsert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pathHash,
        commentId,
        adminComment,
      }),
    });

    if (res.ok) {
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === commentId
            ? {
                ...comment,
                adminComment: adminComment, // 새 댓글 값
                adminCreatedAt: new Date().toISOString(), // 현재 시간 추가
              }
            : comment
        )
      );
      setIsReplying((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const openReplyPopup = (commentId: string) => {
    setIsReplying((prev) => ({ ...prev, [commentId]: true }));
  };

  const closeReplyPopup = (commentId: string) => {
    setIsReplying((prev) => ({ ...prev, [commentId]: false }));
  };

  // 관리자 댓글 핸들러
  const handleDeleteAdminComment = async (commentId: string) => {
    try {
      const res = await fetch("/api/comment/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pathHash,
          commentId,
        }),
      });

      if (res.ok) {
        // 상태 업데이트
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  adminComment: "",
                  adminCreatedAt: null,
                }
              : comment
          )
        );
        console.log("관리자 댓글 삭제 완료");
      } else {
        console.error("관리자 댓글 삭제 실패");
      }
    } catch (error) {
      console.error("서버 오류: ", error);
    }
  };

  const handleFocus = () => {
    if (!user) {
      window.location.href = "/login";
    }
  };

  return (
    <div>
      <div className="my-24"></div>
      {/* 댓글 목록 */}

      {Array.isArray(comments) && comments.length > 0 ? (
        comments.map((comment) => (
          <div key={comment._id} className="">
            {/* 사용자 댓글 */}
            <div className="flex items-start mb-5">
              <Image
                src={comment.photo || "/images/smile.png"}
                alt={"profile"}
                width={40}
                height={40}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <div className="relative bg-gray-200 dark:bg-neutral-700 rounded-lg p-3 mx-3">
                  <div className="absolute bg-gray-200 dark:bg-neutral-700 h-4 w-4 transform rotate-45 top-2 -left-1"></div>
                  <div className="text-lg text-black dark:text-white leading-relaxed my-1">
                    {comment.comment}
                  </div>
                </div>
                <div className="flex flex-col px-4 py-2">
                  <div className="flex justify-start text-xs dark:text-white space-x-2">
                    <span>{comment.username}</span>
                    <span className="hidden md:block">|</span>
                    <span className="hidden md:block">
                      {new Date(comment.userCreatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {/* 사용자 버튼 */}
                <div className="flex justify-end mt-2 px-4 space-x-2">
                  {/* 수정 버튼 */}
                  {user?.email === comment.userEmail && (
                    <button onClick={() => console.log("사용자 수정버튼 클릭")}>
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
                          d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"
                        />
                      </svg>
                    </button>
                  )}

                  {/* 삭제 버튼 */}
                  {user?.email === comment.userEmail && (
                    <button onClick={() => handleDeleteComment(comment._id)}>
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
                  )}

                  {/* 답장 버튼 */}
                  {adminEmails.includes(user?.email) && (
                    <>
                      <button
                        onClick={() => openReplyPopup(comment._id)}
                        className="flex items-center justify-center text-gray-800 dark:text-white hover:text-blue-500 transition"
                      >
                        <svg
                          className="w-4 h-4"
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

                      {/* 대댓글 작성 팝업 */}
                      {isReplying[comment._id] && (
                        <CommentReplyPopup
                          commentId={comment._id}
                          initialValue={comment.adminComment || ""}
                          onReplySubmit={handleReplyComment}
                          onClose={() => closeReplyPopup(comment._id)}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 관리자 대댓글 */}
            {comment.adminComment && (
              <div className="ml-12 flex justify-end items-start">
                <Image
                  src="https://lh3.googleusercontent.com/a/ACg8ocI8X2Jbh-TFKKw6ofceWDFRfJaa2p9toHBlA617QBuFY_cSFs1wWg=s96-c"
                  alt="profile"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <div className="relative text-white bg-blue-500 rounded-lg p-3 mx-3">
                    <div className="absolute bg-blue-500 h-4 w-4 transform rotate-45 top-2 -right-1"></div>
                    <div className="text-lg text-white leading-relaxed my-1">
                      {comment.adminComment}
                    </div>
                  </div>
                  <div className="flex justify-start text-xs dark:text-white space-x-2 px-4 py-2 self-end">
                    <span>mogumogu</span>
                    <span className="hidden md:block">|</span>
                    <span className="hidden md:block">
                      {new Date(comment.adminCreatedAt!).toLocaleDateString()}
                    </span>
                  </div>

                  {/* 관리자 버튼 */}
                  <div className="flex justify-end mt-2 px-4 space-x-2">
                    {/* 삭제 버튼 */}
                    {adminEmails.includes(user?.email) && (
                      <button
                        onClick={() => handleDeleteAdminComment(comment._id)}
                      >
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
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <div></div>
      )}

      {/* 댓글 달기 */}
      <div className="flex items-start mt-20">
        <button className="rounded-full overflow-hidden transition-opacity duration-300">
          <div className="w-7 h-7 flex justify-center items-center"></div>
        </button>
        <div className="flex flex-col w-full">
          <div className="relative bg-gray-200 dark:bg-neutral-700 rounded-lg p-3 mx-3 flex-grow">
            <textarea
              className="w-full h-full bg-gray-200 dark:bg-neutral-700 rounded-md text-lg dark:text-white leading-relaxed mb-14 p-2 resize-none"
              rows={4}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onFocus={handleFocus}
              placeholder={
                lan === "ja"
                  ? "ここにコメントを書いてください。"
                  : "회원님의 댓글을 여기에 작성해 주세요."
              }
            ></textarea>
            <div className="absolute right-3 bottom-5">
              <button
                onClick={handleAddComment}
                className="bg-transparent hover:bg-transparent py-2 px-4 rounded transition duration-300 ease-in-out"
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
    </div>
  );
};

export default Comment;
