import React, { useEffect, useState } from "react";
import Image from "next/image";
import { setReplyingCommentId } from "@/features/comment/commentsUISlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

interface AdminCommentProps {
  commentId: string;
  adminName: string;
  AdminPhoto: string;
  answer?: string;
  answeredAt?: string;
}

const CommentAdmin: React.FC<AdminCommentProps> = ({
  commentId,
  adminName,
  AdminPhoto,
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

  const { userName, userId, email, photo, isLoggedOut } = useAppSelector(
    (state) => state.user
  ); // User

  // State
  const [isAdmin, setIsAdmin] = useState(false);

  // Other Hooks
  useEffect(() => {
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") || [];

    if (email) {
      setIsAdmin(adminEmails.includes(email));
    }
  }, [email, isAdmin]); // Admin 여부 확인

  // Handler
  const handleUpdateCommentWithAnswer = () => {
    dispatch(setReplyingCommentId(commentId));
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
      <div className="flex flex-col">
        <div className="relative bg-blue-500 rounded-lg p-3 mx-3">
          <div className="absolute bg-blue-500 h-4 w-4 transform rotate-45 top-2 -right-1"></div>
          {/* 답변 */}
          <div className="text-lg text-white leading-relaxed my-1">
            {answer}
          </div>
        </div>
        {/* 메타정보 */}
        <div className="flex text-xs dark:text-white px-4 py-2 space-x-2 self-end">
          <span>{adminName}</span>
          <span className="hidden md:block">|</span>
          <span className="hidden md:block">{formatDate(answeredAt!)}</span>
        </div>

        {/* 수정 버튼 */}
        <div className="flex justify-end space-x-2 pe-3">
          {isAdmin && (
            <button onClick={handleUpdateCommentWithAnswer}>
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
        </div>
      </div>
    </div>
  );
};

export default CommentAdmin;
