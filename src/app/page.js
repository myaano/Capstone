"use client";

// nextjs imports

import Image from "next/image";
import Link from "next/link";
// nextjs imports

// MAKE A CHECKLIST OF WHAT TO DO ON EACH DAY OF DEVELOPMENT SO THERES NO BURNOUT
//6.17 >> Body(foundations)

// react imports
import { useEffect, useRef, useState, useLayoutEffect } from "react";
// react imports

// lenis
import { ReactLenis } from "lenis/react";
// lenis

// gsap imports

// gsap imports
export default function Home() {
  const lenisRef = useRef(null);
  useEffect(() => {
    let rafId;

    const loop = (time) => {
      lenisRef.current?.lenis?.raf(time);
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <ReactLenis
        root
        options={{ autoRaf: false, duration: 3 }}
        smoothWheel={true}
        ref={lenisRef}
      >
        {/* body */}
        <div className=" bg-white ">
          {/* header */}
          <div className="bg-transparent flex justify-end items-center sticky top-0 ">
            {/*modal buttons*/}
            <div className="bg-[#071437] flex justify-center items-center w-[45%] lg:w-[25%] p-3 text-white font-urbanist font-extralight">
              {/*button container */}
              <button className=" pr-2 flex justify-center items-center gap-2">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 26 26"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.7879 20.2424C16.0095 20.2424 20.2424 16.0095 20.2424 10.7879C20.2424 5.56626 16.0095 1.33331 10.7879 1.33331C5.56626 1.33331 1.33331 5.56626 1.33331 10.7879C1.33331 16.0095 5.56626 20.2424 10.7879 20.2424Z"
                    stroke="white"
                    strokeWidth="2.66667"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M24.0917 25.1204C24.3758 25.4043 24.8363 25.4043 25.1204 25.1204C25.4043 24.8363 25.4043 24.3758 25.1204 24.0917L24.0917 25.1204ZM25.1204 24.0917L17.8476 16.819L16.819 17.8476L24.0917 25.1204L25.1204 24.0917Z"
                    fill="white"
                  />
                </svg>
                Search
              </button>
              <button className=" border-l border-white px-2">Login</button>
              {/*button container */}
            </div>
            {/*modal buttons*/}
          </div>
          {/* header */}

          {/* title*/}
          <div
            className={` font-bona_nova_sc bg-[#800000] text-white w-[55%] pl-5 lg:pl-10 py-2 lg:py-4 sticky top-0 flex items-center gap-4 lg:gap-10`}
          >
            {/* logo */}
            <div className="bg-green-200 w-13 h-13 rounded-full"></div>
            {/* logo */}
            {/* uniTitle */}

            {/* !!!!!!!!!!!!!!!!!!!!!!!!!!!! THE TITLE SHOULD BE A CLICKABLE LINK THAT RETURNS THE USER TO HOME PAGE!!!!!!!!!!!! */}
            <p className="flex flex-col sm:flex-row sm:gap-2 lg:text-4xl">
              <span>Sorsogon</span>
              <span>State</span>
              <span>University</span>
            </p>
            {/* uniTitle */}
          </div>
          {/* title */}
          {/* contents */}
          <div className="bg-green-500 flex justify-between h-300 mt-10 lg:mt-23">
            {/* about */}
            <div className="bg-red-500 flex flex-1 flex-col mr-20">
              <div className="flex flex-col bg-amber-950 ml-10 ">
                <div className="flex gap-2 bg-pink-200 border-b pb-4 border-black">
                  <p className="font-bona_nova_sc text-6xl text-[#800000]">
                    SorSu
                  </p>
                  <p className="font-urbanist text-[#242423] text-6xl">:</p>
                  <div className="leading-none font-urbanist text-[#131312] text-3xl">
                    <p>Sorsogon State University</p>
                    <p>Institutional Repository</p>
                  </div>
                </div>
                <div className="bg-emerald-500 pt-10 font-urbanist text-[#242423]">
                  <p>
                    A Web Thesis and Capstone Web Repository Developed by SorSU:
                    Bulan Campus for management, dissemenation and preservation
                    of digital materials that represent the scholarly work
                    production of Sorsogon State University and its affiliates
                    and their faculty members, staff, and students in higher
                    education.
                  </p>
                </div>
              </div>
              {/* about */}

              {/* most viewed papers title */}
              <div className="bg-[#071437] mt-10 pl-10 font-bona_nova">
                <p>Most Viwed Papers</p>
              </div>
              {/* most viewed papers title */}

              {/* in this div, all of the most viewed will be displayed and will be full of javascript to retrieve data and present it here */}
              <div className="bg-amber-200 pl-10 pt-5 ">
                <div className="flex flex-col gap-2 border-b pb-1 border-[#585757]">
                  {/* some sort of title retriever here probably like {title.retrieve} idk */}
                  <p className="text-[#242423] font-urbanist text-xl font-bold ">
                    Level of Technology implementation in the classroom as a
                    predictor of students' achievment in English, Math and
                    Science
                  </p>
                  <p className="font-urbanist text-[#585757] font-light italic text-sm">
                    Ronald U. Mendoza, Jurel K. Yap, Gabrielle Ann S. Mendoza,
                    Leonardo M. Jaminola III, and Erica Celine Yu
                  </p>
                  <div className="font-urbanist flex justify-between text-[#242423] pr-2 text-sm">
                    <p>Bachelor of Science in Computer Science</p>
                    <p>2021</p>
                  </div>
                </div>
              </div>
              {/* in this div, all of the most viewed will be displayed and will be full of javascript to retrieve data and present it here */}
            </div>
            <div className="bg-pink-500 w-[45%]">
              <p className="font-bona_nova_sc text-3xl pb-7 bg-white text-[#242423]">
                Research Papers
              </p>
              <div className="bg-[#800000]">w</div>
            </div>
            {/* papers page and campus container */}
          </div>
          {/* contents */}

          <div className="h-screen  bg-blue-500"></div>
          <div className="h-screen  bg-pink-500"></div>
          <div className="h-screen  bg-red-500"></div>
          <div className="h-screen  bg-green-500"></div>
          <div className="w-[50%] bg-amber-900 text-[#242423]">wdwd</div>
        </div>
        {/* body */}
      </ReactLenis>
    </>
  );
}
