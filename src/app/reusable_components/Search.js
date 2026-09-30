"use client";

import { useRouter } from "next/navigation";
import { useSearchStore } from "../store/useSearchStore";

export default function Search({ onSearch }) {
  const query = useSearchStore((state) => state.query);
  const setQuery = useSearchStore((state) => state.setQuery);
  const router = useRouter();

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = query.trim();

    // dashboard (or anywhere else that wants search to happen in place
    // instead of navigating away) passes onSearch - when it's there, run
    // that instead of routing to /search
    if (onSearch) {
      onSearch(trimmed);
      return;
    }

    // an empty query still navigates, just with no `q` - the backend's
    // filled('search') check already treats a missing/empty term as
    // "no filter" - this returns every paper instead of nothing
    router.push(
      trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search",
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 text-black">
      <h1 className="font-cormorant_infant text-2xl lg:text-5xl">Search :</h1>
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="font-urbanist h-10 w-full rounded border border-black bg-white px-3"
        placeholder="Search in Repository"
      />
    </form>
  );
}
