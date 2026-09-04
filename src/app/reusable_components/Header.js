"use client";
//next imports
import Image from "next/image";
import Link from "next/link";
//next

import { useAuthStore } from "../store/useAuthStore";

import ProfileModal from "./ProfileModal";

export default function Header() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  return (
    <div className="flex justify-between bg-white">
      <div className="font-bona_nova_sc flex w-[55%] items-center gap-4 bg-[#800000] py-2 pl-5">
        <div className="h-13 w-13 rounded-full bg-green-200"></div>
        <Link href="/">
          <p className="flex flex-col text-white sm:flex-row sm:gap-2 lg:text-4xl">
            <span>Sorsogon</span>
            <span>State</span>
            <span>University</span>
          </p>
        </Link>
      </div>

      <div className="font-urbanist w-[45%] font-extralight select-none lg:w-[25%] lg:text-2xl">
        <div className="flex w-full items-center justify-center bg-[#071437] p-3 text-white">
          <div className="flex items-center border-r border-white pr-3">
            {/* Link */}
            <div className="group relative flex cursor-pointer items-center justify-center lg:px-4">
              <button className="flex cursor-pointer items-center justify-center gap-2">
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
              <div className="absolute inset-0 z-20 flex items-center justify-center gap-2 bg-white transition-[clip-path,background-color,color] duration-500 [clip-path:polygon(0%_50%,100%_50%,100%_50%,0%_50%)] group-hover:bg-white group-hover:text-[#071437] group-hover:[clip-path:polygon(0_0%,101%_0,101%_101%,0_101%)]">
                Search
              </div>
            </div>
            {/* Link */}
          </div>

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
