"use client";

import { useRouter } from "next/navigation";
import { useSearchStore } from "../store/useSearchStore";

export default function Search() {
  const query = useSearchStore((state) => state.query);
  const setQuery = useSearchStore((state) => state.setQuery);
  const router = useRouter();

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = query.trim();
    // an empty query still navigates, just with no `q` - the backend's
    // filled('search') check already treats a missing/empty term as
    // "no filter", so this returns every paper instead of nothing
    router.push(
      trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search",
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 text-black">
      <h1 className="font-cormorant_infant text-2xl lg:text-5xl">
        Search in Repository :
      </h1>
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="font-urbanist h-15 w-full rounded border border-black bg-white px-3"
        placeholder="Search in Repository e.g. (Title, Author, Keyword)"
      />
    </form>
  );
}
