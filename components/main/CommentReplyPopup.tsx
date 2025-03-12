import React, { useState, useRef, useEffect } from "react";

const CommentReplyPopup = ({
  commentId,
  initialValue = "",
  onReplySubmit,
  onClose,
}: {
  commentId: string;
  initialValue?: string;
  onReplySubmit: (commentId: string, reply: string) => void;
  onClose: () => void;
}) => {
  const [reply, setReply] = useState(initialValue);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleSubmit = () => {
    if (reply.trim()) {
      onReplySubmit(commentId, reply);
      onClose();
    }
  };

  useEffect(() => {
    if (dialogRef.current) {
      if (dialogRef.current.open) {
        dialogRef.current.close();
      }
      dialogRef.current.showModal();
    }
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="rounded-lg bg-white dark:bg-neutral-800 p-6 shadow-xl max-w-md w-full fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
    >
      <h2 className="text-lg font-semibold mb-4 text-black dark:text-white">
        Reply to Comment
      </h2>
      <textarea
        className="w-full p-2 rounded border border-gray-300 dark:border-neutral-700 dark:bg-neutral-700 dark:text-white"
        rows={4}
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="대댓글 내용을 입력하세요."
      />
      <div className="flex justify-end space-x-2 mt-4">
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={onClose}
        >
          취소
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleSubmit}
        >
          저장
        </button>
      </div>
    </dialog>
  );
};

export default CommentReplyPopup;
