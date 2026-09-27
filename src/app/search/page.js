"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";

import Filter from "../reusable_components/Filter";
import Pagination from "../reusable_components/Pagination";
import Searchbar from "../reusable_components/Search";
import Header from "../reusable_components/Header";
import { useSearchStore } from "../store/useSearchStore";

// campus/college/program/category on a paper are nested { id, name }
// objects - render the name instead of handing React the raw object.
function fieldLabel(value) {
  if (value && typeof value === "object") return value.name ?? "";
  return value ?? "";
}

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const page = Number(searchParams.get("page")) || 1;

  const router = useRouter();
  const pathname = usePathname();

  const setStoredQuery = useSearchStore((state) => state.setQuery);
  // keep the search bar's shared store in sync with the URL - covers a
  // direct link or a hard refresh landing on /search?q=... where the
  // store would otherwise still be empty
  useEffect(() => {
    setStoredQuery(q);
  }, [q, setStoredQuery]);

  const [papers, setPapers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // filters stay as local state (not written to the URL) - same pattern
  // as /thesis's Filter usage; only `q` and `page` live in the URL here
  const [filters, setFilters] = useState({
    campus_id: [],
    college_id: [],
    program_id: [],
    category_id: [],
    year: [],
  });

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handlePageChange = useCallback(
    (newPage) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage);
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname],
  );

  useEffect(() => {
    const controller = new AbortController();

    async function fetchResults() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (q) params.append("search", q);
        filters.campus_id.forEach((v) => params.append("campus_id", v));
        filters.college_id.forEach((v) => params.append("college_id", v));
        filters.program_id.forEach((v) => params.append("program_id", v));
        filters.category_id.forEach((v) => params.append("category_id", v));
        filters.year.forEach((v) => params.append("year", v));
        params.append("page", page);
        // no paper_type here on purpose - search covers both thesis and
        // capstone papers at once; each result shows its own type below

        const response = await fetch(
          `https://capstone-backend-1yta.onrender.com/api/papers?${params.toString()}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const data = await response.json();
        setPapers(Array.isArray(data) ? data : (data.data ?? []));
        setPagination(data);
      } catch (error) {
        if (error.name !== "AbortError") console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
    return () => controller.abort();
  }, [q, filters, page]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="font-bona_nova_sc bg-[#800000] px-5 py-5 text-4xl text-white">
        {q ? `Searched for: ${q}` : "All Papers"}
      </div>
      <div className="mt-5 flex-1 lg:flex">
        <div className="flex flex-col border-black lg:w-72 lg:shrink-0 lg:border-r lg:pr-5">
          <Filter onFilterChange={handleFilterChange}></Filter>
        </div>
        <div className="font-urbanist flex flex-1 flex-col gap-5 lg:ml-5">
          {loading ? (
            <div className="flex flex-1 items-center justify-center py-10 text-xl">
              <p className="text-black">Searching...</p>
            </div>
          ) : papers.length === 0 ? (
            <div className="flex flex-1 items-center justify-center py-10 text-xl">
              <p className="text-black">No results found.</p>
            </div>
          ) : (
            papers.map((paper) => {
              const detailHref =
                paper.paper_type === "capstone"
                  ? `/capstone/${paper.id}`
                  : `/theses/${paper.id}`;

              return (
                <div
                  key={paper.id}
                  className="border-b border-[#86c9ff] bg-[#ffffffef] px-3 py-2 shadow shadow-black/10"
                >
                  <div className="flex min-h-40 flex-col justify-between">
                    <div className="text-black">
                      <Link href={`${detailHref}?page=${page}`}>
                        <p className="line-clamp-2 text-xl underline decoration-1 underline-offset-3 lg:text-2xl">
                          {paper.title}
                        </p>
                      </Link>
                      <p className="line-clamp-1 font-light italic">
                        {paper.researchers}
                      </p>
                    </div>
                    <div className="text-black">
                      <div className="flex justify-between">
                        <div className="flex gap-2">
                          <h1>Department :</h1>
                          <h1>{fieldLabel(paper.college)}</h1>
                        </div>
                        <h1>{fieldLabel(paper.campus)}</h1>
                      </div>
                      <div className="flex justify-between">
                        <h1>{fieldLabel(paper.program)}</h1>
                        <div className="flex gap-2">
                          <h1>{fieldLabel(paper.category)}</h1>
                          <h1>{paper.year}</h1>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {paper.paper_type
                          ? paper.paper_type.charAt(0).toUpperCase() +
                            paper.paper_type.slice(1)
                          : ""}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {!loading && pagination && pagination.last_page > 1 && (
            <div className="my-5 flex items-end justify-end border-t border-black pt-5">
              <Pagination
                currentPage={page}
                totalPages={pagination.last_page}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Search() {
  return (
    <>
      <Header></Header>
      <div className="font-urbanist flex w-full justify-between bg-white px-5 pt-10 text-black lg:px-10">
        <div className="w-1/2">
          <Searchbar />
        </div>
      </div>

      <div className="min-h-screen bg-white px-5 pt-5 lg:px-10">
        <Suspense fallback={<p className="mt-5 text-black">Loading...</p>}>
          <SearchContent />
        </Suspense>
      </div>
    </>
  );
}
