import React from "react";
import LoginButton, { providers } from "@/components/organism/Login";

const Login: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-slate-50">
      <div className="text-center text-black dark:text-black bg-white p-10 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-10 ">Sign In</h2>
        <div className="flex flex-col space-y-4">
          {providers.map((p) => (
            <LoginButton key={p.id} provider={p} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;