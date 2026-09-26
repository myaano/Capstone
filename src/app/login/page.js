"use client";

import Image from "next/image";
import Rizal from "../../../public/Rizal.jpg";
import { useAuthStore } from "../store/useAuthStore";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(
        "https://capstone-backend-1yta.onrender.com/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ username, password }),
        },
      );

      if (!res.ok) {
        setError("Invalid credentials");
        return;
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
      setUser(data.user);
      router.push("/"); // or wherever you want to land after login
    } catch (err) {
      setError("Something went wrong");
    }
  }

  return (
    <div className="h-screen bg-[#800000] px-10 py-12">
      <div className="flex h-full rounded-2xl">
        <div className="relative hidden w-[60%] overflow-hidden rounded-l-2xl bg-white lg:block">
          <div className="absolute h-full w-full">
            <Image
              src={Rizal}
              alt="BackgroundPhoto"
              fill={true}
              loading="eager"
              sizes="(max-width: 768px) 100vw"
              style={{ filter: "brightness(60%)" }}
            />
          </div>
          <div className="font-urbanist absolute bottom-20 z-10 pl-5 text-white select-none">
            <p className="text-5xl font-semibold">
              If Knowledge is the heritage of mankind, only the brave inherit
              it.
            </p>
            <p className="text-2xl font-light">— Jose Rizal, Noli Me Tangere</p>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center rounded-2xl bg-white px-2 lg:rounded-l-none lg:rounded-r-2xl lg:px-10">
          <div className="flex h-[50%] w-[90%] flex-col lg:h-[60%]">
            <div className="">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#363633] bg-white">
                <svg
                  width="23"
                  height="21"
                  viewBox="0 0 23 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M14.25 0.5H19.25C20.6308 0.5 21.75 1.61929 21.75 3V18C21.75 19.3807 20.6308 20.5 19.25 20.5H14.25M15.5 10.5H0.5M10.5 5.5L15.5 10.5L10.5 15.5"
                    stroke="#515050"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="font-urbanist my-1 text-[14px] text-[#999595] select-none">
                SORSOGON STATE UNIVERSITY
              </p>
              <div className="inline-flex flex-col gap-1">
                <p className="font-cormorant_infant text-5xl leading-none text-[#363633] select-none">
                  Login
                </p>
                <p className="font-urbanist text-[14px] text-[#363633] select-none">
                  Enter Username and Password to login
                </p>
              </div>
            </div>
            <form
              action=""
              onSubmit={handleSubmit}
              className="font-urbanist flex flex-1 flex-col gap-7 pt-7 lg:justify-end"
            >
              {/*UsernameCONTAINER */}
              <div className="flex flex-col">
                <p className="leading-none text-[#363633] select-none">
                  Username
                </p>
                <input
                  placeholder="Username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="rounded-lg border border-[#242423] bg-[#fffff6] px-2 py-1 text-[#363633] placeholder:text-[#999595]"
                />
              </div>
              {/*UsernameCONTAINER */}
              {/*PasswordContainer */}
              <div className="flex flex-col">
                <p className="leading-none text-[#363633] select-none">
                  Password
                </p>
                <input
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-lg border border-[#363633] bg-[#fffff6] px-2 py-1 text-[#363633] outline-[#363633] placeholder:text-[#999595]"
                />
              </div>
              {/*PasswordContainer */}
              {error && <p className="-mt-4 text-sm text-red-600">{error}</p>}
              <div className="group relative flex w-full cursor-pointer active:opacity-70">
                <button className="flex w-full items-center justify-center rounded-xl border border-[#071437] bg-white p-2 text-xl text-[#071437]">
                  Login
                </button>
                <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-[#071437] text-xl transition-[clip-path,background-color,color] duration-500 [clip-path:polygon(0_0%,101%_0%,101%_101%,0_101%)] group-hover:bg-[#071437] group-hover:text-white group-hover:[clip-path:polygon(0_0%,0%_0%,0%_101%,0_101%)]">
                  Login
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
