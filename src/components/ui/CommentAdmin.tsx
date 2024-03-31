import React from "react";
import Image from "next/image";

interface AdminCommentProps {
  imagePath: string;
  comment: string;
  adminName: string;
  dateTime: string;
}

const CommentAdmin: React.FC<AdminCommentProps> = ({
  imagePath,
  comment,
  adminName,
  dateTime,
}) => {
  return (
    <div className="flex items-start flex-row-reverse">
      <Image
        src={imagePath}
        alt="profile"
        width={100}
        height={100}
        className="w-10 h-10 rounded-full object-cover"
      />
      <div className="flex flex-col">
        <div className="relative bg-blue-500 rounded-lg p-3 mx-3">
          <div className="absolute bg-blue-500 h-4 w-4 transform rotate-45 top-2 -right-1"></div>
          <div className="text-lg text-white leading-relaxed my-1">
            {comment}
          </div>
        </div>
        <div className="text-xs dark:text-white px-4 py-2 space-x-2 self-end">
          <span>{adminName}</span>
          <span>|</span>
          <span>{dateTime}</span>
        </div>
      </div>
    </div>
  );
};

export default CommentAdmin;
