import React, { useEffect, useState } from "react";
import Image from "next/image";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";

import { getUnnotifiedComments } from "@/lib/mongodb";
import Link from "next/link";

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

const MainContent: React.FC = () => {
  // State
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const fetchedComments = await getUnnotifiedComments();
        setComments(fetchedComments);
      } catch (error) {
        console.error("Error fetching unnotified comments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, []);

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
          Unreplied Comments
        </h1>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 w-1/12 border">Language</th>
                <th className="p-2 w-9/12 border">Content</th>
                <th className="p-2 w-2/12 border">Updated At</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((comment) => (
                <tr key={comment._id} className="bg-white">
                  <td className="p-2 border text-center">{comment.lan}</td>
                  <td className="p-2 border">
                    <Link
                      href={`/post/${comment.lan}/${comment.postIndex}`}
                      target="_blank"
                    >
                      <span className="text-blue-500 hover:text-blue-800">
                        {comment.content}
                      </span>
                    </Link>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="my-56"></div>
    </>
  );
};

export default MainContent;
