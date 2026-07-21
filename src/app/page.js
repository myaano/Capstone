"use client";

// nextjs imports

import Image from "next/image";
import Link from "next/link";
// nextjs imports

// MAKE A CHECKLIST OF WHAT TO DO ON EACH DAY OF DEVELOPMENT SO THERES NO BURNOUT

// react imports
import { useEffect, useRef, useState, useLayoutEffect } from "react";
// react imports

// lenis
import { ReactLenis } from "lenis/react";
// lenis

// gsap imports
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
// gsap imports
export default function Home() {
  //lenis function
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
  //lenis function

  //useGsap

  useGSAP(() => {
    gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  }, []);
  //use Gsap

  //counter animation for both types of research papers and for the total amount of papers on each campuses
  {
    /* RESEARCH TIMER VARS */
  }
  const thesisTimer = useRef(null);
  const capstoneTimer = useRef(null);
  const bulanTimer = useRef(null);
  const castillaTimer = useRef(null);
  const magallanesTimer = useRef(null);
  const sorsogonTimer = useRef(null);
  //change the counterValue to the current value of the current available papers in the datbase
  const thesisCounterValue = useRef({ value: 0 });
  const capstoneCounterValue = useRef({ value: 0 });
  const bulanCounterValue = useRef({ value: 0 });
  const castillaCounterValue = useRef({ value: 0 });
  const magallanesCounterValue = useRef({ value: 0 });
  const sorsogonCounterValue = useRef({ value: 0 });
  //change the thesisCounterValue to the current value of the current available papers in the datbase
  //counter animation for both types of research papers and for the total amount of papers on each campuses
  {
    /* RESEARCH TIMER VARS */
  }
  //counter useEffect
  useEffect(() => {
    CustomEase.create("hop", "0.85, 0, 0.15, 1");

    //timeline
    // const timerTimeline = gsap.timeline({ delay: "0.5" });
    //timeline

    // try activating css hover through javascript
    // apply it to the counter animation that it only runs when hovered

    // on counterValue.current, change the value on whatever is the current amount of papers available to a campus or research paper so that itll count from 0 to current amount
    gsap.to(
      thesisCounterValue.current,
      {
        value: 61,
        duration: 3,
        ease: "power2.out",
        onUpdate: () => {
          if (thesisTimer.current) {
            thesisTimer.current.textContent = Math.floor(
              thesisCounterValue.current.value,
            );
          }
        },
      },
      [],
    );
    // on counterValue.current, change the value on whatever is the current amount of papers available to a campus or research paper so that itll count from 0 to current amount
    gsap.to(capstoneCounterValue.current, {
      value: 120,
      duration: 3,
      ease: "power2.out",
      onUpdate: () => {
        if (capstoneTimer.current) {
          capstoneTimer.current.textContent = Math.floor(
            capstoneCounterValue.current.value,
          );
        }
      },
    });
    // campus counter animations
    gsap.to(
      bulanCounterValue.current,
      {
        value: 181,
        duration: 3,
        ease: "power2.out",
        onUpdate: () => {
          if (bulanTimer.current) {
            bulanTimer.current.textContent = Math.floor(
              bulanCounterValue.current.value,
            );
          }
        },
      },
      [],
    );
    gsap.to(
      castillaCounterValue.current,
      {
        value: 50,
        duration: 3,
        ease: "power2.out",
        onUpdate: () => {
          if (castillaTimer.current) {
            castillaTimer.current.textContent = Math.floor(
              castillaCounterValue.current.value,
            );
          }
        },
      },
      [],
    );
    gsap.to(
      magallanesCounterValue.current,
      {
        value: 30,
        duration: 3,
        ease: "power2.out",
        onUpdate: () => {
          if (magallanesTimer.current) {
            magallanesTimer.current.textContent = Math.floor(
              magallanesCounterValue.current.value,
            );
          }
        },
      },
      [],
    );
    gsap.to(
      sorsogonCounterValue.current,
      {
        value: 500,
        duration: 3,
        ease: "power2.out",
        onUpdate: () => {
          if (sorsogonTimer.current) {
            sorsogonTimer.current.textContent = Math.floor(
              sorsogonCounterValue.current.value,
            );
          }
        },
      },
      [],
    );
    // campus counter animations
  }, []);
  //counter useEffect
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
          <div className="bg-green-500 lg:flex lg:justify-between mt-10 lg:mt-12 sm:mx-0">
            {/* about */}
            <div className="bg-red-500 flex flex-1 flex-col  lg:mr-20">
              <div className="flex flex-col bg-amber-950 mx-5 sm:mx-0 lg:ml-10 ">
                <div className="flex gap-2 bg-pink-200 border-b pb-3 lg:pb-4 border-black justify-start lg:justify-center items-center">
                  <p className="font-bona_nova_sc text-[34px] lg:text-6xl text-[#800000] leading-none">
                    SorSu
                  </p>
                  <p className="font-urbanist text-[#242423] text-[30px] lg:text-6x leading-none">
                    :
                  </p>
                  <div className="leading-none font-urbanist text-[#131312] text-[20px] lg:text-3xl">
                    <p>Sorsogon State University</p>
                    <p>Institutional Repository</p>
                  </div>
                </div>
                <div className="bg-emerald-500 pt-5 lg:pt-10 font-urbanist text-[#242423] ">
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
              <div className="bg-[#071437] mr-5 sm:mr-0 mt-10 pl-5 lg:pl-10 text-2xl py-3  underline font-bona_nova text-white">
                <p>Most Viwed Papers</p>
              </div>
              {/* most viewed papers title */}

              {/* in this div, all of the most viewed will be displayed and will be full of javascript to retrieve data and present it here */}
              <div className="bg-amber-200 mx-5 sm:mx-0 lg:pl-10 pt-5 ">
                <div className="flex flex-col gap-2 border-b pb-2 border-[#585757]">
                  {/* some sort of title retriever here probably like {title.retrieve} idk */}
                  <p className="text-[#242423] font-urbanist text-[16px] font-semibold ">
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

            {/* Research Papers Analytics */}
            <div className="bg-pink-500 lg:w-[45%] text-white">
              <p className="font-bona_nova_sc text-[24px] lg:text-3xl pl-5 pt-4 sm:pt-0 sm:pl-0 pb-7 bg-white text-[#242423] ">
                Research Papers
              </p>
              <div className="bg-[#800000] h-100 ml-5 sm:ml-0 px-10 py-15 flex gap-15 flex-col justify-center items-center">
                <div className="  flex flex-col justify-center w-full">
                  <p className=" border-b border-white text-5xl font-bona_nova_sc pb-2 flex justify-between items-center">
                    {/* this stupid number should have a counting animation from 0 to current number of papers */}
                    <span ref={thesisTimer}>0</span>
                    {/* this stupid number should have a counting animation from 0 to current number of papers */}
                    {/* this svg will be a <Link /> which is pressable and will send the user to the thesis section */}
                    <svg
                      width="30"
                      height="15"
                      viewBox="0 0 30 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M29.7071 8.07106C30.0976 7.68054 30.0976 7.04737 29.7071 6.65685L23.3431 0.292885C22.9526 -0.0976396 22.3195 -0.0976396 21.9289 0.292885C21.5384 0.683409 21.5384 1.31657 21.9289 1.7071L27.5858 7.36395L21.9289 13.0208C21.5384 13.4113 21.5384 14.0445 21.9289 14.435C22.3195 14.8255 22.9526 14.8255 23.3431 14.435L29.7071 8.07106ZM0 7.36395L0 8.36395H29V7.36395V6.36395H0L0 7.36395Z"
                        fill="white"
                      />
                    </svg>
                    {/* this svg will be a <Link /> which is pressable and will send the user to the thesis section */}
                  </p>
                  <p className="font-bona_nova_sc text-2xl pt-2 leading-none">
                    Thesis Papers
                  </p>
                </div>
                <div className="  flex flex-col justify-center w-full">
                  <p className=" border-b border-white text-5xl font-bona_nova_sc pb-2 flex justify-between items-center">
                    <span ref={capstoneTimer}>0</span>
                    <svg
                      width="30"
                      height="15"
                      viewBox="0 0 30 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M29.7071 8.07106C30.0976 7.68054 30.0976 7.04737 29.7071 6.65685L23.3431 0.292885C22.9526 -0.0976396 22.3195 -0.0976396 21.9289 0.292885C21.5384 0.683409 21.5384 1.31657 21.9289 1.7071L27.5858 7.36395L21.9289 13.0208C21.5384 13.4113 21.5384 14.0445 21.9289 14.435C22.3195 14.8255 22.9526 14.8255 23.3431 14.435L29.7071 8.07106ZM0 7.36395L0 8.36395H29V7.36395V6.36395H0L0 7.36395Z"
                        fill="white"
                      />
                    </svg>
                  </p>
                  <p className="font-bona_nova_sc text-2xl pt-2 leading-none">
                    Capstone Papers
                  </p>
                </div>
              </div>
              {/* Campuses Analytics */}
              <div className="bg-purple-500 h-100 flex flex-col font-cormorant_infant text-5xl">
                <div className="bg-blue-500 flex-1 flex justify-between items-center">
                  <div className="bg-red-500 flex flex-1 justify-between">
                    <p className="cursor-pointer underline decoration-2 decoration-transparent underline-offset-[0.10em] transition-colors duration-300 hover:decoration-current ">
                      Bulan
                    </p>
                    <div className="flex justify-end items-end gap-2">
                      {/* WARNING  WARNINGWARNINGWARNINGWARNINGWARNINGWARNINGWARNINGWARNINGWARNINGWARNINGWARNING */}
                      {/* when the container div of both the campus and the total paper is hovered, the counting animation of the total papers will be triggered */}
                      <span ref={bulanTimer}>0</span>
                      {/* when the container div of both the campus and the total paper is hovered, the counting animation of the total papers will be triggered */}
                      {/* WARNING  WARNINGWARNINGWARNINGWARNINGWARNINGWARNINGWARNINGWARNINGWARNINGWARNINGWARNING */}
                      <p className="text-sm">Total Papers</p>
                    </div>
                  </div>
                </div>
                <div className="bg-black flex-1 flex justify-between items-center">
                  <p className="cursor-pointer underline decoration-2 decoration-transparent underline-offset-[0.10em] transition-colors duration-300 hover:decoration-current bg-blue-950 flex justify-between">
                    Castilla
                  </p>
                  <div className="flex justify-end items-end gap-2">
                    <span ref={castillaTimer}>20</span>
                    <p className="text-sm">Total Papers</p>
                  </div>
                </div>
                <div className="bg-red-200 flex-1 flex justify-between items-center">
                  <p className="cursor-pointer underline decoration-2 decoration-transparent underline-offset-[0.10em] transition-colors duration-300 hover:decoration-current">
                    Magallanes
                  </p>
                  <div className="flex justify-end items-end gap-2">
                    <span ref={magallanesTimer}>20</span>
                    <p className="text-sm">Total Papers</p>
                  </div>
                </div>
                <div className="bg-orange-400 flex-1 flex justify-between items-center">
                  <p className="cursor-pointer underline decoration-2 decoration-transparent underline-offset-[0.10em] transition-colors duration-300 hover:decoration-current ">
                    Sorsogon
                  </p>
                  <div className="flex justify-end items-end gap-2">
                    <span ref={sorsogonTimer}>20</span>
                    <p className="text-sm">Total Papers</p>
                  </div>
                </div>
              </div>
              {/* Campuses Analytics */}
            </div>
            {/* Research Papers Analytics */}
          </div>
          {/* contents */}

          <div className="h-screen  bg-blue-500"></div>
          <div className="h-screen  bg-pink-500"></div>
          <div className="h-screen  bg-red-500"></div>
          <div className="h-screen  bg-green-500">
            <p className=" font-cormorant_infant text-5xl underline decoration-transparent underline-offset-[0.15em] transition-colors duration-300 hover:decoration-current ">
              Sorsogon
            </p>
          </div>
          <div className="w-[50%] bg-amber-900 text-[#242423]">wdwd</div>
        </div>
        {/* body */}
      </ReactLenis>
    </>
  );
}
