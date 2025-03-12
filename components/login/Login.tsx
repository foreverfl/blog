"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface SocialLoginConfig {
  clientId: string | undefined;
  redirectUri: string;
  imageUrl: string;
  imageAlt: string;
  providerUrl: string;
}

interface SocialLogins {
  [key: string]: SocialLoginConfig;
}

interface LoginButtonProps {
  provider: keyof SocialLogins;
  socialLogins: SocialLogins;
  children: React.ReactNode;
}

const LoginButton: React.FC<LoginButtonProps> = ({
  provider,
  socialLogins,
  children,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { clientId, redirectUri, providerUrl } = socialLogins[provider];

  const loginUrl =
    provider === "github"
      ? `${providerUrl}?client_id=${clientId}&redirect_uri=${redirectUri}`
      : `${providerUrl}&client_id=${clientId}&redirect_uri=${redirectUri}`;

  const handleLogin = () => {
    window.location.href = loginUrl;
  };

  const getImageSrc = () => {
    if (provider === "github") {
      return isHovered ? "/logo/github_black.png" : "/logo/github.png";
    } else {
      return socialLogins[provider].imageUrl;
    }
  };

  return (
    <button
      onClick={handleLogin}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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

export default LoginButton;
