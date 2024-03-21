import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";

import { addPost } from "@/lib/mongodb";
import { setCurrentView } from "@/features/blog/blogSlice";
import dummyTextJa from "@/test/dummy_ja";
import dummyTextKo from "@/test/dummy_ko";

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
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false); // drag
  const [images, setImages] = useState<string[]>([]);
  const [representativeImage, setRepresentativeImage] = useState<string>("");
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    target: 0,
  }); // context menu

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

  useEffect(() => {
    console.log(content);
    // console.log(images);
    // console.log(contextMenu);
  }, [content]);

  const handleAddImages = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false); // 드래그가 끝나면 isDragOver 상태를 false로 설정
    const files = event.dataTransfer.files;

    if (files.length > 0) {
      const uploadPromises = Array.from(files).map(async (file) => {
        // 파일명 생성 로직
        // 타임 스탬프 만들기
        const now = new Date();
        const dateOptions: Intl.DateTimeFormatOptions = {
          year: "2-digit",
          month: "2-digit",
          day: "2-digit",
        };
        const timeOptions: Intl.DateTimeFormatOptions = {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false, // 24시간 표시를 원할 경우
        };

        // 날짜 포매팅 후 구분자 제거
        const formattedDate = now
          .toLocaleDateString("ko-KR", dateOptions)
          .replace(/\.\s?/g, "");

        // 시간 포매팅 후 구분자 제거
        const formattedTime = now
          .toLocaleTimeString("ko-KR", timeOptions)
          .replace(/:/g, "");

        const formattedTimestamp = `${formattedDate}-${formattedTime}`;
        const originalFileName = file.name;
        const safeFileName = originalFileName.replace(/\s+/g, "_");
        const newFileName = `tmp_${formattedTimestamp}_${safeFileName}`;

        // FormData 준비
        const formData = new FormData();
        formData.append("file", file, newFileName);

        try {
          const requestOptions = { method: "PUT", body: formData.get("file") };
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_R2_URI}/${newFileName}`,
            requestOptions
          );
          const result = await response.text(); // 또는 response.json() 등 response 처리

          // 업로드된 이미지 URL 설정
          return `${process.env.NEXT_PUBLIC_R2_URI}/${newFileName}`;
        } catch (error) {
          console.error("Upload error:", error);
          return null;
        }
      });
      const uploadedImageUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedImageUrls.filter(
        (url) => url !== null
      ) as string[];
      setImages((prev) => [...prev, ...validUrls]);
    }
  };

  const insertImageAtCursor = (imageUrl: string) => {
    const markdownImageText = `![Alt text](${imageUrl})\n`;
    const currentContent = content[selectedLanguage];
    const textAreaElement = textAreaRef.current;

    if (textAreaElement) {
      const startPos = textAreaElement.selectionStart;
      const endPos = textAreaElement.selectionEnd;
      const textBefore = currentContent.substring(0, startPos);
      const textAfter = currentContent.substring(endPos, currentContent.length);

      const newContent = textBefore + markdownImageText + textAfter;
      setContent({ ...content, [selectedLanguage]: newContent });

      // 커서 위치를 새로 삽입된 텍스트 뒤로 이동
      setTimeout(() => {
        textAreaElement.selectionStart = textAreaElement.selectionEnd =
          startPos + markdownImageText.length;
        textAreaElement.focus();
      }, 0);
    }
  };

  // 컨택스트메뉴 생성
  const onContextMenu = (
    event: React.MouseEvent<HTMLDivElement>,
    index: number
  ) => {
    event.preventDefault();

    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      target: index,
    });
  };

  // 컨텍스트메뉴 제거
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as Element;

      // 메뉴가 이미 표시되어 있고, 클릭 이벤트가 메뉴 내부에서 발생하지 않은 경우에만 메뉴를 숨깁니다.
      if (contextMenu.visible && !target.closest("#context-menu")) {
        setContextMenu((prevState) => ({
          ...prevState,
          visible: false,
        }));
      }
    };

    document.addEventListener("click", handleGlobalClick); // 전역 클릭 이벤트 리스너 등록

    return () => {
      document.removeEventListener("click", handleGlobalClick); // 컴포넌트 언마운트 시 리스너 제거
    };
  }, [contextMenu.visible]); // 의존성 배열에 contextMenu.visible 추가

  // 대표 이미지 설정 로직
  const setAsPrimary = (index: number) => {
    const selectedImageLink = images[index];
    setRepresentativeImage(selectedImageLink);
  };

  // 대표 이미지 선택 해제 로직
  const deselectAsPrimary = () => {
    setRepresentativeImage("");
  };

  // 이미지 삭제
  const handleDeleteImage = async (imageLink: string) => {
    try {
      // 서버에서 이미지 삭제
      const requestOptions = { method: "DELETE" };
      await fetch(
        `${process.env.NEXT_PUBLIC_R2_URI}/${imageLink}`,
        requestOptions
      );

      // 클라이언트 상태 업데이트
      setImages((currentImages) =>
        currentImages.filter((image) => image !== imageLink)
      );
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

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
        representativeImage,
        content_ko,
        content_ja
      );

      alert("Post successfully added!");

      // sessionStorage.setItem("currentView", "adminPostList");
      // handleViewChange("adminPostList"); // AdminPostList로 redirection
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
    for (let i = 1; i <= 15; i++) {
      const title_ko = `더미 포스트 제목 ${i}`;
      const title_ja = `ダミーポストタイトル ${i}`;
      try {
        await addPost(
          categoryId,
          title_ko,
          title_ja,
          dummyTextKo,
          dummyTextJa,
          "https://blog_workers.forever-fl.workers.dev/profile.png"
        );
      } catch (error) {
        console.error(`더미 데이터 ${i} 추가 실패:`, error);
      }
    }
    alert("더미 데이터 15개가 성공적으로 추가되었습니다.");
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
        {/* 타이틀 */}
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

        {/* 이미지 업로드 영역 */}
        <div
          onDrop={handleAddImages}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true); // 드래그 오버 상태로 설정
          }}
          onDragLeave={() => setIsDragOver(false)} // 드래그가 영역을 벗어날 때 상태를 초기화
          className={`mt-4 p-4 h-80 flex ${
            images.length === 0
              ? "items-center justify-center " // 이미지가 없을 때 가운데 정렬
              : "" // 이미지가 있을 때는 가로 정렬
          }${
            isDragOver
              ? "border-4 border-blue-500"
              : "border-dashed border-2 border-gray-400"
          }`}
        >
          {images.length === 0 ? (
            <p>Upload</p>
          ) : (
            <div className="flex overflow-x-auto items-center space-x-3">
              {images.map((image, index) => (
                <div
                  className={`flex-none ${
                    image === representativeImage
                      ? "border-4 border-blue-500"
                      : ""
                  }`}
                  key={index}
                  onContextMenu={(e) => onContextMenu(e, index)}
                  onClick={() => {
                    const imageLink = images[index];
                    insertImageAtCursor(imageLink);
                  }}
                >
                  <Image
                    key={index}
                    src={image}
                    width={300}
                    height={300}
                    alt="Uploaded"
                    className="object-cover w-52 h-64" // flex 아이템 크기 고정
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/*컨텐츠 */}
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700"
          >
            Content
          </label>
          <textarea
            id="content"
            ref={textAreaRef}
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

      {/* 컨텍스트 메뉴 */}
      {contextMenu.visible && (
        <ul
          id="context-menu"
          className="fixed bg-white shadow-lg rounded-lg"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
        >
          <li
            className="p-2 hover:bg-red-300 cursor-pointer"
            onClick={() => {
              const imageLink = images[contextMenu.target];
              handleDeleteImage(imageLink);
            }}
          >
            Delete
          </li>
          {images[contextMenu.target] !== representativeImage ? (
            <li
              className="p-2 hover:bg-blue-300 cursor-pointer"
              onClick={() => setAsPrimary(contextMenu.target)}
            >
              Set as Primary
            </li>
          ) : (
            <li
              className="p-2 hover:bg-blue-300 cursor-pointer"
              onClick={deselectAsPrimary}
            >
              Deselect as Primary
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default AdminCreatePost;
