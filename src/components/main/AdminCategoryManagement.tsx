import React, { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  addClassificationAsync,
  fetchClassificationsAndCategories,
} from "@/features/category/categorySlice";

const MainContent: React.FC = () => {
  const dispatch = useAppDispatch();

  const { userName, userId, email, photo, isLoggedOut } = useAppSelector(
    (state) => state.user
  );

  const { classifications, categories, loading } = useAppSelector(
    (state) => state.category
  );

  useEffect(() => {
    dispatch(fetchClassificationsAndCategories());
  }, [dispatch]);

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeModal]);

  // Add Classification
  const [korean, setKorean] = useState("");
  const [japanese, setJapanese] = useState("");

  const handleKoreanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKorean(e.target.value);
  };

  const handleJapaneseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJapanese(e.target.value);
  };

  const handleAddClick = () => {
    // 입력 값이 있을 때만 액션 디스패치
    if (korean && japanese) {
      dispatch(addClassificationAsync({ name_ko: korean, name_ja: japanese }));
      closeModal(); // 모달 닫기
      setKorean(""); // 입력 필드 초기화
      setJapanese(""); // 입력 필드 초기화
    }
  };

  // Edit Classification

  // Delete Classification

  return (
    <div className="flex h-screen my-10">
      {/* 왼쪽 부분: Classifications */}
      <div className="w-1/2 border-r border-gray-200 px-10">
        <div className="flex space-x-6">
          <button
            onClick={openModal}
            className="bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white p-2 rounded transition-colors duration-150 w-16"
          >
            Add
          </button>
          <button className="bg-transparent border border-green-600 text-green-600 hover:bg-green-600 hover:text-white p-2 rounded transition-colors duration-150 w-16">
            Edit
          </button>
          <button className="bg-transparent border border-red-500 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded transition-colors duration-150 w-16">
            Delete
          </button>
        </div>

        <h2 className="text-3xl font-bold mt-10">Classifications</h2>

        <div className="flex flex-col px-10">
          <div role="group" className="space-y-2">
            {classifications.map((classification, index) => (
              <label
                key={classification._id}
                className="has-[:checked]:bg-blue-500 has-[:checked]:text-white has-[:checked]:border-transparent block cursor-pointer text-lg p-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                <input
                  type="radio"
                  id={`vbtn-radio${index}`}
                  name="classification"
                  value={classification._id}
                  className="hidden peer" // 숨김 처리
                  autoComplete="off"
                />
                {`${classification.name_ko} / ${classification.name_ja}`}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Classification Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-lg space-y-6 max-w-lg">
            <h3 className="font-semibold text-2xl">Add Classification</h3>
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
                onClick={closeModal}
                className="btn bg-red-500 text-white p-2 rounded hover:bg-red-700 w-20"
              >
                Cancel
              </button>
              <button
                onClick={handleAddClick}
                className="btn bg-blue-500 text-white p-2 rounded hover:bg-blue-700 w-20"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 오른쪽 부분: Categories */}
      <div className="w-1/2 border-r border-gray-200 px-10">
        <div className="flex space-x-6">
          <button
            onClick={openModal}
            className="bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white p-2 rounded transition-colors duration-150"
          >
            추가
          </button>
          <button className="bg-transparent border border-green-600 text-green-600 hover:bg-green-600 hover:text-white p-2 rounded transition-colors duration-150">
            수정
          </button>
          <button className="bg-transparent border border-red-500 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded transition-colors duration-150">
            삭제
          </button>
        </div>

        <h2 className="text-3xl font-bold mt-10">Categories</h2>

        <ul className="overflow-auto"></ul>
      </div>
    </div>
  );
};

export default MainContent;
