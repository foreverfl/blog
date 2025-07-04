"use client";

import BugReport from "@/components/modal/BugReport";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import PrivacyPolicy from "@/components/modal/PrivacyPolicy";

const Footer: React.FC = () => {
  const [isPrivacyOpen, setPrivacyOpen] = useState(false);
  const [isBugBountyOpen, setBugBountyOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    Modal.setAppElement("body");
  }, []);

  return (
    <>
      <footer className="p-24 dark:text-neutral-50 dark:bg-neutral-900">
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
          <div className="mt-5 flex flex-row items-center justify-center gap-4">
            <button
              onClick={() => setPrivacyOpen(true)}
              className="text-sm text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-gray-400">|</span>
            <button
              onClick={() => setBugBountyOpen(true)}
              className="text-sm text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white cursor-pointer"
            >
              Bug Report
            </button>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      <Modal
        isOpen={isPrivacyOpen}
        onRequestClose={() => setPrivacyOpen(false)}
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
              onClick={() => setPrivacyOpen(false)}
              className="text-black-500 hover:text-black-700"
            >
              ✕
            </button>
          </div>
        </div>
        <PrivacyPolicy />
      </Modal>

      {/* Bug Bounty Modal */}
      <Modal
        isOpen={isBugBountyOpen}
        onRequestClose={() => setBugBountyOpen(false)}
        contentLabel="Bug Bounty"
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
            maxWidth: "480px",
            borderRadius: "8px",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 9999,
          },
        }}
      >
        <div className="p-4 bg-white dark:bg-[#090909] text-gray-900 dark:text-gray-100">
          <div className="flex justify-end">
            <button
              onClick={() => setBugBountyOpen(false)}
              className="text-black-500 hover:text-black-700"
            >
              ✕
            </button>
          </div>
          <BugReport isOpen={isBugBountyOpen} setIsOpen={setBugBountyOpen} />
        </div>
      </Modal>
    </>
  );
};

export default Footer;
