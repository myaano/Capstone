"use client";

import Link from "next/link";

import { useEffect } from "react";

import ProfileModal from "../reusable_components/ProfileModal";

export default function Sample() {
  return (
    <>
      <div>
        <div className="flex h-screen items-center justify-center gap-10 bg-white">
          <Link href="/login">
            <div className="group font-urbanist relative flex h-20 w-20 cursor-pointer items-center justify-center bg-black">
              <button className="absolute text-white">Login</button>
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-lime-500 transition-[clip-path,background-color,color] duration-500 [clip-path:polygon(0%_50%,100%_50%,100%_50%,0%_50%)] group-hover:bg-lime-500 group-hover:text-black group-hover:[clip-path:polygon(0_0%,101%_0,101%_101%,0_101%)]">
                Login
              </div>
            </div>
          </Link>

          <div className="group font-urbanist relative flex h-20 w-20 cursor-pointer items-center justify-center bg-black">
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-lime-500 transition-[clip-path,background-color,color] duration-500 [clip-path:polygon(0_0%,101%_0%,101%_101%,0_101%)] group-hover:bg-lime-500 group-hover:text-black group-hover:[clip-path:polygon(0_0%,0%_0%,0%_101%,0_101%)]"></div>
          </div>
        </div>

        <div className="flex h-screen items-center justify-center">
          <ProfileModal></ProfileModal>
        </div>
      </div>
    </>
  );
}
