"use client";

// component import
import Header from "../reusable_components/Header";
import Filter from "../reusable_components/Filter";
import Pagination from "../reusable_components/Pagination";
// component import

import { useEffect, useState, useCallback } from "react";

//next import
import Link from "next/link";

// next import

export default function Thesis() {
  // pagination useStates

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // stores the filter data from filter.js to this filters state

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
          `https://application-production-cfb3.up.railway.app/api/papers/thesis?${params.toString()}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Request failed: ${response.status} - ${errorBody}`);
        }

        const data = await response.json();
        console.log(data);
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

  return (
    <>
      <Header></Header>
      <div className="bg-white min-h-screen px-5 lg:px-10 pt-10 ">
        <div className="flex flex-col flex-1 ">
          <div className="bg-[#800000] font-bona_nova_sc text-4xl px-5 py-5 text-white">
            Thesis Papers
          </div>
          {/* this div will contain both the divs for filter and the papers for pagination */}
          <div className="lg:flex  flex-1 mt-5">
            <div className="lg:w-72 lg:shrink-0 lg:pr-5 flex flex-col border-r border-black">
              <Filter onFilterChange={handleFilterChange}></Filter>
            </div>
            <div className="flex flex-col flex-1 gap-5 ml-5">
              {loading ? (
                <div className="flex-1 flex items-center  justify-center py-10 font-urbanist text-xl">
                  <p className="text-black">Loading Papers...</p>
                </div>
              ) : papers.length === 0 ? (
                <div className="flex-1 flex items-center justify-center py-10 font-urbanist text-xl">
                  <p className="text-black">No papers found.</p>
                </div>
              ) : (
                papers.map((paper) => (
                  <div
                    key={paper.id}
                    className="font-urbanist border-b border-[#adb5bd] pb-4"
                  >
                    {/* use js to generate these divs and the contents for each paper link that leads to the dynamic /thesis page */}
                    <div className=" min-h-40 flex flex-col justify-between">
                      <div className="text-black">
                        <Link href={`/thesis/${paper.id}`}>
                          <p className="font-semibold text-xl underline decoration-1 underline-offset-3 line-clamp-2">
                            {/* Level of Technology implementation in the classroom as
                            a predictor of students' achievment in English, Math
                            and Science */}
                            {paper.title}
                          </p>
                        </Link>
                        <p className="italic font-light ">
                          {/* Ronald U. Mendoza, Jurel K. Yap, Gabrielle Ann S.
                          Mendoza, Leonardo M. Jaminola III, and Erica Celine Yu */}
                          {paper.researchers}
                        </p>
                      </div>
                      <div className="text-black">
                        <div className="flex justify-between text-black">
                          <div className="flex gap-2">
                            <h1>Department :</h1>
                            <h1>{paper.department}</h1>
                          </div>
                          <h1>{paper.campus}</h1>
                        </div>
                        <div className="flex justify-between ">
                          <div>
                            <div className="flex gap-2">
                              <h1>Program/Course :</h1>
                              <h1>{paper.course}</h1>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <div className="flex gap-2">
                              <h1>Year :</h1>
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
          <div className="flex  justify-end items-end text-black my-5 border-t border-black pt-5">
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
