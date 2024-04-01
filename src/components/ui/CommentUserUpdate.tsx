import React, { useEffect, useState } from "react";
import Image from "next/image";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";

import { resetCommentUI } from "@/features/comment/commentsUISlice";
import {
  editComment,
  fetchCommentsByPost,
} from "@/features/comment/commentsSlice";

interface CommentUserUpdateProps {
  userIdInComment: string;
  username: string;
  userPhoto: string;
  commentId: string;
  content: string;
  updatedAt: string;
}

const CommentUser: React.FC<CommentUserUpdateProps> = ({
  userIdInComment,
  username,
  userPhoto,
  commentId,
  content,
  updatedAt,
}) => {
  // Utilities
  function formatDate(date: string) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  }

  // Redux
  const dispatch = useAppDispatch();

  const lan = useAppSelector((state) => state.language); // Language
  const { userName, userId, email, photo, isLoggedOut } = useAppSelector(
    (state) => state.user
  ); // User
  const { currentPost, status } = useAppSelector((state) => state.postSelected); // Post
  const { editingCommentId, replyingCommentId } = useAppSelector(
    (state) => state.commentsUI
  ); // CommentUI

  // State
  const [commentContent, setCommentContent] = useState(content);

  // Handler
  const handleUpdateCompletedComment = () => {
    dispatch(editComment({ commentId: commentId, content: commentContent }));
    dispatch(fetchCommentsByPost(currentPost!._id));
    dispatch(resetCommentUI());
  };

  return (
    <div className="flex items-start w-full">
      <Image
        src={userPhoto || "/images/smile.png"}
        alt={"profile"}
        width={100}
        height={100}
        className="w-8 h-8 rounded-full object-cover"
      />
      <div className="flex flex-col w-full">
        <div className="relative bg-gray-200 dark:bg-neutral-700 rounded-lg p-3 mx-3">
          <div className="absolute bg-gray-200 dark:bg-neutral-700 h-4 w-4 transform rotate-45 top-2 -left-1"></div>
          {/* 댓글 수정 창 */}
          <textarea
            className="w-full h-full bg-gray-200 dark:bg-neutral-700 rounded-md text-lg dark:text-white leading-relaxed p-2 resize-none"
            rows={4}
            placeholder={
              lan.value === "ja"
                ? "ここにコメントを書いてください。"
                : "회원님의 댓글을 여기에 작성해 주세요."
            }
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
          ></textarea>
        </div>
        <div className="flex flex-col space-y-1 px-4 py-2">
          {/* 메타 정보 */}
          <div className="flex justify-start text-xs dark:text-white space-x-2">
            <span>{username}</span>
            <span>|</span>
            <span>{formatDate(updatedAt)}</span>
          </div>

          {/* 수정 완료 버튼 */}
          <div className="flex justify-end space-x-2">
            {userIdInComment === userId && (
              <button onClick={handleUpdateCompletedComment}>
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
                    d="M5 11.917 9.724 16.5 19 7.5"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className="text-xs dark:text-white px-4 space-x-2"></div>
      </div>
    </div>
  );
};

export default CommentUser;
