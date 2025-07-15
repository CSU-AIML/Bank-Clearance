// src/components/sebi/SebiPagination.jsx

import React, { memo, useCallback } from 'react';
import { getPageNumbers } from './utils/sebiHelpers';
import { PAGINATION_CONFIG } from './utils/sebiConstants';

/**
 * Pagination Component
 * Handles page navigation and selection controls
 */
const SebiPagination = memo(({ 
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = PAGINATION_CONFIG.ITEMS_PER_PAGE,
  selectedCount,
  currentPageItems,
  onPageChange,
  onSelectAllVisible,
  onClearAllSelections
}) => {
  
  const handlePageChange = useCallback((page) => {
    if (typeof page === 'number' && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  }, [totalPages, onPageChange]);

  const handlePreviousClick = useCallback(() => {
    handlePageChange(currentPage - 1);
  }, [currentPage, handlePageChange]);

  const handleNextClick = useCallback(() => {
    handlePageChange(currentPage + 1);
  }, [currentPage, handlePageChange]);

  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(currentPage, totalPages, PAGINATION_CONFIG.MAX_VISIBLE_PAGES);
  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between mt-8 mb-6">
      {/* Results Info */}
      <div className="text-sm text-gray-600">
        Showing {startItem} to {endItem} of {totalItems} results
        {selectedCount > 0 && (
          <span className="ml-2 text-purple-600 font-medium">
            • {selectedCount} selected
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {/* Selection Controls */}
        {currentPageItems.length > 0 && (
          <div className="flex items-center gap-2 mr-4">
            <button
              type="button"
              onClick={onSelectAllVisible}
              className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
            >
              Select All Visible
            </button>
            {selectedCount > 0 && (
              <button
                type="button"
                onClick={onClearAllSelections}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        )}

        {/* Previous Button */}
        <button
          type="button"
          onClick={handlePreviousClick}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        
        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handlePageChange(page)}
              disabled={page === '...'}
              className={`px-3 py-2 rounded-lg transition-colors ${
                page === currentPage
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : page === '...'
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        
        {/* Next Button */}
        <button
          type="button"
          onClick={handleNextClick}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
});

SebiPagination.displayName = 'SebiPagination';

export default SebiPagination;