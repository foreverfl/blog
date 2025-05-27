import { useEffect, useState } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function usePageButtonCount() {
  const [count, setCount] = useState(10);

  useEffect(() => {
    const setBtnCount = () => {
      if (window.innerWidth <= 640) {
        setCount(5);
      } else {
        setCount(10);
      }
    };
    setBtnCount();
    window.addEventListener("resize", setBtnCount);
    return () => window.removeEventListener("resize", setBtnCount);
  }, []);
  return count;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pageButtonCount = usePageButtonCount();

  if (totalPages <= 1) return null;

  const currentGroup = Math.floor((currentPage - 1) / pageButtonCount);
  const startPage = currentGroup * pageButtonCount + 1;
  const endPage = Math.min(startPage + pageButtonCount - 1, totalPages);

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const handlePrevGroup = () => {
    const prevGroupStart = startPage - pageButtonCount;
    if (prevGroupStart >= 1) onPageChange(prevGroupStart);
  };

  const handleNextGroup = () => {
    const nextGroupStart = endPage + 1;
    if (nextGroupStart <= totalPages) onPageChange(nextGroupStart);
  };

  return (
    <div className="flex justify-center mt-10">
      {/* before */}
      <button
        className="mx-1 px-3 py-1 border border-gray-400 rounded hover:bg-gray-300 dark:hover:bg-neutral-600 text-gray-800 dark:text-white transition disabled:opacity-50"
        onClick={handlePrevGroup}
        disabled={startPage === 1}
      >
        &lt;&lt;
      </button>

      {/* page numbers */}
      {pageNumbers.map((num) => (
        <button
          key={num}
          className={`mx-1 px-3 py-1 border border-gray-400 rounded hover:bg-gray-300 dark:hover:bg-neutral-600 transition ${
            currentPage === num
              ? "bg-gray-400 dark:bg-neutral-700 text-white"
              : "bg-white text-gray-800 dark:bg-neutral-800 dark:text-gray-200"
          }`}
          onClick={() => onPageChange(num)}
        >
          {num}
        </button>
      ))}

      {/* after */}
      <button
        className="mx-1 px-3 py-1 border border-gray-400 rounded hover:bg-gray-300 dark:hover:bg-neutral-600 text-gray-800 dark:text-white transition disabled:opacity-50"
        onClick={handleNextGroup}
        disabled={endPage === totalPages}
      >
        &gt;&gt;
      </button>
    </div>
  );
};

export default Pagination;
