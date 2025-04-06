"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  rowsPerPage,
  data,
}) => {
  // calculate the start and end index for the rows to be displayed
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedRows = data.slice(startIndex, endIndex);

  // calculate page number range
  const maxPageButtons = 10; // max 10 page numbers to show
  let startPage = Math.max(currentPage - Math.floor(maxPageButtons / 2), 1);
  let endPage = startPage + maxPageButtons - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(endPage - maxPageButtons + 1, 1);
  }

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div>
      {/* Pagination Controls */}
      <div className="flex justify-end mt-4 space-x-2">
        {/* Previous Button */}
        <button
          className={`p-2 text-white-200 relative group ${
            currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeftIcon className="h-5 w-5" />
          <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Previous
          </span>
        </button>

        {/* Page Numbers */}
        {pageNumbers.map((pageNumber) => (
          <button
            key={pageNumber}
            className={`px-4 py-2 rounded-full text-sm font-bold ${
              currentPage === pageNumber
                ? "bg-purple-500 text-white"
                : "text-gray-800"
            }`}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}

        {/* Next Button */}
        <button
          className={`p-2 text-white-200 relative group ${
            currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRightIcon className="h-5 w-5" />
          <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Next
          </span>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
