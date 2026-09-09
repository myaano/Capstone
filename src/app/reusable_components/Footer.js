"use client";

import Link from "next/link";
import Image from "next/image";
import SorSu from "../../../public/Sorsu.png";

export default function Footer() {
  return (
    <div className="font-urbanist relative z-100 h-screen overflow-hidden bg-[#800000] lg:h-170">
      {/* background is the first div, the details is the 2nd one */}
      <div className="absolute z-20 flex h-full w-full flex-col justify-between px-5 pt-20 lg:px-15">
        <div className="flex items-center justify-start gap-5 text-white">
          <div className="flex h-15 w-15 items-center justify-center overflow-hidden rounded-full lg:h-20 lg:w-20">
            <div className="relative h-full w-full">
              <Image
                src={SorSu}
                alt="SorSU Logo"
                fill
                priority
                sizes="(max-width: 1024px) 96px, 128px"
                className="object-contain"
              />
            </div>
          </div>
          <div className="">
            <div className="gap-5 md:flex">
              <h1 className="text-5xl sm:text-6xl md:text-7xl">Sorsogon</h1>
              <h1 className="text-5xl sm:text-6xl md:text-7xl">State</h1>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl">University</h1>
          </div>
        </div>

        {/* use grid here */}
        <div className="justify-between md:flex">
          <div className="grid grid-cols-2 gap-5 text-xl md:text-lg">
            <div>
              <h1 className="border-b border-white text-white/80">Portal</h1>
              <Link
                href="https://sorsu.edu.ph/"
                target="_blank"
                className="focus:ring-0 focus:outline-none"
              >
                <h1 className="text-base underline underline-offset-4">
                  sorsu.edu.ph
                </h1>
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
            <div>
              <h1 className="border-b border-white text-white/80">Social</h1>
              <Link
                href="https://www.facebook.com/sorsogonstateuniversityofficial"
                target="_blank"
                className="focus:ring-0 focus:outline-none"
              >
                <h1 className="text-base underline underline-offset-4">
                  Facebook
                </h1>
              </Link>
            </div>
            <div>
              <h1 className="border-b border-white text-white/80">Contacts</h1>
              <h1 className="text-base">ssc@sorsu.edu.ph</h1>
              <h1 className="text-base">(056) 211-0103 </h1>
            </div>
          </div>
          <div className="grid w-full grid-cols-1 gap-5 md:w-1/2">
            <div className="border-b border-white text-white/80 md:pb-2 md:text-lg">
              <h1 className="text-3xl">Pamantasang may Puso</h1>
            </div>
            <p className="md:text-xl">
              One of the Oldest Trade Schools in the Philippines, became
              Sorsogon State University in 2018 under House Bill No. 6203 ,
              nurturing future scholars and internationally competitive
              graduates
            </p>
          </div>
        </div>
        <div className="flex items-end justify-end pb-4 font-light text-white">
          <h1>
            Magsaysay Street, (Pob.), Sorsogon City, Sorsogon, Philippines, 4700
          </h1>
        </div>
      </div>
    </div>
  );
}
