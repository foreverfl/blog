import React from "react";

interface PaginationProps {
  postsPerPage: number;
  totalPosts: number;
  paginate: (pageNumber: number) => void;
  currentPage: number;
}

const Pagination: React.FC<PaginationProps> = ({
  postsPerPage,
  totalPosts,
  paginate,
  currentPage,
}) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav>
      <ul className="flex justify-center space-x-2">
        {pageNumbers.map((number) => (
          <li key={number} className="list-none">
            <a
              onClick={() => paginate(number)}
              className={`px-4 py-2 border rounded cursor-pointer
              ${
                currentPage === number
                  ? "bg-blue-500 text-white dark:bg-blue-700 dark:text-white"
                  : "bg-white text-black dark:bg-neutral-800 dark:text-neutral-200"
              }`}
            >
              {number}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Pagination;
