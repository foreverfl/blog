import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addPost } from "@/lib/mongodb";
import { setCurrentView } from "@/features/blog/blogSlice";

const AdminCreatePost: React.FC = () => {
  // Redux
  const dispatch = useAppDispatch();

  const { classifications, categories } = useAppSelector(
    (state) => state.category
  );

  // State
  const [selectedLanguage, setSelectedLanguage] = useState<"ko" | "ja">("ko"); // language
  const [selectedClassificationId, setSelectedClassificationId] =
    useState<string>(""); // classification
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(""); // category
  const [title, setTitle] = useState({ ko: "", ja: "" });
  const [content, setContent] = useState({ ko: "", ja: "" });

  // Handler
  const handleLanguageChange = (language: "ko" | "ja") => {
    setSelectedLanguage(language);
  };

  const handleClassificationChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedClassificationId(event.target.value);
    setSelectedCategoryId(""); // 분류가 변경되면 카테고리 선택 초기화
  };

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedCategoryId(event.target.value);
  };

  const filteredCategories = categories.filter(
    (category) => category.classification === selectedClassificationId
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedCategoryId) {
      alert("Please select a category.");
      return;
    }

    const title_ko = title.ko;
    const title_ja = title.ja;
    const content_ko = content.ko;
    const content_ja = content.ja;

    try {
      const insertedId = await addPost(
        selectedCategoryId,
        title_ko,
        title_ja,
        content_ko,
        content_ja
      );

      alert("Post successfully added!");

      handleViewChange("adminPostList"); // AdminPostList로 redirection
    } catch (error) {
      console.error("Failed to add post:", error);
      alert("Failed to add the post.");
    }
  };

  const handleViewChange = (view: string) => {
    dispatch(setCurrentView({ view }));
  };

  // 더미 데이터 추가 함수
  const addDummyDataToCategory = async (categoryId: string) => {
    for (let i = 1; i <= 50; i++) {
      const title_ko = `더미 포스트 제목 ${i} (KO)`;
      const title_ja = `ダミーポストタイトル ${i} (JA)`;
      const content_ko = `더미 포스트 내용 ${i} (KO). 여기에 더 상세한 내용을 채웁니다.`;
      const content_ja = `ダミーポスト内容 ${i} (JA). ここに詳細な内容を記入します。`;
      try {
        await addPost(categoryId, title_ko, title_ja, content_ko, content_ja);
      } catch (error) {
        console.error(`더미 데이터 ${i} 추가 실패:`, error);
      }
    }
    alert("더미 데이터 50개가 성공적으로 추가되었습니다.");
  };

  // "Add Dummy Data" 버튼 클릭 핸들러
  const handleAddDummyDataClick = () => {
    if (!selectedCategoryId) {
      alert("카테고리를 선택하세요.");
      return;
    }
    addDummyDataToCategory(selectedCategoryId);
  };

  return (
    <div className="p-8">
      {/* 언어 선택 및 제출 버튼 */}
      <div className="mb-8 flex justify-between items-end">
        {/* 언어 선택 버튼 */}
        <div className="flex">
          <button
            type="button"
            className={`px-4 py-2 border rounded-l-lg ${
              selectedLanguage === "ko"
                ? "bg-blue-600 text-white"
                : "bg-transparent text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
            } transition-colors duration-150`}
            onClick={() => handleLanguageChange("ko")}
          >
            Korean
          </button>
          <button
            type="button"
            className={`px-4 py-2 border-t border-b border-r rounded-r-lg ${
              selectedLanguage === "ja"
                ? "bg-blue-600 text-white"
                : "bg-transparent text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
            } transition-colors duration-150`}
            onClick={() => handleLanguageChange("ja")}
          >
            Japanese
          </button>
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-between items-center gap-4">
          <button
            type="button"
            className="px-4 py-2 ml-4 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-150"
            onClick={handleAddDummyDataClick}
          >
            Add Dummy Data
          </button>

          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>

      <div className="mb-8 flex gap-4 ">
        {/* Select Classification */}
        <div>
          <select
            id="classification"
            value={selectedClassificationId}
            onChange={handleClassificationChange}
            className="mt-1 block w-52 p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a classification</option>
            {classifications.map((classification) => (
              <option key={classification._id} value={classification._id}>
                {classification.name_ko}
              </option>
            ))}
          </select>
        </div>

        {/* Select Category */}
        <div>
          <select
            id="category"
            value={selectedCategoryId}
            onChange={handleCategoryChange}
            className="mt-1 block w-52 p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={!selectedClassificationId}
          >
            <option value="">Select a category</option>
            {filteredCategories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name_ko}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 포스트 작성 폼 */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title[selectedLanguage]}
            onChange={(e) =>
              setTitle({ ...title, [selectedLanguage]: e.target.value })
            }
            className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700"
          >
            Content
          </label>
          <textarea
            id="content"
            value={content[selectedLanguage]}
            onChange={(e) =>
              setContent({ ...content, [selectedLanguage]: e.target.value })
            }
            className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={50}
            required
          ></textarea>
        </div>
      </form>
    </div>
  );
};

export default AdminCreatePost;
