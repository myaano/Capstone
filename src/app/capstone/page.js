"use client";

import { useEffect, useState} from "react";

import Header from "../reusable_components/Header";
import Filter from "../reusable_components/Filter";
import Footer from "../reusable_components/Footer";

//next import
import Link from "next/link";
// next import









export default function Capstone() {
  return (
    <>
      <Header></Header>
      <div className="bg-white min-h-screen px-5 lg:px-10 pt-10 ">
        <div className="  flex flex-col flex-1">
          <div className="bg-[#800000] font-bona_nova_sc text-4xl px-5 py-5 text-white">
            Capstone Papers
          </div>
          {/* this div will contain both the divs for filter and the papers for pagination */}
          <div className="lg:flex  flex-1 mt-5">
            <div className="lg:w-72 lg:shrink-0 lg:pr-5 flex flex-col border-r border-black">
              <Filter></Filter>
            </div>
            <div className="bg-blue-500  w-full h-full lg:flex-1 lg:pl-5 py-2 font-urbanist">
              <div className="bg-green-900 h-full flex flex-col gap-5">
                {/* use js to generate these divs and the contents for each paper link that leads to the dynamic /thesis page */}
                <div className="bg-pink-500 min-h-40 flex flex-col justify-between">
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
