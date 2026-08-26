"use client";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
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

      {/* {pageNumbers.map((num) => (
        <button
          key={num}
          onClick={() => onPageChange(num)}
          className={`px-3 py-1 cursor-pointer ${
            num === currentPage ? "bg-[#800000] text-white" : ""
          }`}
        >
          {num}
        </button>
      ))} */}

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
