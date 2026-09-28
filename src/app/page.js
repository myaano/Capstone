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

// campus/college/program/category on a paper are nested { id, name }
// objects - render the name instead of handing React the raw object.
function fieldLabel(value) {
  if (value && typeof value === "object") return value.name ?? "";
  return value ?? "";
}

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

  //change the counterValue to the current value of the current available papers in the datbase
  const thesisCounterValue = useRef({ value: 0 });
  const capstoneCounterValue = useRef({ value: 0 });
  //change the thesisCounterValue to the current value of the current available papers in the datbase

  // per-campus refs, keyed by campus name — one entry gets created for
  // every campus that shows up in Analytics.papers_by_campus, so adding a
  // new campus in the backend automatically gets its own counter here
  const campusTimerRefs = useRef({});
  const campusCounterRefs = useRef({});
  //counter animation for both types of research papers and for the total amount of papers on each campuses
  {
    /* RESEARCH TIMER VARS */
  }

  const [Analytics, setAnalytics] = useState(null);
  const [pieOuterRadius, setPieOuterRadius] = useState(100);

  // papers_by_category / papers_by_campus come back from Laravel as
  // { "Technology": 4, "Business": 1, ... } style maps - this turns that
  // into the [{ name, total }] shape the pie chart and campus loop need.
  // Also tolerates it already being an array, just in case.
  function toChartArray(collection) {
    if (!collection) return [];
    if (Array.isArray(collection)) return collection;
    return Object.entries(collection).map(([name, total]) => ({
      name,
      total: Number(total) || 0,
    }));
  }

  // generates a color from the category's own name instead of a fixed
  // palette array - scales to however many categories exist, and the same
  // category name always lands on the same color (not reshuffled every
  // render like plain Math.random() would do)
  function categoryColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 65%, 55%)`;
  }

  const categoryData = toChartArray(Analytics?.papers_by_category).map(
    (item) => ({
      ...item,
      fill: categoryColor(item.name),
    }),
  );

  const campusData = toChartArray(Analytics?.papers_by_campus);

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
          "https://capstone-backend-1yta.onrender.com/api/analytics",
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
    // campus counter animations - one gsap tween per campus, so a new
    // campus added on the backend gets an animated counter automatically
    campusData.forEach((campus) => {
      const slug = campus.name.replace(/\s+/g, "-").toLowerCase();
      if (!campusCounterRefs.current[campus.name]) {
        campusCounterRefs.current[campus.name] = { value: 0 };
      }
      gsap.to(campusCounterRefs.current[campus.name], {
        value: campus.total,
        ease: "power2.out",
        scrollTrigger: {
          trigger: `.campus-${slug}`,
          start: "bottom bottom",
          once: true,
        },
        onUpdate: () => {
          const el = campusTimerRefs.current[campus.name];
          if (el) {
            el.textContent = Math.floor(
              campusCounterRefs.current[campus.name].value,
            );
          }
        },
      });
    });
    // campus counter animations
  }, [Analytics]);
  //use Gsap

  // Lenis calculates the page's scrollable height near mount, before the
  // Analytics fetch resolves - the pie chart/campus list/most-viewed
  // papers that get added afterward make the page taller, but Lenis
  // never finds out unless told to resize, so scroll gets capped short
  // of the real bottom. requestAnimationFrame waits for that new content
  // to actually paint before recalculating.
  useEffect(() => {
    if (!Analytics) return;
    const id = requestAnimationFrame(() => {
      lenisRef.current?.lenis?.resize();
    });
    return () => cancelAnimationFrame(id);
  }, [Analytics]);

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
            <div className="flex flex-1 flex-col lg:mr-20 lg:w-[55%]">
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
              {/* most viewed papers title */}
              <div className="font-bona_nova mt-10 mr-5 bg-[#071437] py-3 pl-5 text-2xl text-white underline sm:mr-0 lg:pl-10">
                <p>Most Viewed Papers</p>
              </div>
              {/* most viewed papers title */}

              {/* researchers/program/year require the backend's
                  most_viewed_papers query to actually select/eager-load
                  them - until then these render blank. Sorted defensively
                  before slicing, in case the backend doesn't already
                  return it in views_count order. */}
              <div className="mx-5 flex flex-col gap-5 pt-5 sm:mx-0 lg:pl-10">
                {[...(Analytics?.most_viewed_papers ?? [])]
                  .sort((a, b) => b.views_count - a.views_count)
                  .slice(0, 3)
                  .map((paper) => {
                    // falling back to "thesis" is a guess, not a real
                    // fix; add paper_type to that backend query so this
                    // routes correctly for capstone papers too
                    const detailHref =
                      paper.paper_type === "capstone"
                        ? `/capstone/${paper.id}`
                        : `/theses/${paper.id}`;
                    return (
                      <div
                        key={paper.id}
                        className="flex flex-col gap-10 border-b border-[#585757] pb-2"
                      >
                        <div className="text-lg">
                          <Link href={detailHref}>
                            <p className="font-urbanist line-clamp-2 font-semibold wrap-break-word text-[#242423] underline decoration-transparent underline-offset-2 transition-colors duration-200 hover:decoration-current">
                              {paper.title}
                            </p>
                          </Link>
                          <p className="font-urbanist line-clamp-1 font-light wrap-break-word text-[#585757] italic">
                            {paper.researchers}
                          </p>
                        </div>
                        <div className="font-urbanist pr-2 text-[#242423]">
                          <div className="flex justify-between">
                            <p>{paper.college}</p>
                            <h1>{paper.campus}</h1>
                          </div>
                          <div className="flex justify-between">
                            <h1>{fieldLabel(paper.program)}</h1>
                            <h1>{paper.year}</h1>
                          </div>
                          <div className="flex justify-between">
                            <h1>{paper.category}</h1>
                            <h1>Views: {paper.views_count}</h1>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
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
          {/* Search sits below the whole two-column row (about/most-viewed
              on one side, the maroon Research Papers box on the other) -
              it was previously a third item inside that same lg:flex row,
              landing beside the maroon box instead of underneath it */}
          <div className="px-10 pt-5 lg:px-10 lg:py-15">
            <Search />
          </div>
          {/* contents */}

          <div className="min-h-screen w-full justify-center py-20 lg:flex">
            <div className="flex flex-1 items-center justify-center">
              <div className="flex h-[50vh] w-full md:h-screen">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="total"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={pieOuterRadius}
                      label
                    ></Pie>
                    <Tooltip
                      formatter={(value, name) => [
                        value,
                        `${name} Total Papers`,
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Campuses Analytics */}
            <div className="font-cormorant_infant mt-20 flex flex-1 flex-col items-center justify-center gap-10 text-6xl text-[#242423] lg:mt-0">
              {campusData.map((campus) => {
                const slug = campus.name.replace(/\s+/g, "-").toLowerCase();
                return (
                  <div
                    key={campus.name}
                    className={`campus-${slug} b w-full items-center justify-between lg:flex`}
                  >
                    <div className="flex flex-1 justify-between px-5 lg:px-25">
                      <p className="underline decoration-transparent decoration-2 underline-offset-[0.10em] transition-colors duration-300 hover:decoration-current">
                        {campus.name}
                      </p>
                      <div className="flex items-end justify-end gap-2">
                        <span
                          className="italic"
                          ref={(el) => {
                            campusTimerRefs.current[campus.name] = el;
                          }}
                        >
                          0
                        </span>
                        <p className="text-sm">Total Papers</p>
                      </div>
                    </div>
                  </div>
                );
              })}
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
