import React, { useState, useMemo, useEffect } from "react";
import Fuse from "fuse.js";

interface FrontMatter {
  fileName?: string;
  title: string;
  date: string;
  classification: string;
  category: string;
  image: string;
}

function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: NodeJS.Timeout;

  return function (...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const Search: React.FC = () => {
  const [posts, setPosts] = useState<FrontMatter[]>([]);
  const [searchResults, setSearchResults] = useState<FrontMatter[]>(posts);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch("/api/search-result?lan=ko"); // 한국어 게시물 가져오기
      const data: FrontMatter[] = await res.json();
      setPosts(data);
      setSearchResults(data); // 처음에는 전체 게시물을 표시
    };

    fetchPosts();
  }, []);

  // Fuse.js 설정
  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        keys: ["title", "classification", "category"],
        threshold: 0.3, // 퍼지 검색을 허용할 범위
      }),
    [posts]
  );

  // 디바운스된 검색 함수
  const debouncedSearch = useMemo(
    () =>
      debounce((input: string) => {
        if (!input) {
          setSearchResults(posts); // 검색어가 없으면 전체 포스트 반환
        } else {
          const result = fuse.search(input).map((result) => result.item);
          setSearchResults(result);
        }
      }, 300), // 300ms 지연 후 검색 실행
    [fuse, posts]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setQuery(inputValue);
    debouncedSearch(inputValue); // 입력값이 바뀔 때마다 디바운스된 검색 실행
  };

  const handleSearchSubmit = () => {
    debouncedSearch(query); // 검색 버튼을 클릭하면 검색 실행
  };

  const isInputFilled = query.length > 0;

  return (
    <div className="relative">
      {/* 검색창 및 버튼 */}
      <div className="mx-8 flex items-center">
        <svg
          className="w-6 h-6 flex-shrink-0 mr-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="white"
          viewBox="0 0 24 24"
        >
          <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z" />
          <path
            fillRule="evenodd"
            d="M21.7 21.7a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 0 1 1.4-1.4l3.5 3.5c.4.4.4 1 0 1.4Z"
            clipRule="evenodd"
          />
        </svg>

        <input
          className="w-full p-4 bg-transparent border-none focus:ring-0 text-white"
          type="search"
          placeholder="Search..."
          onChange={handleInputChange}
          value={query}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearchSubmit();
            }
          }}
        />
        <button className="ml-3" onClick={handleSearchSubmit}>
          <svg
            className={`w-6 h-6 ${
              isInputFilled ? "text-white" : "text-gray-800"
            }`}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 12H5m14 0-4 4m4-4-4-4"
            />
          </svg>
        </button>
      </div>

      {/* 검색 결과를 바로 아래에 표시 */}
      {query && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-lg z-10 max-h-64 overflow-y-auto">
          {searchResults.length > 0 ? (
            searchResults.map((post) => (
              <div
                key={post.fileName}
                className="p-4 hover:bg-gray-100 cursor-pointer"
              >
                <h3 className="text-lg font-semibold">{post.title}</h3>
                <p className="text-sm text-gray-600">
                  {post.classification} / {post.category} / {post.date}
                </p>
              </div>
            ))
          ) : (
            <div className="p-4">No results found.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
