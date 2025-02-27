'use client';

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Pagination = ({ currentPage, totalPages, onPageChange, rowsPerPage, data }) => {
  // Calculate pagination
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedRows = data.slice(startIndex, endIndex);

  return (
    <div>
      {/* Display Paginated Data */}
      <div>
        {displayedRows.map((item, index) => (
          <div key={index}>{/* Render your data here */}</div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-end mt-4 space-x-2">
        {/* Previous Button */}
        <button
          className={`p-2 text-white-200 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>

        {/* Page Numbers */}
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            className={`px-4 py-2 rounded-full text-sm font-bold ${
              currentPage === index + 1 ? 'bg-blue-500 text-white' : 'text-gray-800'
            }`}
            onClick={() => onPageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}

        {/* Next Button */}
        <button
          className={`p-2 text-white-200 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;