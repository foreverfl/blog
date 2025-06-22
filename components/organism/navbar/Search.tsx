import LinkWithSpinning from "@/components/molecules/LinkWithSpinning";
import { useLoadingDispatch } from "@/lib/context/loading-context";
import Fuse from "fuse.js";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useDebounce } from "react-use";

interface SearchItem {
  title: string;
  content: string;
  link: string;
  type: string;
}
interface SearchProps {
  isMenuOpen: boolean;
  closeMenu: () => void;
}

const Search: React.FC<SearchProps> = ({ isMenuOpen, closeMenu }) => {
  const pathname = usePathname();
  const lan = pathname.split("/")[1];

  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [allItems, setAllItems] = useState<SearchItem[]>([]);
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const fetchAllItems = useCallback(async () => {
    setIsSearching(true);
    const res = await fetch(`/api/indexing?lang=${lan}`);
    const data: SearchItem[] = await res.json();
    setAllItems(data);
    setIsSearching(false);
  }, [lan]);

  const doSearch = useCallback(() => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const fuse = new Fuse(allItems, {
      keys: ["content", "title"],
      threshold: 0.3,
    });
    const result = fuse.search(query).map((r) => r.item);
    setSearchResults(result);
    setIsSearching(false);
  }, [query, allItems]);

  useDebounce(doSearch, 300, [query, allItems]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const getHighlightedText = (
    content: string,
    query: string,
    snippetLength = 20,
  ) => {
    const regex = new RegExp(query, "gi");
    const match = regex.exec(content);

    if (match) {
      const start = Math.max(0, match.index - snippetLength);
      const end = Math.min(
        content.length,
        match.index + query.length + snippetLength,
      );

      const before = content.slice(start, match.index);
      const matchedText = content.slice(
        match.index,
        match.index + query.length,
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
    return content;
  };

  const renderSearchResults = () => {
    if (!query || !isMenuOpen || isSearching) return null;

    return ReactDOM.createPortal(
      <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 bg-white dark:bg-gray-800 shadow-lg z-50 max-h-96 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
        {searchResults && searchResults.length > 0 ? (
          searchResults.map((item) => (
            <LinkWithSpinning
              href={item.link}
              key={item.link}
              onClick={closeMenu}
            >
              <div className="p-4 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                  {item.title}
                </h3>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {getHighlightedText(item.content, query)}
                </p>
              </div>
            </LinkWithSpinning>
          ))
        ) : searchResults.length === 0 ? (
          <div className="p-4 text-center text-gray-600 dark:text-gray-400">
            {(() => {
              if (lan === "ko") return "검색 결과가 없습니다.";
              if (lan === "ja") return "結果が見つかりません。";
              return "No results found.";
            })()}
          </div>
        ) : null}
      </div>,
      document.body,
    );
  };

  useEffect(() => {
    fetchAllItems();
  }, [fetchAllItems]);

  useEffect(() => {
    if (!isMenuOpen) {
      setQuery("");
    }
  }, [isMenuOpen]);

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
