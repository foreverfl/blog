import React, { useState, useEffect, useCallback } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    korean: string,
    japanese: string,
    classificationId?: string,
    categoryId?: string
  ) => void;
  title: string;
  editingItem: { name_ko: string; name_ja: string };
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  editingItem,
}) => {
  // Utilities
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  // State
  const [korean, setKorean] = useState(editingItem?.name_ko || "");
  const [japanese, setJapanese] = useState(editingItem?.name_ja || "");

  // Other Hooks
  // 모달이 열릴 때마다 editingItem의 현재 값으로 입력 필드를 업데이트

  useEffect(() => {
    setKorean(editingItem?.name_ko || "");
    setJapanese(editingItem?.name_ja || "");
  }, [editingItem]);
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }

    // Cleanup 함수
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // Handler
  const handleKoreanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKorean(e.target.value);
  };

  const handleJapaneseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJapanese(e.target.value);
  };

  const handleSubmit = () => {
    onSubmit(korean, japanese);
    setKorean(""); // 입력 필드 초기화
    setJapanese(""); // 입력 필드 초기화
    onClose(); // 모달 닫기
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg space-y-6 max-w-lg">
        <h3 className="font-semibold text-2xl">{title}</h3>
        <input
          type="text"
          placeholder="Korean"
          value={korean}
          onChange={handleKoreanChange}
          className="input input-bordered w-full border border-gray-300 rounded text-xl"
        />
        <input
          type="text"
          placeholder="Japanese"
          value={japanese}
          onChange={handleJapaneseChange}
          className="input input-bordered w-full border border-gray-300 rounded text-xl"
        />
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="btn bg-red-500 text-white p-2 rounded hover:bg-red-700 w-20"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn bg-blue-500 text-white p-2 rounded hover:bg-blue-700 w-20"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
