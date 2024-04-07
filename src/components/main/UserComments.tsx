import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { getCommentsByUser, markCommentAsReadByUser } from "@/lib/mongodb";

interface Comment {
  _id: string;
  index: number;
  user: string;
  post: string;
  postIndex: number; // 포스트 인덱스
  lan: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  adminNotified: boolean;
  answer?: string;
  answeredAt?: Date;
  userNotified?: boolean;
}

const UserComments: React.FC = () => {
  // Redux
  const { userName, userId, email, photo, isLoggedOut } = useAppSelector(
    (state) => state.user
  );
  const lan = useAppSelector((state) => state.language); // Language

  // State
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // Other Hook
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        if (userId) {
          const fetchedComments = await getCommentsByUser(userId);
          setComments(fetchedComments);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-transparent">
          <Image
            src="/images/gear.gif"
            width={250}
            height={250}
            alt="loading"
            priority={true}
            className="w-8 w-8 object-fit"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="my-56"></div>

      <div className="mt-10">
        <h1 className="text-5xl font-semibold my-10 text-neutral-800 dark:text-neutral-200 text-center">
          {lan.value === "ja" ? "私のコメント" : "내 댓글"}
        </h1>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 w-1/12 border">
                  {lan.value === "ja" ? "言語" : "언어"}
                </th>
                <th className="p-2 w-9/12 border">
                  {lan.value === "ja" ? "コメント内容" : "댓글 내용"}
                </th>
                <th className="p-2 w-2/12 border">
                  {lan.value === "ja" ? "日付" : "날짜"}
                </th>
              </tr>
            </thead>
            <tbody>
              {comments.map((comment) => [
                <tr key={`comment-${comment._id}`} className="bg-white">
                  <td className="p-2 border text-center">{comment.lan}</td>
                  <td className="relative p-2 border">
                    <Link
                      href={`/post/${comment.lan}/${comment.postIndex}`}
                      target="_blank"
                    >
                      <span className="text-blue-500 hover:text-blue-800">
                        {comment.content}
                      </span>
                    </Link>
                    {!comment.userNotified && comment.answer && (
                      <span className="absolute top-2 right-2 inline-block px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                        New
                      </span>
                    )}
                  </td>
                  <td className="p-2 border text-center">
                    {comment.updatedAt
                      ? `${new Date(
                          comment.updatedAt
                        ).toLocaleDateString()} ${new Date(
                          comment.updatedAt
                        ).toLocaleTimeString()}`
                      : "N/A"}
                  </td>
                </tr>,
                comment.answer && (
                  <tr key={`answer-${comment._id}`} className="bg-sky-100">
                    <td className="p-2 text-center" colSpan={2}>
                      {comment.answer}
                    </td>
                    <td className="flex justify-center p-2">
                      <svg
                        className="w-6 h-6 text-gray-800 dark:text-white"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M14.502 7.046h-2.5v-.928a2.122 2.122 0 0 0-1.199-1.954 1.827 1.827 0 0 0-1.984.311L3.71 8.965a2.2 2.2 0 0 0 0 3.24L8.82 16.7a1.829 1.829 0 0 0 1.985.31 2.121 2.121 0 0 0 1.199-1.959v-.928h1a2.025 2.025 0 0 1 1.999 2.047V19a1 1 0 0 0 1.275.961 6.59 6.59 0 0 0 4.662-7.22 6.593 6.593 0 0 0-6.437-5.695Z" />
                      </svg>
                    </td>
                  </tr>
                ),
              ])}
            </tbody>
          </table>
        </div>
      </div>

      <div className="my-56"></div>
    </>
  );
};

export default UserComments;
