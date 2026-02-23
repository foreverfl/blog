"use client";

import { createContext, ReactNode, useContext, useState } from "react";

interface LoginModalContextType {
  isOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const LoginModalContext = createContext<LoginModalContextType | undefined>(
  undefined,
);

export function LoginModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openLoginModal = () => {
    document.cookie =
      "preLoginUrl=" +
      encodeURIComponent(window.location.href) +
      "; path=/; max-age=600";
    setIsOpen(true);
  };

  const closeLoginModal = () => setIsOpen(false);

  return (
    <LoginModalContext.Provider
      value={{ isOpen, openLoginModal, closeLoginModal }}
    >
      {children}
    </LoginModalContext.Provider>
  );
}

export function useLoginModal() {
  const context = useContext(LoginModalContext);
  if (context === undefined) {
    throw new Error("useLoginModal must be used within a LoginModalProvider");
  }
  return context;
}
