import React from "react";
import LoginButton from "@/components/login/Login";

const Login: React.FC = () => {
  const socialLogins = {
    github: {
      clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
      redirectUri: encodeURIComponent(
        process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI!,
      ),
      providerUrl: "https://github.com/login/oauth/authorize", // 베이스 URL
      imageUrl: "/logo/github.png",
      imageAlt: "Github",
    },
    google: {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      redirectUri: encodeURIComponent(
        process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!,
      ),
      providerUrl:
        "https://accounts.google.com/o/oauth2/v2/auth?response_type=code&scope=openid%20email%20profile", // 베이스 URL
      imageUrl: "/logo/google.png",
      imageAlt: "Google",
    },
  };

  return (
    <div className="flex justify-center items-center h-screen bg-slate-50">
      <div className="text-center text-black dark:text-black bg-white p-10 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-10 ">Sign In</h2>
        <div className="flex flex-col space-y-4">
          <LoginButton provider="github" socialLogins={socialLogins}>
            <span className="flex-grow text-center">Github</span>
          </LoginButton>
          <LoginButton provider="google" socialLogins={socialLogins}>
            <span className="flex-grow text-center">Google</span>
          </LoginButton>
        </div>
      </div>
    </div>
  );
};

export default Login;
