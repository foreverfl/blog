import React from "react";
import Image from "next/image";
import Link from "next/link";

const Good = ({ heartState, handleClick, currentPost }) => {
  return (
    <div className="flex items-center justify-between my-4">
      {/* 하트 버튼 */}
      <div className="flex items-center space-x-2 py-2 px-4 rounded-full shadow">
        <button
          onClick={handleClick}
          className="flex items-center justify-center p-1 rounded-full transition duration-500 ease-in-out transform hover:scale-110"
        >
          <Image
            src={
              heartState === "before"
                ? "/images/heart_before.png"
                : "/images/heart_after.png"
            }
            alt="Like"
            width={40}
            height={40}
            className="h-5 w-5 object-cover"
          />
        </button>
        <span>{currentPost?.like.length || 0}</span>
      </div>
      {/* Create Commons */}
      <div>
        <Link
          href={"https://creativecommons.org/licenses/by-nc-nd/4.0/"}
          target="_blank"
        >
          <Image
            src={"/images/by-nc-nd.svg"}
            alt={"Creative Commons"}
            width={100}
            height={100}
            priority={true}
            className="w-32 object-cover"
          />
        </Link>
      </div>
    </div>
  );
};

export default Good;
