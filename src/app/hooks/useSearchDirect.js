"use client";
import { useRouter } from "next/router";

export function useSearchDirect() {
  const router = useRouter();
  function handleSearch(keyword) {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }
  return {handleSearch}
}
