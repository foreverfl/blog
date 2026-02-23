"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import "@/lib/i18n";
import { useTranslation } from "react-i18next";

export type Provider = "github" | "google" | "apple" | "line" | "kakao";

export interface ProviderConfig {
  id: Provider;
  clientId: string | undefined;
  redirectUri: string;
  authUrl: string;
  imageUrl: string;
  imageAlt: string;
  darkImageUrl?: string;
  className: string;
}

export const providers: ProviderConfig[] = [
  {
    id: "github",
    clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
    redirectUri: encodeURIComponent(
      process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI!,
    ),
    authUrl: "https://github.com/login/oauth/authorize?",
    imageUrl: "/logo/GitHub_Invertocat_White.svg",
    imageAlt: "GitHub",
    className:
      "bg-[#24292f] border-[#24292f] text-white hover:bg-[#333] dark:border-[#555] dark:hover:bg-[#444]",
  },
  {
    id: "apple",
    clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID,
    redirectUri: encodeURIComponent(
      process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI!,
    ),
    authUrl:
      "https://appleid.apple.com/auth/authorize?response_type=code&scope=name%20email&",
    imageUrl: "/logo/Apple_logo_white.svg",
    imageAlt: "Apple",
    className:
      "bg-black border-black text-white hover:bg-[#1a1a1a] dark:border-[#555] dark:hover:bg-[#333]",
  },
  {
    id: "google",
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    redirectUri: encodeURIComponent(
      process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!,
    ),
    authUrl:
      "https://accounts.google.com/o/oauth2/v2/auth?response_type=code&scope=openid%20email%20profile&",
    imageUrl: "/logo/Google_logo_white.svg",
    imageAlt: "Google",
    darkImageUrl: "/logo/Google_logo_black.svg",
    className:
      "bg-white border-[#747775] text-[#1F1F1F] hover:bg-[#f5f5f5] dark:bg-[#131314] dark:border-[#8E918F] dark:text-[#E3E3E3] dark:hover:bg-[#1f1f20]",
  },
  {
    id: "line",
    clientId: process.env.NEXT_PUBLIC_LINE_CLIENT_ID,
    redirectUri: encodeURIComponent(process.env.NEXT_PUBLIC_LINE_REDIRECT_URI!),
    authUrl:
      "https://access.line.me/oauth2/v2.1/authorize?response_type=code&scope=profile%20openid%20email&state=login&",
    imageUrl: "/logo/LINE_logo.svg",
    imageAlt: "LINE",
    className:
      "bg-[#06C755] border-[#06C755] text-white hover:bg-[#05b34c] dark:bg-[#06C755] dark:border-[#06C755] dark:hover:bg-[#05b34c]",
  },
  {
    id: "kakao",
    clientId: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID,
    redirectUri: encodeURIComponent(
      process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI!,
    ),
    authUrl: "https://kauth.kakao.com/oauth/authorize?response_type=code&",
    imageUrl: "/logo/KakaoTalk_logo.svg",
    imageAlt: "Kakao",
    className:
      "bg-[#FEE500] border-[#FEE500] text-black/85 hover:bg-[#e6cf00] dark:bg-[#FEE500] dark:border-[#FEE500] dark:hover:bg-[#e6cf00]",
  },
];

interface LoginButtonProps {
  provider: ProviderConfig;
}

const LoginButton: React.FC<LoginButtonProps> = ({ provider }) => {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const lan = pathname.split("/")[1];

  useEffect(() => {
    if (["en", "ja", "ko"].includes(lan)) {
      i18n.changeLanguage(lan);
    }
  }, [lan, i18n]);

  const loginUrl = `${provider.authUrl}client_id=${provider.clientId}&redirect_uri=${provider.redirectUri}`;

  return (
    <button
      onClick={() => (window.location.href = loginUrl)}
      className={`flex items-center justify-center gap-2.5 py-3 px-3 rounded-lg w-full min-w-50 border text-sm font-medium ${provider.className} transition-colors duration-300`}
    >
      <Image
        src={provider.imageUrl}
        alt={provider.imageAlt}
        width={20}
        height={20}
        className={`w-5 h-5 shrink-0 object-contain ${provider.darkImageUrl ? "dark:hidden" : ""}`}
      />
      {provider.darkImageUrl && (
        <Image
          src={provider.darkImageUrl}
          alt={provider.imageAlt}
          width={20}
          height={20}
          className="w-5 h-5 shrink-0 object-contain hidden dark:block"
        />
      )}
      <span>{t("login_continue", { provider: provider.imageAlt })}</span>
    </button>
  );
};

export default LoginButton;
