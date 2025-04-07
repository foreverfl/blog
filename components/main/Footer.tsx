"use client";

import PrivacyPolicyEn from "@/components/common/PrivacyPolicyEn";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import PrivacyPolicyJa from "../common/PrivacyPolicyJa";
import PrivacyPolicyKo from "../common/PrivacyPolicyKo";

const Footer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    Modal.setAppElement("body");
  }, []);

  const renderPrivacyPolicy = () => {
    if (pathname.startsWith("/ko")) return <PrivacyPolicyKo />;
    if (pathname.startsWith("/ja")) return <PrivacyPolicyJa />;
    return <PrivacyPolicyEn />;
  };

  return (
    <>
      <footer className="p-4 dark:text-neutral-50 dark:bg-neutral-900">
        {/* Copyright */}
        <div className="container mx-auto text-center">
          {/* md 크기 이상에서만 보이는 span */}
          <span className="hidden md:inline-block font-footer text-2xl">
            &copy; {new Date().getFullYear()} designed and built by mogumogu.
            All rights reserved.
          </span>
          {/* md 크기 미만에서만 보이는 span */}
          <span className="md:hidden font-footer text-2xl">
            &copy; {new Date().getFullYear()} designed and built by mogumogu.
            <br />
            All rights reserved.
          </span>

          {/* Privacy Policy */}
          <div className="mt-2">
            <button
              onClick={() => setIsOpen(true)}
              className="text-sm text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white cursor-pointer"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </footer>

      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        contentLabel="Privacy Policy"
        ariaHideApp={false}
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            maxHeight: "80vh",
            overflowY: "auto",
            transform: "translate(-50%, -50%)",
            padding: "0",
            border: "none",
            width: "95vw",
            maxWidth: "720px",
            borderRadius: "8px", 
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
          },
        }}
      >
        <div className="p-6 bg-white dark:bg-[#090909] text-gray-900 dark:text-gray-100">
          <div className="flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="text-black-500 hover:text-black-700"
            >
              ✕
            </button>
          </div>
        </div>

        {renderPrivacyPolicy()}
      </Modal>
    </>
  );
};

export default Footer;
