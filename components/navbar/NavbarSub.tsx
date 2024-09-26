import React, { forwardRef } from "react";

interface NavbarSubProps {
  isPost: boolean;
  textColor: string;
  title: string;
}

const NavbarSub = forwardRef<HTMLDivElement, NavbarSubProps>(
  ({ isPost, textColor, title }, ref) => {
    return (
      <div
        ref={ref}
        className={`w-full h-screen flex flex-col items-center justify-center space-y-3 select-none bg-neutral-200 dark:bg-neutral-950 ${textColor} `}
        style={{
          backgroundImage: isPost
            ? "url('/images/subnav_background1_darker.jpg')"
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* 제목 */}
        {isPost ? (
          title && (
            <h1 className="text-5xl md:text-7xl text-center font-bold dark:text-slate-50 font-navbar">
              {title}
            </h1>
          )
        ) : (
          <h1 className="text-5xl md:text-7xl font-bold dark:text-slate-50 font-navbar">
            mogumogu&#39;s sundries
          </h1>
        )}
      </div>
    );
  }
);

NavbarSub.displayName = "NavbarSub";

export default NavbarSub;
