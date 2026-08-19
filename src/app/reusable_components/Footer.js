"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <div className=" h-screen lg:h-170  bg-[#800000] relative overflow-hidden font-urbanist ">
      {/* background is the first div, the details is the 2nd one */}
      <div className="absolute z-20 h-full w-full  px-5 lg:px-10 pt-10 flex flex-col justify-between">
        <div className=" text-white">
          <div className="md:flex gap-5">
            <h1 className="text-7xl md:text-8xl">Sorsogon</h1>
            <h1 className="text-7xl md:text-8xl">State</h1>
          </div>
          <h1 className="text-7xl md:text-8xl">University</h1>
        </div>

        {/* use grid here */}
        <div className=" flex flex-col gap-2  ">
          <div className="grid grid-cols-3  border-b border-white md:pb-2 text-white/80  md:text-lg">
            <h1>Portal</h1>
            <h1>Contacts</h1>
            <h1>Socials</h1>
          </div>
          <div className="grid grid-cols-3 font-light text-white md:text-lg">
            <div>
              <Link
                href="https://sorsu.edu.ph/"
                target="_blank"
                className="focus:outline-none focus:ring-0"
              >
                <h1 className="underline underline-offset-4">sorsu.edu.ph</h1>
              </Link>

              <Link
                href="https://bulan.sorsu.edu.ph"
                target="_blank"
                className="focus:outline-none focus:ring-0"
              >
                <h1 className="underline underline-offset-4">
                  bulan.sorsu.edu.ph
                </h1>
              </Link>
            </div>
            <div>
              <h1>ssc@sorsu.edu.ph</h1>
              <h1>(056) 211-0103 </h1>
            </div>
            <div>
              <Link
                href="https://www.facebook.com/sorsogonstateuniversityofficial"
                target="_blank"
                className="focus:outline-none focus:ring-0"
              >
                <h1 className="underline underline-offset-4 inline-flex justify-center items-center">
                  Facebook
                </h1>
              </Link>
            </div>
          </div>
        </div>
        <div className=" text-white font-light">
          <h1>
            Magsaysay Street, (Pob.), Sorsogon City, Sorsogon, Philippines, 4700
          </h1>
        </div>
      </div>

      <div className="h-full relative flex just-center items-center ">
        <div className="absolute right-[-50%] lg:right-[-20%] z-10 hidden lg:block">
          <div className="bg-blue-400 rounded-full h-120  w-120">
            <svg
              width="350"
              height="350"
              viewBox="0 0 350 350"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <circle cx="175" cy="175" r="175" fill="#D9D9D9" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
