"use client";

import React, { useState } from "react";
import Image from "next/image";

interface SocialLoginConfig {
  clientId: string | undefined;
  redirectUri: string;
  loginUrl: (clientId: string | undefined, redirectUri: string) => string;
  imageUrl: string;
  imageAlt: string;
}

interface SocialLogins {
  [key: string]: SocialLoginConfig;
}

interface LoginButtonProps {
  provider: keyof SocialLogins;
  children: React.ReactNode;
}

const Login: React.FC = () => {
  const socialLogins: SocialLogins = {
    github: {
      clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
      redirectUri: encodeURIComponent(
        process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI!
      ),
      loginUrl: (clientId, redirectUri) =>
        `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}`,
      imageUrl: "/logo/github.png",
      imageAlt: "Github",
    },
    google: {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      redirectUri: encodeURIComponent(
        process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!
      ),
      loginUrl: (clientId, redirectUri) =>
        `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile`,
      imageUrl: "/logo/google.png",
      imageAlt: "Google",
    },
  };

  const LoginButton: React.FC<LoginButtonProps> = ({ provider, children }) => {
    const [isHovered, setIsHovered] = useState(false); // Hover 상태 추적을 위한 상태 변수
    const { clientId, redirectUri, loginUrl } = socialLogins[provider];

    const handleLogin = () => {
      const url = loginUrl(clientId, redirectUri);
      window.location.href = url;
    };

    const getImageSrc = () => {
      if (provider === "github") {
        return isHovered ? "/logo/github_black.png" : "/logo/github.png";
      } else {
        return socialLogins[provider].imageUrl; // 다른 공급자는 기본 이미지 사용
      }
    };

    return (
      <button
        onClick={handleLogin}
        onMouseEnter={() => setIsHovered(true)} // 마우스가 버튼 위에 있을 때
        onMouseLeave={() => setIsHovered(false)} // 마우스가 버튼을 벗어날 때
        className={`flex items-center justify-center p-3 rounded-lg w-full min-w-[200px] border ${
          provider === "github"
            ? "border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white"
            : "border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
        } transition-colors duration-300`}
      >
        <Image
          src={getImageSrc()}
          alt={socialLogins[provider].imageAlt}
          width={0}
          height={0}
          className="w-5 h-5 object-cover"
        />
        {children}
      </button>
    );
  };

  return (
    <div className="flex justify-center items-center h-screen bg-slate-50">
      <div className="text-center bg-white p-10 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-10">Sign In</h2>
        <div className="flex flex-col space-y-4">
          <LoginButton provider="github">
            <span className="flex-grow text-center">Github</span>
          </LoginButton>
          <LoginButton provider="google">
            <span className="flex-grow text-center">Google</span>
          </LoginButton>
        </div>
      </div>
    </div>
  );
};

export default Login;
