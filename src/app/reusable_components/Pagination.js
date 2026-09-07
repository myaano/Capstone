"use client";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const getPageNumbers = () => {
    const windowSize = 5;

    if (totalPages <= windowSize) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(windowSize / 2);
    let start = currentPage - half;
    let end = currentPage + half;

    if (start < 1) {
      end += 1 - start;
      start = 1;
    }

    if (end > totalPages) {
      start -= end - totalPages;
      end = totalPages;
    }

    start = Math.max(start, 1);

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className="pagination font-urbanist flex items-center justify-center gap-2">
      <button
        className="cursor-pointer rounded border px-3"
        onClick={handlePrev}
        disabled={currentPage === 1}
      >
        Prev
      </button>

      {getPageNumbers().map((num, idx) =>
        num === "..." ? (
          <span key={`dots-${idx}`} className="px-2">
            ...
          </span>
        ) : (
          <button
            key={num}
            onClick={() => onPageChange(num)}
            className={`cursor-pointer px-3 py-1 ${
              num === currentPage ? "rounded-lg bg-[#800000] text-white" : ""
            }`}
          >
            {num}
          </button>
        ),
      )}

      <button
        className="cursor-pointer rounded border px-3"
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
}
