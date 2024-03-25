import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";

import { addPost, updatePost } from "@/lib/mongodb";
import { setCurrentView } from "@/features/blog/blogSlice";
import {
  deleteImage,
  renameAndOverwriteFiles,
  uploadFiles,
} from "@/lib/workers";
import { fetchPosts } from "@/features/post/postsSlice";
import { usePathname, useRouter } from "next/navigation";
import { setUsedImages } from "@/features/blog/blogRouteSlice";

interface PostProps {
  postIdx: string;
}

const PostEdit: React.FC<PostProps> = ({ postIdx }) => {
  const router = useRouter();
  const pathname = usePathname();

  // Redux
  const dispatch = useAppDispatch();

  const { currentPost, status } = useAppSelector((state) => state.postSelected);

  const { classifications, categories } = useAppSelector(
    (state) => state.category
  );

  // State
  const [selectedLanguage, setSelectedLanguage] = useState<"ko" | "ja">("ko"); // language
  const [selectedClassificationId, setSelectedClassificationId] =
    useState<string>(""); // classification
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(""); // category
  const [title, setTitle] = useState({
    ko: currentPost!.title_ko,
    ja: currentPost!.title_ja,
  });
  const [content, setContent] = useState({
    ko: currentPost!.content_ko,
    ja: currentPost!.content_ja,
  });
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false); // drag
  const [imagesBefore, setImagesBefore] = useState<string[]>(
    currentPost!.images
  );
  const [images, setImages] = useState<string[]>(currentPost!.images);
  const [representativeImage, setRepresentativeImage] = useState<string>(
    currentPost!.image
  );
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    target: 0,
  }); // context menu

  // Classification을 가져옴
  useEffect(() => {
    if (currentPost && classifications.length > 0 && categories.length > 0) {
      // currentPost의 category ID로부터 해당 Category 객체를 찾음
      const currentCategory = categories.find(
        (c) => c._id === currentPost.category
      );
      if (currentCategory) {
        const currentClassificationId = currentCategory.classification; // 찾은 Category로부터 classification ID를 추출
        setSelectedCategoryId(currentPost.category); // 현재 포스트의 Category ID 설정
        setSelectedClassificationId(currentClassificationId); // 해당 Category의 Classification ID 설정
      }
    }
  }, [currentPost, classifications, categories]);

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

  // 페이지가 로딩될 때(currentPost가 설정될 때) 한 번만 실행
  // 'objectId_시간_파일명'을 'updating_시간_파일명'으로 변환
  // content_ko, content_ja 내에서도 'updating_시간_파일명'으로 변환
  useEffect(() => {
    if (currentPost) {
      const updateFiles = async () => {
        // 이미지 변환
        const { imageUrls } = await renameAndOverwriteFiles(
          images,
          currentPost!._id,
          "updating"
        );

        const updatingRepresentativeImageUrl = representativeImage.replace(
          /(https:\/\/blog_workers\.forever-fl\.workers\.dev\/)tmp_/,
          `$1updating_`
        );

        setRepresentativeImage(updatingRepresentativeImageUrl);
        setImages(imageUrls);

        // 텍스트 내에서의 이미지 링크 변환
        const updatingContentKo = content.ko.replaceAll(
          `https://blog_workers.forever-fl.workers.dev/${currentPost?._id.toString()}`,
          `https://blog_workers.forever-fl.workers.dev/updating`
        );
        const updatingContentJa = content.ja.replace(
          `https://blog_workers.forever-fl.workers.dev/${currentPost?._id.toString()}`,
          `https://blog_workers.forever-fl.workers.dev/updating`
        );

        setContent({
          ko: updatingContentKo,
          ja: updatingContentJa,
        });
      };

      updateFiles().catch(console.error);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 'updating_날짜_파일명' 이미지 삭제 로직
  useEffect(() => {
    // 뒤로 갈 때 처리
    dispatch(setUsedImages(images)); // 삭제는 navbar에서 이루어짐

    // 다른 페이지로 벗어날 때 처리
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      for (const image of images) {
        deleteImage(image);
      }

      const message = "정말로 나가시겠습니까?";
      event.returnValue = message; // 구버전의 크롬에서 필요함
      return message; // 대부분의 브라우저에서는 이 메시지를 사용자에게 보여줌
    };

    // 포스트 수정 시 뒤로가기를 위해서 미리 history에 현제 페이지 저장
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [dispatch, images]);

  const handleAddImages = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false); // 드래그가 끝나면 isDragOver 상태를 false로 설정
    event.preventDefault();
    setIsDragOver(false);

    const { urls, errors } = await uploadFiles(
      event.dataTransfer.files,
      "updating"
    );

    if (errors.length > 0) {
      console.error("Upload errors:", errors.join(", "));
    }

    setImages((prev) => [...prev, ...urls]);
  };

  const insertImageAtCursor = (imageUrl: string) => {
    const markdownImageText = `![Alt text](${imageUrl})\n`;
    const currentContent = content[selectedLanguage];
    const textAreaElement = textAreaRef.current;

    if (textAreaElement) {
      const startPos = textAreaElement.selectionStart;
      const endPos = textAreaElement.selectionEnd;
      const textBefore = currentContent!.substring(0, startPos);
      const textAfter = currentContent!.substring(
        endPos,
        currentContent!.length
      );

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
    const isSuccess = await deleteImage(imageLink);
    if (isSuccess) {
      setImages((currentImages) =>
        currentImages.filter((image) => image !== imageLink)
      );
    } else {
      console.error("Failed to delete image from server");
    }
  };

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedCategoryId) {
      alert("Please select a category.");
      return;
    }

    const insertedId = currentPost!._id.toString();
    const title_ko = title.ko;
    const title_ja = title.ja;
    const content_ko = content.ko;
    const content_ja = content.ja;

    try {
      // 이전 포스트 이미지 제거
      for (const image of imagesBefore) {
        await deleteImage(image);
      }

      // R2 내부에서 이미지 파일명 변경
      const newImageUrls = await renameAndOverwriteFiles(
        images,
        "updating",
        insertedId
      );

      // 대표 이미지 파일명 변경
      const newRepresentativeImageUrl = representativeImage.replace(
        /(https:\/\/blog_workers\.forever-fl\.workers\.dev\/)updating_/,
        `$1${insertedId}_`
      );

      // 콘텐츠 내의 모든 'tmp' URL을 'insertedId'로 대체
      const updatedContentKo = content_ko.replace(
        /https:\/\/blog_workers\.forever-fl\.workers\.dev\/updating/g,
        `https://blog_workers.forever-fl.workers.dev/${insertedId}`
      );
      const updatedContentJa = content_ja.replace(
        /https:\/\/blog_workers\.forever-fl\.workers\.dev\/updating/g,
        `https://blog_workers.forever-fl.workers.dev/${insertedId}`
      );

      // DB 업데이트
      const updateResult = await updatePost(
        insertedId,
        title_ko,
        title_ja,
        updatedContentKo,
        updatedContentJa,
        newImageUrls.imageUrls,
        newRepresentativeImageUrl
      );

      // 글 작성 중에 사용한 임시 이미지 제거
      for (const image of images) {
        await deleteImage(image);
      }

      // State 초기화
      setSelectedCategoryId("");
      setTitle({ ko: "", ja: "" });
      setContent({ ko: "", ja: "" });
      setImages([]);
      setRepresentativeImage("");

      alert("The post has been updated!");
      dispatch(fetchPosts()); // 포스트 정보 리로딩
      dispatch(setCurrentView({ view: "main" })); // main 뷰로 상태 변경
      sessionStorage.setItem("currentView", "main");
      router.push("/", { scroll: false });
    } catch (error) {
      console.error("Failed to add post:", error);
      alert("Failed to add the post.");
    }
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

        {/* 업데이트 버튼 */}
        <div className="flex justify-between items-center gap-4">
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150"
            onClick={handleUpdate}
          >
            Update
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
      <form onSubmit={handleUpdate} className="flex flex-col gap-6">
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

export default PostEdit;
