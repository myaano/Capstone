"use client";

import Link from "next/link";






export default function Sample() {
  return (
    <>
      <div className="bg-white h-screen flex justify-center items-center gap-10">
        <Link href="/login">
          <div className="group cursor-pointer h-20 w-20 relative flex justify-center items-center bg-black font-urbanist">
            <button className="absolute text-white">Login</button>
            <div className="absolute z-20 inset-0  bg-lime-500 flex justify-center items-center [clip-path:polygon(0%_50%,100%_50%,100%_50%,0%_50%)] transition-[clip-path,background-color,color] duration-500 group-hover:bg-lime-500 group-hover:[clip-path:polygon(0_0%,101%_0,101%_101%,0_101%)] group-hover:text-black ">
              Login
            </div>
          </div>
        </Link>

        <div className="group cursor-pointer h-20 w-20 relative flex justify-center items-center bg-black font-urbanist">
          <div className="absolute z-20 inset-0  bg-lime-500 flex justify-center items-center [clip-path:polygon(0_0%,101%_0%,101%_101%,0_101%)] transition-[clip-path,background-color,color] duration-500 group-hover:bg-lime-500 group-hover:[clip-path:polygon(0_0%,0%_0%,0%_101%,0_101%)] group-hover:text-black"></div>
        </div>
      </div>
    </>
  );
}
