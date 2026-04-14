"use client";

import React from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useLoginModal } from "@/lib/context/login-modal-context";
import { useAuth } from "@/lib/context/auth-context";

interface ProfileProps {
  isProfileOpen: boolean;
  isMenuOpen: boolean;
  toggleProfile: () => void;
}

const Profile: React.FC<ProfileProps> = ({
  isProfileOpen,
  isMenuOpen,
  toggleProfile,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const lan = pathname.split("/")[1];

  const { isReady, isLoggedIn, isAdmin, userData, logout } = useAuth();
  const { openLoginModal } = useLoginModal();

  const handleLogout = async () => {
    await logout();
    toggleProfile();
  };

  if (!isReady) {
    return (
      <div className="rounded-full p-2 border overflow-hidden animate-pulse">
        <div className="h-6 w-6"></div>
      </div>
    );
  }

  return (
    <>
      {isLoggedIn ? (
        <>
          {/* Profile button */}
          <button
            className="border border-gray-300 dark:border-transparent rounded-full bg-white dark:bg-black overflow-hidden"
            onClick={toggleProfile}
          >
            <Image
              src={userData?.photo || "/default_profile.jpg"}
              alt={userData?.username || "Profile"}
              width={100}
              height={100}
              className="w-8 h-8 rounded-full object-cover"
            />
          </button>

          {/* Profile panel */}
          <div
            className={`h-screen overflow-y-auto fixed inset-0 flex justify-end bg-linear-to-l from-neutral-800 to-transparent dark:from-neutral-600 dark:to-transparent z-10 transition-opacity duration-500 ease-in-out ${
              isProfileOpen ? "opacity-100" : "opacity-0"
            } ${isProfileOpen ? "pointer-events-auto" : "pointer-events-none"}`}
          >
            {/* Profile container */}
            <div
              className={`w-full md:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6 min-h-screen pb-10 z-10 transition-all duration-500 ease-out ${
                isProfileOpen
                  ? "translate-y-0 opacity-100"
                  : "-translate-y-full opacity-0"
              }`}
            >
              <ul className="py-20 space-y-4">
                {/* Close button */}
                <div className="absolute top-0 right-0 pt-6 pr-5">
                  <svg
                    onClick={toggleProfile}
                    className="w-6 h-6 cursor-pointer stroke-sky-50 hover:stroke-slate-500"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="white"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18 18 6m0 12L6 6"
                    />
                  </svg>
                </div>

                {/* Profile image and username */}
                <div className="relative mx-8 mt-8">
                  <div className="bg-gray-200 square rounded-lg flex justify-center items-center overflow-hidden">
                    {/* Background image */}
                    <Image
                      src="/images/profile_background.webp"
                      alt="Background"
                      width={0}
                      height={0}
                      className="w-full h-full object-cover"
                    />
                    {/* Profile image */}
                    <div className="absolute">
                      <Image
                        src={userData?.photo || "/images/smile.png"}
                        alt="Inner Profile"
                        width={100}
                        height={100}
                        priority={true}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    {/* Username */}
                    <div className="absolute bottom-10">
                      <p className="text-white text-lg text-center">
                        {userData?.username}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Welcome message */}
                <div className="mx-8 my-2">
                  <p className="px-8 py-4 text-center text-sm font-semibold text-gray-700 bg-white rounded-md">
                    {`${userData?.username}`}
                  </p>
                </div>

                {/* Write Post button (admin only) */}
                {isAdmin && (
                  <div className="mx-8 my-4">
                    <button
                      onClick={() => {
                        toggleProfile();
                        router.push(`/${lan}/write`);
                      }}
                      className="w-full px-8 py-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Write Post
                    </button>
                  </div>
                )}

                {/* Logout button */}
                <div className="mx-8 my-4">
                  <button
                    onClick={handleLogout}
                    className="w-full px-8 py-4 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Sign Out
                  </button>
                </div>
              </ul>
            </div>
          </div>
        </>
      ) : (
        <button
          id="profile-button"
          className="border border-gray-300 dark:border-transparent rounded-full bg-white dark:bg-black p-2 overflow-hidden"
          onClick={openLoginModal}
        >
          <svg
            className="h-6 w-6 dark:fill-current dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeWidth="2"
              d="M7 17v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3Zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        </button>
      )}
    </>
  );
};

export default Profile;
