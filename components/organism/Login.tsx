"use client";

import React, { useState } from "react";
import Image from "next/image";

export type Provider = "github" | "google";

export interface ProviderConfig {
  id: Provider;
  label: string;
  clientId: string | undefined;
  redirectUri: string;
  authUrl: string;
  imageUrl: string;
  imageAlt: string;
  hoverImageUrl?: string;
  className: string;
}

export const providers: ProviderConfig[] = [
  {
    id: "github",
    label: "Github",
    clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
    redirectUri: encodeURIComponent(
      process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI!,
    ),
    authUrl: "https://github.com/login/oauth/authorize?",
    imageUrl: "/logo/github.png",
    imageAlt: "Github",
    hoverImageUrl: "/logo/github_black.png",
    className:
      "border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white dark:border-gray-200 dark:text-gray-200 dark:hover:bg-gray-200 dark:hover:text-black",
  },
  {
    id: "google",
    label: "Google",
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    redirectUri: encodeURIComponent(
      process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!,
    ),
    authUrl:
      "https://accounts.google.com/o/oauth2/v2/auth?response_type=code&scope=openid%20email%20profile&",
    imageUrl: "/logo/google.png",
    imageAlt: "Google",
    className:
      "border-red-500 text-red-500 hover:bg-red-500 hover:text-white dark:border-red-400 dark:text-red-400 dark:hover:bg-red-400 dark:hover:text-white",
  },
];

interface LoginButtonProps {
  provider: ProviderConfig;
}

const LoginButton: React.FC<LoginButtonProps> = ({ provider }) => {
  const [isHovered, setIsHovered] = useState(false);

  const loginUrl = `${provider.authUrl}client_id=${provider.clientId}&redirect_uri=${provider.redirectUri}`;

  const imageSrc =
    isHovered && provider.hoverImageUrl
      ? provider.hoverImageUrl
      : provider.imageUrl;

  return (
    <button
      onClick={() => (window.location.href = loginUrl)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex items-center justify-center p-3 rounded-lg w-full min-w-50 border ${provider.className} transition-colors duration-300`}
    >
      <Image
        src={imageSrc}
        alt={provider.imageAlt}
        width={0}
        height={0}
        className="w-5 h-5 object-cover"
      />
      <span className="grow text-center">{provider.label}</span>
    </button>
  );
};

export default LoginButton;