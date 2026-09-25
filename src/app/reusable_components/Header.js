"use client";
//next imports
import Image from "next/image";
import Link from "next/link";
//next

import { useAuthStore } from "../store/useAuthStore";
import SorSu from "../../../public/Sorsu.png";

import ProfileModal from "./ProfileModal";

export default function Header() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  return (
    <div className="flex justify-between bg-white">
      <div className="font-bona_nova_sc flex w-[55%] items-center gap-4 bg-[#800000] py-2 pl-5 lg:pl-10">
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
        <Link href="/">
          <p className="flex flex-col text-white sm:flex-row sm:gap-2 lg:text-4xl">
            <span>Sorsogon</span>
            <span>State</span>
            <span>University</span>
          </p>
        </Link>
      </div>

      <div className="font-urbanist w-[45%] font-extralight select-none lg:w-[15%] lg:text-2xl">
        <div className="flex w-full items-center justify-center bg-[#071437] p-3 text-white">
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
    </div>
  );
}
