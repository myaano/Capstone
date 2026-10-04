"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Rizal from "../../../public/Rizal.jpg";

const API_URL = "https://capstone-backend-1yta.onrender.com";

// This page is where the "Verify email" button in the email lands, e.g.
//   /verify-email?id=1&hash=abc123&expires=1760000000&signature=xyz
// It calls the backend's signed route with the same expires + signature.
// No email input needed: the user was already identified by the link itself.
export default function VerifyEmailPage() {
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [message, setMessage] = useState("");
  const hasRun = useRef(false);

  useEffect(() => {
    // dev strict mode runs effects twice; the link should only be used once
    if (hasRun.current) return;
    hasRun.current = true;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const hash = params.get("hash");
    const expires = params.get("expires");
    const signature = params.get("signature");

    if (!id || !hash || !expires || !signature) {
      setStatus("error");
      setMessage("This verification link is incomplete or invalid.");
      return;
    }

    // IMPORTANT: only forward `expires` and `signature`. Laravel's signature
    // covers the whole query string, so extra params (like id/hash) would make
    // the signature invalid.
    const query = `expires=${encodeURIComponent(expires)}&signature=${encodeURIComponent(signature)}`;

    fetch(`${API_URL}/api/email/verify/${id}/${hash}?${query}`, {
      headers: { Accept: "application/json" },
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setStatus("success");
          setMessage(
            data.message || "Your email has been verified. You can now log in.",
          );
          return;
        }
        setStatus("error");
        if (res.status === 403) {
          setMessage(
            "This link is invalid or has expired. Please register again or contact support.",
          );
        } else {
          setMessage(
            data.message || "Verification failed. Please try again later.",
          );
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Could not reach the server. Please try again.");
      });
  }, []);

  const title =
    status === "loading"
      ? "Verifying"
      : status === "success"
        ? "Verified"
        : "Verification failed";

  return (
    <div className="h-screen bg-[#800000] px-10 py-12">
      <div className="flex h-full rounded-2xl">
        {/* LEFT: photo + quote */}
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

        {/* RIGHT: status */}
        <div className="flex flex-1 items-center justify-center rounded-2xl bg-white px-2 lg:rounded-l-none lg:rounded-r-2xl lg:px-10">
          <div className="flex w-[90%] flex-col gap-6">
            <div>
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
                  {title}
                </p>
                <p
                  role={status === "error" ? "alert" : "status"}
                  className={`font-urbanist text-[14px] ${
                    status === "error" ? "text-red-600" : "text-[#363633]"
                  }`}
                >
                  {status === "loading"
                    ? "Please wait while we verify your SorSU email..."
                    : message}
                </p>
              </div>
            </div>

            {status === "loading" && (
              <div
                aria-hidden="true"
                className="h-8 w-8 animate-spin rounded-full border-4 border-[#363633]/20 border-t-[#800000]"
              />
            )}

            {status === "success" && (
              <Link
                href="/login"
                className="font-urbanist flex w-full items-center justify-center rounded-xl bg-[#071437] p-2 text-xl text-white transition-opacity hover:opacity-90 active:opacity-70"
              >
                Go to login
              </Link>
            )}

            {status === "error" && (
              <div className="font-urbanist flex flex-col gap-3">
                <Link
                  href="/register"
                  className="flex w-full items-center justify-center rounded-xl bg-[#071437] p-2 text-xl text-white transition-opacity hover:opacity-90 active:opacity-70"
                >
                  Back to register
                </Link>
                <Link
                  href="/login"
                  className="text-sm text-[#242423] underline"
                >
                  Back to login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
