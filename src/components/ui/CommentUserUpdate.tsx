import React from "react";
import Image from "next/image";

interface CommentItemProps {
  username: string;
  userPhoto: string;
  content: string;
  createdAt: Date | string;
}

const CommentUserUpdate: React.FC<CommentItemProps> = ({
  username,
  userPhoto,
  content,
  createdAt,
}) => {
  function formatDate(date: Date | string) {
    const d = typeof date === "string" ? new Date(date) : date; // 문자열이면 Date 객체로 변환
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  }

  return (
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
            <span>|</span>
            <span>{formatDate(createdAt)}</span>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-2">
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
  );
};

export default CommentUserUpdate;
