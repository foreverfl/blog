import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  addAnswerToComment,
  fetchCommentsByPost,
} from "@/features/comment/commentsSlice";
import { resetCommentUI } from "@/features/comment/commentsUISlice";

interface AdminCommentUpdateProps {
  commentId: string;
  adminName: string;
  AdminPhoto: string;
  answer?: string;
  answeredAt?: string;
}

const CommentAdminUpdate: React.FC<AdminCommentUpdateProps> = ({
  commentId,
  adminName,
  AdminPhoto,
  answer,
  answeredAt,
}) => {
  // Redux
  const dispatch = useAppDispatch();
  const { currentPost, status } = useAppSelector((state) => state.postSelected); // Post
  const { editingCommentId, replyingCommentId } = useAppSelector(
    (state) => state.commentsUI
  ); // CommentUI

  // State
  const [answerContent, setAnswerContent] = useState(answer);

  // Handler
  const handleAnswerCompletedComment = () => {
    dispatch(
      addAnswerToComment({ commentId: commentId, answer: answerContent! })
    );
    dispatch(fetchCommentsByPost(currentPost!._id));
    dispatch(resetCommentUI());
  };

  return (
    <div className="flex items-start flex-row-reverse">
      <Image
        src={AdminPhoto}
        alt="profile"
        width={100}
        height={100}
        className="w-10 h-10 rounded-full object-cover"
      />
      <div className="flex flex-col w-full">
        <div className="relative bg-blue-500 rounded-lg p-3 mx-3">
          <div className="absolute bg-blue-500 h-4 w-4 transform rotate-45 top-2 -right-1"></div>
          {/* 댓글 수정 창 */}
          <textarea
            className="w-full h-full bg-blue-500 rounded-md text-lg text-white dark:text-white leading-relaxed p-2 resize-none placeholder-white focus:ring-0"
            rows={4}
            placeholder="관리자의 댓글을 여기에 작성해 주세요..."
            value={answerContent}
            onChange={(e) => setAnswerContent(e.target.value)}
          ></textarea>
        </div>

        {/* 수정 완료 버튼 */}
        <div className="flex justify-end space-x-2 pt-2 pe-3">
          <button onClick={handleAnswerCompletedComment}>
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
        </div>
      </div>
    </div>
  );
};

export default CommentAdminUpdate;
