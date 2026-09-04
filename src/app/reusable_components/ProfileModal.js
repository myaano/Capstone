"use client";
import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useRouter } from "next/navigation";

export default function ProfileModal() {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const containerRef = useRef(null);
  // use effect that handles clicking outside that mini modal reveal thingey
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null; // or a "Login" button

  const isAdmin = user.role === "admin";

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    await fetch(
      "https://application-production-cfb3.up.railway.app/api/logout",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    localStorage.removeItem("token");
    logout();
    router.push("/");
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center"
    >
      <div className="font-urbanist top-10 flex flex-col items-center justify-center gap-7 font-light text-white md:min-w-28">
        <div className="group relative md:px-1">
          <button
            className="flex items-center justify-center gap-1"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {user.name}
            <svg
              width="15"
              height="9"
              viewBox="0 0 15 9"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.65691 8.07112C7.04743 8.46164 7.6806 8.46164 8.07112 8.07112L14.4351 1.70716C14.8256 1.31664 14.8256 0.68347 14.4351 0.292946C14.0446 -0.0975785 13.4114 -0.0975785 13.0209 0.292946L7.36401 5.9498L1.70716 0.292946C1.31664 -0.0975785 0.68347 -0.0975785 0.292946 0.292946C-0.0975785 0.68347 -0.0975785 1.31664 0.292946 1.70716L6.65691 8.07112ZM7.36401 5.36401H6.36401V7.36401H7.36401H8.36401V5.36401H7.36401Z"
                fill="white"
              />
            </svg>
          </button>
          <div
            className="absolute inset-0 flex items-center justify-center bg-white transition-[clip-path,background-color,color] duration-500 [clip-path:polygon(0%_50%,100%_50%,100%_50%,0%_50%)] group-hover:bg-white group-hover:text-[#071437] group-hover:[clip-path:polygon(0_0%,101%_0,101%_101%,0_101%)] md:gap-1"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {user.name}
            <svg
              width="15"
              height="9"
              viewBox="0 0 15 9"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.65691 8.07112C7.04743 8.46164 7.6806 8.46164 8.07112 8.07112L14.4351 1.70716C14.8256 1.31664 14.8256 0.68347 14.4351 0.292946C14.0446 -0.0975785 13.4114 -0.0975785 13.0209 0.292946L7.36401 5.9498L1.70716 0.292946C1.31664 -0.0975785 0.68347 -0.0975785 0.292946 0.292946C-0.0975785 0.68347 -0.0975785 1.31664 0.292946 1.70716L6.65691 8.07112ZM7.36401 5.36401H6.36401V7.36401H7.36401H8.36401V5.36401H7.36401Z"
                fill="#071437"
              />
            </svg>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-34 text-lg">
        {isOpen && (
          <div className="flex flex-col items-center justify-center gap-1 rounded-xl bg-[#071437] px-3 py-3">
            {isAdmin && (
              <div className="group relative px-1">
                <button
                  onClick={() => router.push("/upload")}
                  className="cursor-pointer"
                >
                  Upload
                </button>
                <div
                  className="absolute inset-0 flex items-center justify-center bg-white transition-[clip-path,background-color,color] duration-500 [clip-path:polygon(0%_50%,100%_50%,100%_50%,0%_50%)] group-hover:bg-white group-hover:text-[#071437] group-hover:[clip-path:polygon(0_0%,101%_0,101%_101%,0_101%)]"
                  onClick={() => router.push("/upload")}
                >
                  Upload
                </div>
              </div>
            )}
            {isAdmin && (
              <div className="group relative px-1">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="cursor-pointer"
                >
                  Dashboard
                </button>
                <div
                  className="absolute inset-0 flex items-center justify-center bg-white transition-[clip-path,background-color,color] duration-500 [clip-path:polygon(0%_50%,100%_50%,100%_50%,0%_50%)] group-hover:bg-white group-hover:text-[#071437] group-hover:[clip-path:polygon(0_0%,101%_0,101%_101%,0_101%)]"
                  onClick={() => router.push("/dashboard")}
                >
                  Dashboard
                </div>
              </div>
            )}
            <div className="group relative px-1">
              <button onClick={handleLogout} className="cursor-pointer">
                Logout
              </button>
              <div
                className="absolute inset-0 flex items-center justify-center bg-white transition-[clip-path,background-color,color] duration-500 [clip-path:polygon(0%_50%,100%_50%,100%_50%,0%_50%)] group-hover:bg-white group-hover:text-[#071437] group-hover:[clip-path:polygon(0_0%,101%_0,101%_101%,0_101%)]"
                onClick={handleLogout}
              >
                Logout
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
