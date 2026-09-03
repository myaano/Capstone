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
    const siblingCount = 1; // pages shown on each side of current
    const totalNumbers = siblingCount * 2 + 5; // first, last, current, 2 ellipses

    if (totalPages <= totalNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSibling = Math.max(currentPage - siblingCount, 1);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages);

    const showLeftDots = leftSibling > 2;
    const showRightDots = rightSibling < totalPages - 1;

    const pages = [1];

    if (showLeftDots) pages.push("...");

    for (let i = leftSibling; i <= rightSibling; i++) {
      if (i !== 1 && i !== totalPages) pages.push(i);
    }

    if (showRightDots) pages.push("...");

    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="pagination flex gap-2 justify-center items-center font-urbanist">
      <button
        className="border rounded px-3 cursor-pointer"
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
            className={`px-3 py-1 cursor-pointer ${
              num === currentPage ? "bg-[#800000] text-white" : ""
            }`}
          >
            {num}
          </button>
        ),
      )}

      <button
        className="border rounded px-3 cursor-pointer"
        onClick={handleNext}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
}
