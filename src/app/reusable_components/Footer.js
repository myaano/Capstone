"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <div className="font-urbanist relative h-screen overflow-hidden bg-[#800000] lg:h-170">
      {/* background is the first div, the details is the 2nd one */}
      <div className="absolute z-20 flex h-full w-full flex-col justify-between px-5 pt-10 lg:px-10">
        <div className="flex items-center justify-start gap-5 text-white">
          <div className="h-30 w-30 rounded-full bg-pink-500 lg:h-40 lg:w-40"></div>
          <div>
            <div className="gap-5 md:flex">
              <h1 className="text-5xl sm:text-6xl md:text-8xl">Sorsogon</h1>
              <h1 className="text-5xl sm:text-6xl md:text-8xl">State</h1>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-8xl">University</h1>
          </div>
        </div>

        {/* use grid here */}
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-3 gap-5 border-b border-white text-white/80 md:pb-2 md:text-lg">
            <h1>Portal</h1>
            <h1>Contacts</h1>
            <h1>Socials</h1>
          </div>
          <div className="grid grid-cols-3 gap-5 text-sm font-light text-white md:text-lg">
            <div className="flex flex-col gap-3 md:gap-0">
              <Link
                href="https://sorsu.edu.ph/"
                target="_blank"
                className="focus:ring-0 focus:outline-none"
              >
                <h1 className="underline underline-offset-4">sorsu.edu.ph</h1>
              </Link>

              <Link
                href="https://bulan.sorsu.edu.ph"
                target="_blank"
                className="focus:ring-0 focus:outline-none"
              >
                <h1 className="underline underline-offset-4">
                  bulan.sorsu.edu.ph
                </h1>
              </Link>
            </div>
            <div className="flex flex-col gap-3 md:gap-0">
              <h1>ssc@sorsu.edu.ph</h1>
              <h1>(056) 211-0103 </h1>
            </div>
            <div className="flex flex-col gap-3 md:gap-0">
              <Link
                href="https://www.facebook.com/sorsogonstateuniversityofficial"
                target="_blank"
                className="focus:ring-0 focus:outline-none"
              >
                <h1 className="inline-flex items-center justify-center underline underline-offset-4">
                  Facebook
                </h1>
              </Link>
            </div>
          </div>
        </div>
        <div className="pb-4 font-light text-white">
          <h1>
            Magsaysay Street, (Pob.), Sorsogon City, Sorsogon, Philippines, 4700
          </h1>
        </div>
      </div>
    </div>
  );
}
