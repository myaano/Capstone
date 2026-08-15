"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";





import Pagination from "../reusable_components/Pagination";
import Header from "../reusable_components/Header";

function SearchContent() {
    const searchParams = useSearchParams();
    const q = searchParams.get("q") || "";
    const page = Number(searchParams.get("page")) || 1;

    const [papers, setPapers] = useState([]);
    const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  



  const router = useRouter();
  const pathname = usePathname();


  const handlChange = (newPage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage);
    router.push(`${pathname}?${params.toString()}`);
  }










    useEffect(() => {
      if (!q) return;
      setLoading(true);
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/papers/search?q=${encodeURIComponent(q)}&page=${page}`,
      )
        .then((res) => res.json())
        .then((data) => {
          setPapers(data.papers); // matched papers from your Laravel search endpoint
          setPagination(data.pagination);
          setLoading(false);
        });
    }, [q, page]);

    if (loading) return <div>Loading...</div>;

  return (
    <>

      <div className=" bg-red-400 flex-1 mt-5 px-5">
        <div className="bg-blue-500 lg:flex-1 w-full h-full py-2 font-urbanist">
          <div className="bg-green-900 h-full flex flex-col gap-5">
            {loading && <p>Loading...</p>}
            {!loading && papers.length === 0 && <p>No results found.</p>}

            {!loading &&
              papers.map((paper) => (
                <div
                  key={paper.id}
                  className="bg-pink-500 h-40 flex flex-col justify-between"
                >
                  <div className="flex gap-2">
                    <div className="font-cormorant_infant text-xl text-black">Searched for :</div>
                    <h1 className="text-black font-urbanist ">Placeholder</h1>
                  </div>
                  <div>
                    <p className="font-bold text-lg bg-amber-950">
                      Level of Technology implementation in the classroom as a
                      predictor of students' achievment in English, Math and
                      Science
                      {/* {paper.title} */}
                    </p>
                    <p className="italic font-light bg-green-400">
                      Ronald U. Mendoza, Jurel K. Yap, Gabrielle Ann S. Mendoza,
                      Leonardo M. Jaminola III, and Erica Celine Yu
                      {/* {paper.researchers} */}
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between bg-gray-500">
                      <div className="flex gap-2">
                        <h1>Department :</h1>
                        <h1>CICT {/* {paper.department} */}</h1>
                      </div>
                      <h1>Bulan {/* {paper.campus} */}</h1>
                    </div>

                    <div className="flex justify-between bg-blue-900">
                      <div>
                        <div className="flex gap-2">
                          <h1>Program/Course :</h1>
                          <h1>
                            Bachelor of Science in Computer Science{" "}
                            {/* {paper.course} */}
                          </h1>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div className="flex gap-2">
                          <h1>Year :</h1>
                          <h1>2021 {/* {paper.year} */}</h1>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            

            {/* pagination */}
            {!loading && pagination && (
              <Pagination
                page={page}
                lastPage={pagination.last_page}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}




/// change the hardcoded ui above to render papers not just by a single paper^^^^^
/// the ui above only returns single paper block so you need to make a map? to render all papers that is being retrieved




/// next step is make a pagination













export default function Search() {
  return (
    <>
      <Header></Header>
      <div className="bg-amber-900 h-300 px-5 lg:px-10 pt-10 ">
        <div className="bg-pink-400 h-[90%] flex flex-col ">
          <div className="bg-[#800000] font-bona_nova_sc text-4xl px-5 py-5 ">
            Searched For :
          </div>
          <Suspense fallback={<div>Loading ...</div>}>
            <SearchContent />
          </Suspense>
        </div>
      </div>
    </>
  );
}
