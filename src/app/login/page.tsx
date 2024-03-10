"use client";

import React from "react";
import Image from "next/image";

interface SocialLoginConfig {
  clientId: string | undefined;
  redirectUri: string;
  loginUrl: (clientId: string | undefined, redirectUri: string) => string;
  imageUrl: string;
  imageAlt: string;
  bgColor: string;
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
      imageUrl: "/logo/github_black.png",
      imageAlt: "Github",
      bgColor: "bg-gray-800",
    },
    google: {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      redirectUri: encodeURIComponent(
        "http://localhost:3000/api/auth/providers/google"
      ),
      loginUrl: (clientId, redirectUri) =>
        `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile`,
      imageUrl: "/logo/google.png",
      imageAlt: "Google",
      bgColor: "bg-red-500",
    },
    facebook: {
      clientId: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID,
      redirectUri: encodeURIComponent(
        "http://localhost:3000/api/auth/providers/facebook"
      ),
      loginUrl: (clientId, redirectUri) =>
        `https://www.facebook.com/v4.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}`,
      imageUrl: "/logo/facebook.png",
      imageAlt: "Facebook",
      bgColor: "bg-blue-600",
    },
    twitter: {
      clientId: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID,
      redirectUri: encodeURIComponent(
        "http://localhost:3000/api/auth/providers/twitter"
      ),
      loginUrl: (clientId, redirectUri) => `#`, // Twitter OAuth URL
      imageUrl: "/logo/x_white.png",
      imageAlt: "Twitter",
      bgColor: "bg-gray-800",
    },
  };

  const LoginButton: React.FC<LoginButtonProps> = ({ provider, children }) => {
    const { clientId, redirectUri, loginUrl, bgColor } = socialLogins[provider];

    const handleLogin = () => {
      const url = loginUrl(clientId, redirectUri);
      window.location.href = url;
    };

    return (
      <button
        onClick={handleLogin}
        className={`${bgColor} flex items-center justify-center p-3 border rounded-lg text-white w-full min-w-[200px]`}
      >
        <Image
          src={socialLogins[provider].imageUrl}
          alt={socialLogins[provider].imageAlt}
          width={24}
          height={24}
        />
        {children}
      </button>
    );
  };

  return (
    <div className="flex justify-center items-center h-screen bg-slate-50">
      <div className="text-center bg-white p-10 rounded-lg shadow-lg">
        <h2 className="text-2xl mb-4">Sign In</h2>
        <div className="flex flex-col space-y-4">
          <LoginButton provider="github">
            <span className="flex-grow text-center">Github</span>
          </LoginButton>
          <LoginButton provider="google">
            <span className="flex-grow text-center">Google</span>
          </LoginButton>
          <LoginButton provider="facebook">
            <span className="flex-grow text-center">Facebook</span>
          </LoginButton>
          <LoginButton provider="twitter">
            <span className="flex-grow text-center">X</span>
          </LoginButton>
        </div>
      </div>
    </div>
  );
};

export default Login;
