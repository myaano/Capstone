"use client";

import { useEffect, useState, useCallback } from "react";

import Header from "../reusable_components/Header";
import Filter from "../reusable_components/Filter";
import Pagination from "../reusable_components/Pagination";
//next import
import Link from "next/link";
// next import

export default function Capstone() {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // that filters is now the basis for the useEffect get requests to laravel that fetches data if the user clicks on a checkbox on filter.js and updates the paper in real time
  const [filters, setFilters] = useState({
    campus: [],
    department: [],
    course: [],
    year: [],
  });

  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  //fetch and filter
  useEffect(() => {
    const controller = new AbortController();

    const fetchPapers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        filters.campus.forEach((v) => params.append("campus", v));
        filters.department.forEach((v) => params.append("department", v));
        filters.course.forEach((v) => params.append("course", v));
        filters.year.forEach((v) => params.append("year", v));
        params.append("page", page);

        const response = await fetch(
          `https://application-production-cfb3.up.railway.app/api/papers/capstone?${params.toString()}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Request failed: ${response.status} - ${errorBody}`);
        }

        const data = await response.json();
        setPapers(Array.isArray(data) ? data : (data.data ?? []));
        setTotalPages(data.last_page ?? 1);
      } catch (error) {
        if (error.name !== "AbortError") console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
    return () => controller.abort();
  }, [filters, page]);

  // pagination useStates

  return (
    <>
      <Header></Header>
      <div className="min-h-screen bg-white px-5 pt-10 pb-5 lg:px-10">
        <div className="flex flex-1 flex-col">
          <div className="font-bona_nova_sc bg-[#800000] px-5 py-5 text-4xl text-white">
            Capstone Papers
          </div>
          {/* this div will contain both the divs for filter and the papers for pagination */}
          <div className="mt-5 flex-1 lg:flex">
            <div className="flex flex-col border-r border-black lg:w-72 lg:shrink-0 lg:pr-5">
              <Filter onFilterChange={handleFilterChange}></Filter>
            </div>
            <div className="ml-5 flex flex-1 flex-col gap-5">
              {loading ? (
                <div className="font-urbanist flex flex-1 items-center justify-center py-10 text-xl">
                  <p className="text-black">Loading Papers...</p>
                </div>
              ) : papers.length === 0 ? (
                <div className="font-urbanist flex flex-1 items-center justify-center py-10 text-xl">
                  <p className="text-black">No papers found.</p>
                </div>
              ) : (
                papers.map((paper) => (
                  <div
                    key={paper.id}
                    className="font-urbanist border-b border-[#e1e7ec] px-3 py-2 text-black shadow shadow-black/10"
                  >
                    {/* use js to generate these divs and the contents for each paper link that leads to the dynamic /thesis page */}
                    <div className="flex min-h-40 flex-col justify-between">
                      <div>
                        <Link href={`/capstone/${paper.id}`}>
                          <p className="line-clamp-2 text-xl font-semibold underline decoration-1 underline-offset-3">
                            {/* Level of Technology implementation in the classroom as
                            a predictor of students' achievment in English, Math
                            and Science */}
                            {paper.title}
                          </p>
                        </Link>
                        <p className="line-clamp-1 font-light italic">
                          {/* Ronald U. Mendoza, Jurel K. Yap, Gabrielle Ann S.
                          Mendoza, Leonardo M. Jaminola III, and Erica Celine Yu */}
                          {paper.researchers}
                        </p>
                      </div>
                      <div>
                        {/* <div className="flex ">
                          <h1>Category: </h1>
                          <h1>Category</h1>
                        </div> */}
                        <div className="flex justify-between">
                          <div className="flex gap-2">
                            <h1>Department :</h1>
                            <h1>{paper.department}</h1>
                          </div>
                          <h1>{paper.campus}</h1>
                        </div>
                        <div className="flex justify-between">
                          <div>
                            <div className="flex gap-2">
                              <h1>{paper.course}</h1>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <div className="flex gap-2">
                              <h1>{paper.year}</h1>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* this div will contain both the divs for filter and the papers for pagination */}
        </div>
        {totalPages > 1 && (
          <div className="my-5 flex items-end justify-end border-t border-black pt-5 text-black">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        )}
      </div>
    </>
  );
}
