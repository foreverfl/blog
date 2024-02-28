"use client";

import React from "react";
import Image from "next/image";

const Login: React.FC = () => {
  const handleGithubLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const redirectUri = encodeURIComponent(
      "http://localhost:3000/api/auth/github"
    );
    const loginUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}`;
    window.location.href = loginUrl;
  };

  return (
    <div className="flex justify-center items-center h-screen bg-slate-50">
      <div className="text-center bg-white p-10 rounded-lg shadow-lg">
        <h2 className="text-2xl mb-4">Sign In</h2>
        <div className="flex flex-col space-y-4">
          {/* Github */}
          <button
            className="flex items-center justify-start p-2 border rounded-lg bg-gray-800 text-white w-full min-w-[200px]"
            onClick={handleGithubLogin}
          >
            <div className="flex-grow-0">
              <Image
                src="/logo/github_black.png"
                width={24}
                height={24}
                alt="Github"
              />
            </div>
            <span className="flex-grow text-center">Github</span>
          </button>

          {/* Google */}
          <button className="flex items-center justify-start p-2 border rounded-lg bg-red-500 text-white w-full min-w-[200px]">
            <div className="flex-grow-0">
              <Image
                src="/logo/google.png"
                width={24}
                height={24}
                alt="Github"
              />
            </div>
            <span className="flex-grow text-center">Google</span>
          </button>

          {/* Facebook */}
          <button className="flex items-center justify-start p-2 border rounded-lg bg-blue-600 text-white w-full min-w-[200px]">
            <div className="flex-grow-0">
              <Image
                src="/logo/facebook.png"
                width={24}
                height={24}
                alt="Github"
              />
            </div>
            <span className="flex-grow text-center">Facebook</span>
          </button>

          {/* X */}
          <button className="flex items-center justify-start p-2 border rounded-lg bg-gray-800 text-white w-full min-w-[200px]">
            <div className="flex-grow-0">
              <Image src="/logo/x.svg" width={24} height={24} alt="Github" />
            </div>
            <span className="flex-grow text-center">X</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
