"use client";

//component import
import Footer from "./reusable_components/Footer";
//component immport

// nextjs imports
import Image from "next/image";
import Link from "next/link";
// nextjs imports

//image import
import SorSu from "../../public/Sorsu.png";
//image import

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
// gsap

//pie chart imports

import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer } from "recharts";

import { useAuthStore } from "./store/useAuthStore";

import ProfileModal from "./reusable_components/ProfileModal";
import Search from "./reusable_components/Search";

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

  //counter animation for both types of research papers and for the total amount of papers on each campuses
  {
    /* RESEARCH TIMER VARS */
  }
  const thesisTimer = useRef(null);
  const capstoneTimer = useRef(null);
  const bulanTimer = useRef(null);

  //change the counterValue to the current value of the current available papers in the datbase
  const thesisCounterValue = useRef({ value: 0 });
  const capstoneCounterValue = useRef({ value: 0 });
  const bulanCounterValue = useRef({ value: 0 });
  //change the thesisCounterValue to the current value of the current available papers in the datbase
  //counter animation for both types of research papers and for the total amount of papers on each campuses
  {
    /* RESEARCH TIMER VARS */
  }

  const [Analytics, setAnalytics] = useState(null);
  const [pieOuterRadius, setPieOuterRadius] = useState(100);

  useEffect(() => {
    const updatePieOuterRadius = () => {
      setPieOuterRadius(window.innerWidth >= 1024 ? 200 : 100);
    };

    updatePieOuterRadius();
    window.addEventListener("resize", updatePieOuterRadius);

    return () => window.removeEventListener("resize", updatePieOuterRadius);
  }, []);

  // fetch paper analytics
  useEffect(() => {
    async function loadAnalyticsData() {
      try {
        const response = await fetch(
          "https://application-production-cfb3.up.railway.app/api/analytics",
        );
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        const data = await response.json();
        setAnalytics(data);
        console.log(data);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    }
    loadAnalyticsData();
  }, []);

  //useGsap

  useGSAP(() => {
    if (!Analytics) return;
    gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
    CustomEase.create("hop", "0.85, 0, 0.15, 1");

    // on counterValue.current, change the value on whatever is the current amount of papers available to a campus or research paper so that itll count from 0 to current amount
    gsap.to(thesisCounterValue.current, {
      value: Analytics.papers_thesis,
      duration: 3,
      ease: "power2.out",
      onUpdate: () => {
        if (thesisTimer.current) {
          thesisTimer.current.textContent = Math.floor(
            thesisCounterValue.current.value,
          );
        }
      },
    });
    // on counterValue.current, change the value on whatever is the current amount of papers available to a campus or research paper so that itll count from 0 to current amount
    gsap.to(capstoneCounterValue.current, {
      value: Analytics.papers_capstone,
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
    gsap.to(bulanCounterValue.current, {
      value: Analytics.total_papers,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".bulan",
        start: "bottom bottom",
        once: true,
      },
      onUpdate: () => {
        if (bulanTimer.current) {
          bulanTimer.current.textContent = Math.floor(
            bulanCounterValue.current.value,
          );
        }
      },
    });
    // campus counter animations
  }, [Analytics]);
  //use Gsap

  //useAuthStore checks user and loading
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  //analytics pie chart fetch

  // useEffect(() => {
  //   async function PieChartData() {
  //     try {
  //     } catch {}
  //   }
  // }, []);

  //dummy pie chart data
  const dummyData = [
    { category: "Technology", total: 42, fill: "#02a9f7" },
    { category: "Politics & Society", total: 30, fill: "#FF9D50" },
    { category: "Business", total: 18, fill: "#403d39" },
  ];

  return (
    <>
      <ReactLenis
        root
        options={{
          autoRaf: false,
          duration: 3,
        }}
        smoothWheel={true}
        ref={lenisRef}
      >
        {/* body */}
        <div className="bg-[#fdfffc]">
          {/* header */}
          <div className="sticky top-0 z-50 flex items-center justify-end bg-transparent">
            <div className="font-urbanist flex w-[45%] items-center justify-center bg-[#071437] p-3 font-extralight text-white select-none lg:w-[15%] lg:text-2xl">
              <div className="pl-3">
                {isLoading ? (
                  <div className="lg:px-4">Loading..</div>
                ) : user ? (
                  <ProfileModal />
                ) : (
                  <Link href="/login">
                    <div className="group relative flex cursor-pointer items-center justify-center lg:px-4">
                      <button className="cursor-pointer">Login</button>
                      <div className="absolute inset-0 z-20 flex items-center justify-center bg-white transition-[clip-path,background-color,color] duration-500 [clip-path:polygon(0%_50%,100%_50%,100%_50%,0%_50%)] group-hover:bg-white group-hover:text-[#071437] group-hover:[clip-path:polygon(0_0%,101%_0,101%_101%,0_101%)]">
                        Login
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
          {/* header */}

          {/* title*/}
          <div className="font-bona_nova_sc sticky top-0 z-50 flex w-[55%] items-center gap-4 bg-[#800000] py-2 pl-5 text-white lg:gap-10 lg:px-10 lg:py-4">
            {/* logo */}
            <div className="flex h-13 w-13 items-center justify-center overflow-hidden rounded-full lg:h-16 lg:w-16">
              <div className="relative h-full w-full">
                <Image
                  src={SorSu}
                  alt="SorSU Logo"
                  fill
                  priority
                  sizes="(max-width: 1024px) 52px, 64px"
                  className="object-contain"
                />
              </div>
            </div>
            {/* logo */}
            {/* uniTitle */}

            <p className="flex flex-col sm:flex-row sm:gap-2 lg:text-4xl">
              <span>Sorsogon</span>
              <span>State</span>
              <span>University</span>
            </p>
            {/* uniTitle */}
          </div>
          {/* title */}
          {/* contents */}
          <div className="mt-10 sm:mx-0 lg:mt-12 lg:flex lg:justify-between">
            {/* about */}
            <div className="flex flex-1 flex-col lg:mr-20">
              <div className="mx-5 flex flex-col sm:mx-0 lg:ml-10">
                <div className="flex items-center justify-start gap-2 border-b border-black pb-3 lg:pb-4">
                  <p className="font-bona_nova_sc text-[34px] leading-none text-[#800000] lg:text-6xl">
                    SorSu
                  </p>
                  <p className="font-urbanist lg:text-6x text-[30px] leading-none text-[#242423]">
                    :
                  </p>
                  <div className="font-urbanist text-[20px] leading-none text-[#131312] lg:text-3xl">
                    <p>Institutional Repository of</p>
                    <p>Theses and Capstone Projects</p>
                  </div>
                </div>
                <div className="font-urbanist pt-5 text-[#242423] lg:pt-10">
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

              <div className="px-10 py-10">
                <Search />
              </div>

              {/* most viewed papers title */}
              <div className="font-bona_nova mt-10 mr-5 bg-[#071437] py-3 pl-5 text-2xl text-white underline sm:mr-0 lg:pl-10">
                <p>Most Viewed Papers</p>
              </div>
              {/* most viewed papers title */}

              {/* in this div, all of the most viewed will be displayed and will be full of javascript to retrieve data and present it here */}
              <div className="mx-5 pt-5 sm:mx-0 lg:pl-10">
                <div className="flex flex-col gap-2 border-b border-[#585757] pb-2">
                  {/* some sort of title retriever here probably like {title.retrieve} idk */}
                  <p className="font-urbanist text-[16px] font-semibold text-[#242423]">
                    Level of Technology implementation in the classroom as a
                    predictor of students' achievment in English, Math and
                    Science
                  </p>
                  <p className="font-urbanist text-sm font-light text-[#585757] italic">
                    Ronald U. Mendoza, Jurel K. Yap, Gabrielle Ann S. Mendoza,
                    Leonardo M. Jaminola III, and Erica Celine Yu
                  </p>
                  <div className="font-urbanist flex justify-between pr-2 text-sm text-[#242423]">
                    <p>Bachelor of Science in Computer Science</p>
                    <p>2021</p>
                  </div>
                </div>
              </div>
              {/* in this div, all of the most viewed will be displayed and will be full of javascript to retrieve data and present it here */}
            </div>

            {/* Research Papers Analytics */}
            <div className="text-white lg:w-[45%]">
              <p className="font-bona_nova_sc pt-4 pb-7 pl-5 text-[24px] text-[#242423] sm:pt-0 sm:pl-0 lg:text-3xl">
                Research Papers
              </p>
              <div className="ml-5 flex h-100 flex-col items-center justify-center gap-15 bg-[#800000] px-10 py-15 sm:ml-0">
                <div className="flex w-full flex-col justify-center">
                  <p className="font-bona_nova_sc flex items-center justify-between border-b border-white pb-2 text-5xl">
                    {/* this stupid number should have a counting animation from 0 to current number of papers */}
                    <span ref={thesisTimer}>0</span>
                    {/* this stupid number should have a counting animation from 0 to current number of papers */}
                    {/* this svg will be a <Link /> which is pressable and will send the user to the thesis section */}
                    <Link
                      href="/theses"
                      className="focus:ring-0 focus:outline-none"
                    >
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
                    </Link>
                    {/* this svg will be a <Link /> which is pressable and will send the user to the thesis section */}
                  </p>
                  <p className="font-bona_nova_sc pt-2 text-2xl leading-none">
                    Theses Papers
                  </p>
                </div>
                <div className="flex w-full flex-col justify-center">
                  <p className="font-bona_nova_sc flex items-center justify-between border-b border-white pb-2 text-5xl">
                    <span ref={capstoneTimer}>0</span>
                    <Link
                      href="/capstone"
                      className="focus:ring-0 focus:outline-none"
                    >
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
                    </Link>
                  </p>
                  <p className="font-bona_nova_sc pt-2 text-2xl leading-none">
                    Capstone Projects
                  </p>
                </div>
              </div>
            </div>
            {/* Research Papers Analytics */}
          </div>
          {/* contents */}
          <div className="min-h-screen w-full justify-center py-20 lg:flex lg:gap-0">
            <div className="flex flex-1 items-center justify-center">
              <div className="flex h-[50vh] w-full md:h-screen">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={dummyData}
                      dataKey="total"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={pieOuterRadius}
                      label
                    ></Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Campuses Analytics */}
            <div className="font-cormorant_infant mt-20 flex flex-1 flex-col items-center justify-center text-6xl text-[#242423] lg:mt-0">
              <div className="b w-full items-center justify-between lg:flex">
                <div className="flex flex-1 justify-between px-5 lg:px-25">
                  <p className="cursor-pointer underline decoration-transparent decoration-2 underline-offset-[0.10em] transition-colors duration-300 hover:decoration-current">
                    Bulan
                  </p>
                  <div className="flex items-end justify-end gap-2">
                    {/* WARNING  WARNINGWARNINGWARNINGWARNINGWARNINGWARNINGWARNINGWARNINGWARNINGWARNINGWARNING */}
                    {/* add scrollTrigger on this campus analytics */}
                    <span className="bulan italic" ref={bulanTimer}>
                      0
                    </span>
                    {/* add scrollTrigger on this campus analytics */}
                    {/* WARNING  WARNINGWARNINGWARNINGWARNINGWARNINGWARNINGWARNINGWARNINGWARNINGWARNINGWARNING */}
                    <p className="text-sm">Total Papers</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Campuses Analytics */}
          </div>
          <Footer></Footer>
        </div>
        {/* body */}
      </ReactLenis>
    </>
  );
}
