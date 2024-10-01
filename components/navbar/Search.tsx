import React, { useState, useMemo, useEffect } from "react";
import Fuse from "fuse.js";
import ReactDOM from "react-dom";
import { usePathname } from "next/navigation";

interface Post {
  frontmatter: {
    fileName: string;
    title: string;
    date: string;
    classification: string;
    category: string;
    image: string;
  };
  content: string;
}

interface SearchProps {
  isMenuOpen: boolean;
}

function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: NodeJS.Timeout;

  return function (...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const Search: React.FC<SearchProps> = ({ isMenuOpen }) => {
  const pathname = usePathname();
  const lan = pathname.split("/")[1];

  const [posts, setPosts] = useState<Post[]>([]);
  const [searchResults, setSearchResults] = useState<Post[]>(posts);
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch(`/api/search-result?lan=${lan}`);
      const data: Post[] = await res.json();
      setPosts(data);
    };

    fetchPosts();
  }, [lan]);

  useEffect(() => {
    if (!isMenuOpen) {
      setQuery("");
    }
  }, [isMenuOpen]);

  // Fuse.js 설정
  const fuse = useMemo(
    () =>
      posts.length > 0
        ? new Fuse(posts, {
            keys: ["content"],
            threshold: 0.1, // 퍼지 검색을 허용할 범위
          })
        : null, // posts가 없을 때는 null로 설정
    [posts]
  );

  // 디바운스된 검색 함수
  const debouncedSearch = useMemo(
    () =>
      debounce((input: string) => {
        setIsSearching(true);

        if (!input) {
          setSearchResults(posts); // 검색어가 없으면 전체 포스트 반환
          setIsSearching(false);
        } else if (fuse) {
          const result = fuse.search(input).map((result) => result.item);
          setSearchResults(result);
          setIsSearching(false);
        } else {
          setSearchResults([]); // fuse가 없을 때 빈 배열 반환
          setIsSearching(false);
        }
      }, 300), // 300ms 지연 후 검색 실행
    [fuse, posts]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setQuery(inputValue);
    debouncedSearch(inputValue); // 입력값이 바뀔 때마다 디바운스된 검색 실행
  };

  const getHighlightedText = (
    content: string,
    query: string,
    snippetLength = 20
  ) => {
    const regex = new RegExp(query, "gi");
    const match = regex.exec(content);

    if (match) {
      const start = Math.max(0, match.index - snippetLength);
      const end = Math.min(
        content.length,
        match.index + query.length + snippetLength
      );

      const before = content.slice(start, match.index);
      const matchedText = content.slice(
        match.index,
        match.index + query.length
      );
      const after = content.slice(match.index + query.length, end);

      return (
        <>
          ...{before}
          <mark className="bg-yellow-200 dark:bg-yellow-600">
            {matchedText}
          </mark>
          {after}...
        </>
      );
    }

    // 검색어가 없으면 전체 텍스트를 반환
    return content;
  };

  const renderSearchResults = () => {
    if (!query || !isMenuOpen || isSearching) return null;

    return ReactDOM.createPortal(
      <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 bg-white dark:bg-gray-800 shadow-lg z-50 max-h-96 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
        {searchResults && searchResults.length > 0 ? (
          searchResults.map((post) => (
            <div
              key={post.frontmatter.fileName}
              className="p-4 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {post.frontmatter.title}
              </h3>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {getHighlightedText(post.content, query)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {post.frontmatter.classification} &gt;{" "}
                {post.frontmatter.category} |{" "}
                {new Date(post.frontmatter.date).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          ))
        ) : searchResults.length === 0 ? (
          <div className="p-4 text-center text-gray-600 dark:text-gray-400">
            {lan === "ko"
              ? "검색 결과가 없습니다."
              : lan === "ja"
              ? "結果が見つかりません。"
              : "No results found."}
          </div>
        ) : null}
      </div>,
      document.body // Portal을 사용하여 body 아래에 렌더링
    );
  };

  return (
    <>
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
        />
      </div>

      {/* Portal로 검색 결과 렌더링 */}
      {renderSearchResults()}
    </>
  );
};

export default Search;
