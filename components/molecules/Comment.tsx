"use client";

import { redirectToLoginWithReturnUrl } from "@/lib/auth";
import { sendDiscord } from "@/lib/discord";
import "@/lib/i18n";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface Comment {
  id: string;
  email: string;
  username: string;
  photo: string;
  content: string;
  createdAt: string;
  reply: string;
  repliedAt: string | null;
}

const Comment = ({}) => {
  // i18n
  const { t, i18n } = useTranslation();

  // path
  const pathname = usePathname();
  const parts = pathname.split("/");
  const lan = pathname.split("/")[1];
  const classification = parts[2] || "";
  const category = parts[3] || "";
  const slug = parts[4].replace(/-(ko|ja|en)$/, "") || "";

  // admin email
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") || [];

  // state
  const [user, setUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  const fetchUserData = useCallback(async () => {
    setUserLoading(true);
    try {
      const res = await fetch("/api/auth/status");
      const data = await res.json();
      if (data.isAuthenticated) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setUserLoading(false);
    }
  }, []);

  const fetchComments = useCallback(async () => {
    const res = await fetch(
      `/api/comment/${classification}/${category}/${slug}`,
    );
    const data = await res.json();
    setComments(data);
  }, [category, classification, slug]);

  const createComment = useCallback(
    async (commentText: string) => {
      const res = await fetch(
        `/api/comment/${classification}/${category}/${slug}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.userId,
            user_photo: user.photo,
            content: commentText,
          }),
        },
      );
      if (!res.ok) throw new Error("failed to post comment");

      await sendDiscord({
        type: "comment_create",
        payload: {
          post_url: window.location.href,
          username: user.username,
          content: commentText,
        },
      });

      return res.json();
    },
    [category, classification, slug, user],
  );

  const updateComment = useCallback(
    async (commentId: string, updatedComment: string) => {
      const res = await fetch(
        `/api/comment/${classification}/${category}/${slug}/${commentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: updatedComment,
          }),
        },
      );
      if (!res.ok) throw new Error("failed to update comment");

      await sendDiscord({
        type: "comment_update",
        payload: {
          post_url: window.location.href,
          username: user.username,
          updatedContent: updatedComment,
        },
      });

      return res.json();
    },
    [category, classification, slug, user],
  );

  const deleteComment = useCallback(
    async (commentId: string, userId: string) => {
      const res = await fetch(
        `/api/comment/${classification}/${category}/${slug}/${commentId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            commentId,
            user_id: userId,
          }),
        },
      );
      if (!res.ok) throw new Error("failed to delete comment");

      await sendDiscord({
        type: "comment_delete",
        payload: {
          post_url: window.location.href,
          username: user.username,
        },
      });
      return res.json();
    },
    [category, classification, slug, user],
  );

  const upsertAdminReply = useCallback(
    async (commentId: string, reply: string) => {
      const res = await fetch(
        `/api/comment/${classification}/${category}/${slug}/${commentId}/admin`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            commentId,
            reply,
          }),
        },
      );
      if (!res.ok) throw new Error("Admin comment submission failed");
      return res.json();
    },
    [category, classification, slug],
  );

  const deleteAdminReply = useCallback(
    async (commentId: string) => {
      const res = await fetch(
        `/api/comment/${classification}/${category}/${slug}/${commentId}/admin`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ commentId }),
        },
      );
      if (!res.ok) throw new Error("Admin comment deletion failed");
      return res.json();
    },
    [category, classification, slug],
  );

  const handleAddComment = async () => {
    if (!user) {
      redirectToLoginWithReturnUrl();
      return;
    }

    const trimmed = newComment.trim();
    if (!trimmed) return;

    if (trimmed.length < 10) {
      alert(t("comment_min_length"));
      return;
    }

    try {
      const newCommentObj = await createComment(newComment.trim());
      setComments((prev) => [...prev, newCommentObj]);
      setNewComment("");
    } catch (e) {
      alert(t("comment_add_fail"));
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    const currentComment =
      comments.find((c) => c.id === commentId)?.content || "";
    const updatedComment = window.prompt(
      t("comment_update_prompt"),
      currentComment,
    );

    if (!updatedComment || !updatedComment.trim()) return;
    if (updatedComment.trim().length < 10) {
      alert(t("comment_min_length"));
      return;
    }

    const isConfirmed = window.confirm(t("comment_update_confirm"));
    if (!isConfirmed) return;

    try {
      await updateComment(commentId, updatedComment);
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? { ...comment, content: updatedComment }
            : comment,
        ),
      );
    } catch (e) {
      alert(t("comment_update_fail"));
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const isConfirmed = confirm(t("comment_delete_confirm"));
      if (!isConfirmed) return;

      const { deletedCommentId } = await deleteComment(commentId, user.userId);
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== deletedCommentId),
      );
    } catch (e) {
      alert(t("comment_delete_fail"));
    }
  };

  const handleAddReplyComment = async (commentId: string) => {
    const currentReply = comments.find((c) => c.id === commentId)?.reply || "";
    const reply = window.prompt(t("comment_admin_reply_prompt"), currentReply);

    if (!reply || !reply.trim()) return;

    try {
      await upsertAdminReply(commentId, reply.trim());
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                reply: reply.trim(),
                repliedAt: new Date().toISOString(),
              }
            : comment,
        ),
      );
      alert(t("comment_admin_reply_success"));
    } catch (e) {
      alert(t("comment_admin_reply_fail"));
    }
  };

  const handleDeleteAdminComment = async (commentId: string) => {
    try {
      await deleteAdminReply(commentId);
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                reply: "",
                repliedAt: null,
              }
            : comment,
        ),
      );
    } catch (error) {
      alert(t("comment_admin_reply_delete_fail"));
    }
  };

  const handleFocus = () => {
    if (!user) {
      redirectToLoginWithReturnUrl();
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchComments();
  }, [fetchUserData, fetchComments]);

  useEffect(() => {
    if (["ko", "ja", "en"].includes(lan)) {
      i18n.changeLanguage(lan);
    }
  }, [lan, i18n]);

  return (
    <div className="flex items-center justify-center mb-8">
      <div className="w-full md:w-3/5">
        <div className="my-24"></div>
        {/* comment list */}
        {Array.isArray(comments) && comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id}>
              {/* user comment */}
              <div
                className={`items-start flex ${comment.reply ? "mb-2" : "mb-5"}`}
              >
                <Image
                  src={comment.photo || "/images/smile.png"}
                  alt={"profile"}
                  width={40}
                  height={40}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <>
                    <div className="relative bg-gray-200 dark:bg-neutral-700 rounded-lg p-3 mx-3">
                      <div className="absolute bg-gray-200 dark:bg-neutral-700 h-4 w-4 transform rotate-45 top-2 -left-1"></div>
                      <div className="text-lg text-black dark:text-white leading-relaxed my-1">
                        {comment.content}
                      </div>
                    </div>
                    <div className="flex flex-col px-4 py-2">
                      <div className="flex justify-end text-xs dark:text-white space-x-2">
                        <span>{comment.username}</span>
                        <span className="hidden md:block">|</span>
                        <span className="hidden md:block">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </>

                  {/* user comment button */}
                  <div className="flex justify-end mt-2 px-4 space-x-2">
                    {/* update button */}
                    {user?.email === comment.email && (
                      <button onClick={() => handleUpdateComment(comment.id)}>
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

                    {/* delete button */}
                    {user?.email === comment.email && (
                      <button onClick={() => handleDeleteComment(comment.id)}>
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

                    {/* reply button */}
                    {adminEmails.includes(user?.email) && (
                      <>
                        <button
                          onClick={() => handleAddReplyComment(comment.id)}
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
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* reply */}
              {comment.reply && (
                <div className="ml-12 flex justify-end items-start">
                  <div className="flex flex-col">
                    <div className="relative text-white bg-blue-500 rounded-lg p-3 mx-3">
                      <div className="absolute bg-blue-500 h-4 w-4 transform rotate-45 top-2 -right-1"></div>
                      <div className="text-lg text-white leading-relaxed my-1">
                        {comment.reply}
                      </div>
                    </div>
                    <div className="flex justify-start text-xs dark:text-white space-x-2 px-4 py-2 self-end">
                      <span>mogumogu</span>
                      <span className="hidden md:block">|</span>
                      <span className="hidden md:block">
                        {new Date(comment.repliedAt!).toLocaleDateString()}
                      </span>
                    </div>

                    {/* 관리자 버튼 */}
                    <div className="flex justify-end mt-2 px-4 space-x-2">
                      {/* 삭제 버튼 */}
                      {adminEmails.includes(user?.email) && (
                        <button
                          onClick={() => handleDeleteAdminComment(comment.id)}
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
                  <Image
                    src="https://lh3.googleusercontent.com/a/ACg8ocI8X2Jbh-TFKKw6ofceWDFRfJaa2p9toHBlA617QBuFY_cSFs1wWg=s96-c"
                    alt="profile"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
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
                placeholder={t("comment_placeholder")}
                disabled={userLoading}
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
    </div>
  );
};

export default Comment;
