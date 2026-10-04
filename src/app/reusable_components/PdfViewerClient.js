"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export default function PdfViewerClient({ fileUrl }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [width, setWidth] = useState(600);
  const scrollRef = useRef(null);
  // where the window was scrolled when the user clicked Prev/Next
  const savedScrollY = useRef(null);

  // make the page fit the scroll box (works on mobile too)
  useEffect(() => {
    function updateWidth() {
      if (scrollRef.current) setWidth(scrollRef.current.clientWidth);
    }
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  function restoreScroll() {
    if (savedScrollY.current !== null) {
      window.scrollTo(0, savedScrollY.current);
    }
  }

  // put the window back right after the page number changes
  useLayoutEffect(() => {
    restoreScroll();
  }, [pageNumber]);

  function goToPage(newPage) {
    savedScrollY.current = window.scrollY;
    setPageNumber(newPage);
    // start the new page at the top of the viewer box
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }

  return (
    <div className="w-full" style={{ overflowAnchor: "none" }}>
      {/* fixed height: only this box scrolls */}
      <div
        ref={scrollRef}
        className="h-[80vh] overflow-x-hidden overflow-y-auto border border-gray-300"
        style={{ scrollbarGutter: "stable" }}
      >
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={<p className="p-4">Loading PDF...</p>}
          error={<p className="p-4">Failed to load PDF.</p>}
        >
          <Page
            pageNumber={pageNumber}
            width={width}
            // slow first loads finish later, so restore again when the page is drawn
            onRenderSuccess={restoreScroll}
          />
        </Document>
      </div>

      {numPages && (
        <div className="font-urbanist mt-4 flex items-center gap-4 text-[#800000]">
          <button
            onClick={() => goToPage(pageNumber - 1)}
            disabled={pageNumber <= 1}
            className="border border-[#800000] px-3 py-1 disabled:opacity-40"
          >
            Prev
          </button>
          <span>
            Page {pageNumber} of {numPages}
          </span>
          <button
            onClick={() => goToPage(pageNumber + 1)}
            disabled={pageNumber >= numPages}
            className="border border-[#800000] px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
