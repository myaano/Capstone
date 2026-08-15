"use client";

// component import
import Header from "../reusable_components/Header";
import Filter from "../reusable_components/Filter";
import Footer from "../reusable_components/Footer";
// component import

import { useEffect, useState, useCallback } from "react";

//next import
import Link from "next/link";

// next import

// in this page the retrieval of data will happen
export default function Thesis() {
 

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
        if (filters.campus.length) params.append("campus", filters.campus[0]);
        if (filters.department.length)
          params.append("department", filters.department[0]);
        if (filters.course.length) params.append("course", filters.course[0]);
        if (filters.year.length) params.append("year", filters.year[0]);

        const response = await fetch(
          `http://laravel-api-placeholderurl/api/thesis?${params.toString()}`,
          { signal: controller.signal },
        );

        const data = await response.json();
        setPapers(data);
      } catch (error) {
        if (error.name !== "Abort Error") console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
    return () => controller.abort();
  }, [filters]);

  return (
    <>
      <Header></Header>
      <div className="bg-amber-900 h-300 px-5 lg:px-10 pt-10 ">
        <div className="bg-pink-400 h-[90%] flex flex-col ">
          <div className="bg-[#800000] font-bona_nova_sc text-4xl px-5 py-5">
            Thesis Papers
          </div>
          {/* this div will contain both the divs for filter and the papers for pagination */}
          <div className="lg:flex bg-red-400 flex-1 mt-5">
            <div className="bg-green-200 lg:w-70 lg:pr-5 flex flex-col border-r border-black">
              <Filter onFilterChange={handleFilterChange}></Filter>
            </div>
            <div className="bg-blue-500 lg:flex-1 w-full h-full lg:pl-5 lg:pr-2 py-2 font-urbanist">
              <div className="bg-green-900 h-full flex flex-col gap-5">
                {/* use js to generate these divs and the contents for each paper link that leads to the dynamic /thesis page */}
                <div className="bg-pink-500 h-40 flex flex-col justify-between">
                  <div>
                    <p className="font-bold text-lg bg-amber-950">
                      Level of Technology implementation in the classroom as a
                      predictor of students' achievment in English, Math and
                      Science
                    </p>
                    <p className="italic font-light bg-green-400">
                      Ronald U. Mendoza, Jurel K. Yap, Gabrielle Ann S. Mendoza,
                      Leonardo M. Jaminola III, and Erica Celine Yu
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between bg-gray-500">
                      <div className="flex gap-2">
                        <h1>Department :</h1>
                        <h1>CICT</h1>
                      </div>
                      <h1>Bulan</h1>
                    </div>

                    <div className="flex justify-between bg-blue-900">
                      <div>
                        <div className="flex gap-2">
                          <h1>Program/Course :</h1>
                          <h1>Bachelor of Science in Computer Science</h1>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div className="flex gap-2">
                          <h1>Year :</h1>
                          <h1>2021</h1>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* this div will contain both the divs for filter and the papers for pagination */}
        </div>
      </div>

    </>
  );
}
