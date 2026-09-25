"use client";

// component import
import Header from "../reusable_components/Header";
import Filter from "../reusable_components/Filter";
import Pagination from "../reusable_components/Pagination";
import Search from "../reusable_components/Search";
// component import

import { useEffect, useState, useCallback } from "react";

//next import
import Link from "next/link";

// next import

// campus/college/program/category on a paper are nested { id, name } objects
// — render the name instead of handing React the raw object.
function fieldLabel(value) {
  if (value && typeof value === "object") return value.name ?? "";
  return value ?? "";
}

export default function Thesis() {
  // pagination useStates

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // stores the filter data from filter.js to this filters state

  // that filters is now the basis for the useEffect get requests to laravel that fetches data if the user clicks on a checkbox on filter.js and updates the paper in real time
  const [filters, setFilters] = useState({
    campus_id: [],
    college_id: [],
    program_id: [],
    category_id: [],
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
      console.log("effect ran", filters, page);
      setLoading(true);
      try {
        const params = new URLSearchParams();
        filters.campus_id.forEach((v) => params.append("campus_id", v));
        filters.college_id.forEach((v) => params.append("college_id", v));
        filters.program_id.forEach((v) => params.append("program_id", v));
        filters.category_id.forEach((v) => params.append("category_id", v));
        filters.year.forEach((v) => params.append("year", v));
        params.append("page", page);
        params.append("paper_type", "thesis");

        const response = await fetch(
          `https://application-production-cfb3.up.railway.app/api/papers?${params.toString()}`,
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

  return (
    <>
      <Header></Header>
      <div className="font-urbanist flex w-full justify-between bg-white px-5 pt-10 text-black lg:px-10">
        <div className="w-1/2">
          <Search />
        </div>
        <Link href="../capstone" className="flex items-center justify-center">
          <button className="flex cursor-pointer gap-2 border border-[#800000] bg-white p-2 text-[#800000] transition-colors duration-200 hover:bg-[#800000] hover:text-white">
            <h1 className="text-xl">Capstone</h1> -&gt;
          </button>
        </Link>
      </div>
      <div className="min-h-screen bg-white px-5 pt-5 lg:px-10">
        <div className="flex flex-1 flex-col">
          <div className="font-bona_nova_sc bg-[#800000] px-5 py-5 text-4xl text-white">
            Theses Papers
          </div>
          {/* this div will contain both the divs for filter and the papers for pagination */}
          <div className="mt-5 flex-1 lg:flex">
            <div className="flex flex-col border-black lg:w-72 lg:shrink-0 lg:border-r lg:pr-5">
              <Filter onFilterChange={handleFilterChange}></Filter>
            </div>
            <div className="flex flex-1 flex-col gap-5 lg:ml-5">
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
                    className="font-urbanist border-b border-[#86c9ff] bg-[#ffffffef] px-3 py-2 shadow shadow-black/10"
                  >
                    {/* use js to generate these divs and the contents for each paper link that leads to the dynamic /thesis page */}
                    <div className="flex min-h-40 flex-col justify-between">
                      <div className="text-black">
                        <Link href={`/theses/${paper.id}`}>
                          <p className="line-clamp-2 text-xl underline decoration-1 underline-offset-3 lg:text-2xl">
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
                      <div className="text-black">
                        <div className="flex justify-between text-black">
                          <div className="flex gap-2">
                            <h1>Department :</h1>
                            <h1>{fieldLabel(paper.college)}</h1>
                          </div>
                          <h1>{fieldLabel(paper.campus)}</h1>
                        </div>
                        <div className="flex justify-between">
                          <div className="">
                            <div className="flex gap-2">
                              <h1>{fieldLabel(paper.program)}</h1>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <div className="flex gap-2">
                              <h1>{fieldLabel(paper.category)}</h1>
                              <h1>{fieldLabel(paper.year)}</h1>
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
