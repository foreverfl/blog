"use client";

import React, { useEffect } from "react";
import Modal from "react-modal";
import LoginButton, { providers } from "@/components/organism/Login";
import { useLoginModal } from "@/lib/context/login-modal-context";
import { usePathname } from "next/navigation";
import "@/lib/i18n";
import { useTranslation } from "react-i18next";

const LoginModal: React.FC = () => {
  const { isOpen, closeLoginModal } = useLoginModal();
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const lan = pathname.split("/")[1];

  useEffect(() => {
    if (["en", "ja", "ko"].includes(lan)) {
      i18n.changeLanguage(lan);
    }
  }, [lan, i18n]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeLoginModal}
      contentLabel="Sign In"
      ariaHideApp={false}
      style={{
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          transform: "translate(-50%, -50%)",
          padding: "0",
          border: "none",
          width: "95vw",
          maxWidth: "400px",
          borderRadius: "8px",
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 9999,
        },
      }}
    >
      <div className="p-8 bg-white dark:bg-[#090909] text-gray-900 dark:text-gray-100 rounded-lg">
        <div className="flex justify-end">
          <button
            onClick={closeLoginModal}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>
        <h2 className="text-2xl font-bold mb-8 text-center">
          {t("login_title")}
        </h2>
        <div className="flex flex-col space-y-4">
          {providers.map((p) => (
            <LoginButton key={p.id} provider={p} />
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default LoginModal;
