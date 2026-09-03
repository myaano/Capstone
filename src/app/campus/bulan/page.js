"use client";
//compnents
import Header from "../../reusable_components/Header";
import Filter from "../../reusable_components/Filter";
import Pagination from "../../reusable_components/Pagination";
//components

// react import
import { useEffect, useState, useCallback } from "react";
// reacrt import

//nenxt import
import Link from "next/link";
//next import
export default function Bulan() {
  //pagination use states

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  //filter use states
  const [filters, setFilters] = useState({
    campus: [],
    department: [],
    course: [],
    year: [],
  });

  // papers use state
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);

  //filter change

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  //fetch

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
          `http://192.168.1.34:8000/api/papers/campus/bulan?${params.toString()}`,
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
        <div className="flex flex-col flex-1 bg-green-500">
          <div className="bg-[#800000] font-bona_nova_sc text-4xl px-5 py-5 text-white">
            Bulan
          </div>
          {/* this div will contain both the divs for filter and the papers for pagination */}
          <div className="lg:flex  flex-1 mt-5">
            <div className="lg:w-72 lg:shrink-0 lg:pr-5 flex flex-col border-r border-black">
              <Filter onFilterChange={handleFilterChange}></Filter>
            </div>
            <div className="flex flex-col flex-1">
              {papers.map((paper) => (
                <div
                  key={paper.id}
                  className="bg-blue-500 lg:flex-1 w-full h-full lg:pl-5  py-2 font-urbanist"
                >
                  <div className="bg-green-900 h-full flex flex-col gap-5">
                    {/* use js to generate these divs and the contents for each paper link that leads to the dynamic /thesis page */}
                    <div className="bg-pink-500 min-h-40 flex flex-col justify-between">
                      <div>
                        <Link href={`/thesis/${paper.id}`}>
                          <p className="font-bold text-lg bg-amber-950">
                            {/* Level of Technology implementation in the classroom as
                          a predictor of students' achievment in English, Math
                          and Science */}
                            {paper.title}
                          </p>
                        </Link>
                        <p className="italic font-light bg-green-400">
                          {/* Ronald U. Mendoza, Jurel K. Yap, Gabrielle Ann S.
                        Mendoza, Leonardo M. Jaminola III, and Erica Celine Yu */}
                          {paper.researchers}
                        </p>
                      </div>
                      <div>
                        <div className="flex justify-between bg-gray-500">
                          <div className="flex gap-2">
                            <h1>Department :</h1>
                            <h1>{paper.department}</h1>
                          </div>
                          <h1>{paper.campus}</h1>
                        </div>

                        <div className="flex justify-between bg-blue-900">
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
                </div>
              ))}
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
