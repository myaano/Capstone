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
      <div className="min-h-screen bg-white px-5 pt-10 lg:px-10">
        <div className="flex flex-1 flex-col bg-green-500">
          <div className="font-bona_nova_sc bg-[#800000] px-5 py-5 text-4xl text-white">
            Bulan
          </div>
          {/* this div will contain both the divs for filter and the papers for pagination */}
          <div className="mt-5 flex-1 lg:flex">
            <div className="flex flex-col border-r border-black lg:w-72 lg:shrink-0 lg:pr-5">
              <Filter onFilterChange={handleFilterChange}></Filter>
            </div>
            <div className="flex flex-1 flex-col">
              {papers.map((paper) => (
                <div
                  key={paper.id}
                  className="font-urbanist h-full w-full bg-blue-500 py-2 lg:flex-1 lg:pl-5"
                >
                  <div className="flex h-full flex-col gap-5 bg-green-900">
                    {/* use js to generate these divs and the contents for each paper link that leads to the dynamic /thesis page */}
                    <div className="flex min-h-40 flex-col justify-between bg-pink-500">
                      <div>
                        <Link href={`/thesis/${paper.id}`}>
                          <p className="bg-amber-950 text-lg font-bold">
                            {/* Level of Technology implementation in the classroom as
                          a predictor of students' achievment in English, Math
                          and Science */}
                            {paper.title}
                          </p>
                        </Link>
                        <p className="bg-green-400 font-light italic">
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
