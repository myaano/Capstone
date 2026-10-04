"use client";

import dynamic from "next/dynamic";

const PdfViewerClient = dynamic(() => import("./PdfViewerClient"), {
  ssr: false,
});

export default function PdfViewer({ fileUrl }) {
  return <PdfViewerClient fileUrl={fileUrl} />;
}
