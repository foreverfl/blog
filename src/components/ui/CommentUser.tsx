import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { removeComment } from "@/features/comment/commentsSlice";
import {
  setEditingCommentId,
  setReplyingCommentId,
} from "@/features/comment/commentsUISlice";
import CommentAdminUpdate from "./CommentAdminUpdate";
import CommentAdmin from "./CommentAdmin";

interface CommentUserProps {
  userIdInComment: string;
  username: string;
  userPhoto: string;
  commentId: string;
  content: string;
  updatedAt: string;
  answer?: string;
  answeredAt?: string;
}

const CommentUser: React.FC<CommentUserProps> = ({
  userIdInComment,
  username,
  userPhoto,
  commentId,
  content,
  updatedAt,
  answer,
  answeredAt,
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

  // State
  const [isAdmin, setIsAdmin] = useState(false);
  const { editingCommentId, replyingCommentId } = useAppSelector(
    (state) => state.commentsUI
  ); // CommentUI

  // Other Hooks
  useEffect(() => {
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") || []; // 현재 로그인한 유저의 이메일이 관리자 목록에 포함되어 있는지 확인

    if (email) {
      setIsAdmin(adminEmails.includes(email));
    }
  }, [email, isAdmin]); // Admin 여부 확인

  // Handler
  const handleUpdateComment = () => {
    dispatch(setEditingCommentId(commentId));
  };

  const handleDeleteComment = () => {
    // lan.value에 따라 메시지를 설정
    const message =
      lan.value === "ja"
        ? "本当にコメントを削除しますか？"
        : "정말로 댓글을 삭제하시겠습니까?";

    const isConfirmed = window.confirm(message);

    if (isConfirmed) {
      dispatch(removeComment(commentId));
    }
  };

  const handleAnswerComment = () => {
    dispatch(setReplyingCommentId(commentId));
  };

  return (
    <>
      <div className="flex items-start">
        <Image
          src={userPhoto || "/images/smile.png"}
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
              {content}
            </div>
          </div>
          <div className="flex flex-col space-y-1 px-4 py-2">
            {/* 메타 정보 */}
            <div className="flex justify-start text-xs dark:text-white space-x-2">
              <span>{username}</span>
              <span className="hidden md:block">|</span>
              <span className="hidden md:block">{formatDate(updatedAt)}</span>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end space-x-2">
              {/* 수정 버튼 */}
              {userIdInComment === userId && (
                <button onClick={handleUpdateComment}>
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
              {(userIdInComment === userId || isAdmin) && (
                <button onClick={handleDeleteComment}>
                  <svg
                    className="w-4 h-4 text-red-400 dark:text-red-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24" // 스크롤 최상단으로 이동
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
              {isAdmin && (
                <button onClick={handleAnswerComment}>
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
              )}
            </div>
          </div>
        </div>
      </div>
      {/* answer가 빈 문자열이면 falsy로 판단되서 렌더링되지 않음 */}
      {answer && commentId !== replyingCommentId && (
        <CommentAdmin
          commentId={commentId}
          adminName="mogumogu"
          AdminPhoto={process.env.NEXT_PUBLIC_ADMIN_IMAGE_PATH!}
          answer={answer}
          answeredAt={answeredAt}
        />
      )}

      {commentId === replyingCommentId && (
        <CommentAdminUpdate
          commentId={commentId}
          adminName="mogumogu"
          AdminPhoto={process.env.NEXT_PUBLIC_ADMIN_IMAGE_PATH!}
          answer={answer}
          answeredAt={answeredAt}
        />
      )}
    </>
  );
};

export default CommentUser;
