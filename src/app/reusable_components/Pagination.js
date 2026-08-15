"use client";

import { useState, useEffect } from "react";





export default function Pagination({ page, lastPage, onPageChange }) {
  
  if (lastPage <= 1) return null;

  return (
    <div className="pagination">
      <button disabled={page === 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>

      <span>
        Page {page} of {lastPage}
      </span>

      <button
        disabled={page === lastPage}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
