"use client";
import Image from "next/image";
import Rizal from "../../../public/Rizal.jpg";
import Link from "next/link";
import { useState } from "react";

const API = "https://capstone-backend-1yta.onrender.com/api";

// Pulls the message out of a failed response so the page shows the backend's
// own error: the first field error for Laravel validation failures
// ({ message, errors: { field: [..] } }), otherwise the top-level message.
async function backendError(res) {
  const data = await res.json().catch(() => null);
  const firstFieldError = data?.errors
    ? Object.values(data.errors)[0]?.[0]
    : null;
  return firstFieldError || data?.message || `Request failed (${res.status})`;
}

async function post(path, body) {
  return fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
}

const inputClass =
  "rounded-lg border border-[#363633] bg-[#fffff6] px-2 py-1 text-[#363633] outline-[#363633] placeholder:text-[#999595]";

// Animated button, same style as the login page
function PrimaryButton({ children, loading, onClick, type = "submit" }) {
  return (
    <div
      className={`group relative flex w-full cursor-pointer active:opacity-70 ${
        loading ? "pointer-events-none opacity-60" : ""
      }`}
    >
      <button
        type={type}
        onClick={onClick}
        disabled={loading}
        className="flex w-full items-center justify-center rounded-xl bg-[#071437] p-2 text-xl text-white"
      >
        {children}
      </button>
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-xl border border-[#071437] bg-white text-xl text-[#071437] transition-[clip-path,background-color,color] duration-500 [clip-path:polygon(0_0%,101%_0%,101%_101%,0_101%)] group-hover:bg-white group-hover:text-[#071437] group-hover:[clip-path:polygon(0_0%,0%_0%,0%_101%,0_101%)]">
        {loading ? "Please wait..." : children}
      </div>
    </div>
  );
}

// Steps: "email" -> "sent" (check your inbox for the reset link)
export default function ForgotPassword() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState(""); // success message from the backend
  const [loading, setLoading] = useState(false);

  // POST /forgot-password: Laravel emails a reset link to the user.
  // Used by the first step and by "Resend link".
  const requestLink = async () => {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await post("/forgot-password", { email });
      if (!res.ok) {
        setError(await backendError(res));
        return false;
      }
      const data = await res.json().catch(() => ({}));
      setInfo(data.message || "");
      return true;
    } catch {
      setError("Could not reach the server. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (await requestLink()) setStep("sent");
  };

  const titles = {
    email: [
      "Forgot password",
      "Enter your SorSU email and we'll send you a link to reset your password.",
    ],
    sent: [
      "Check your email",
      `We sent a password reset link to ${email}. Open it to choose a new password.`,
    ],
  };

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

        {/* RIGHT: form */}
        <div className="flex flex-1 items-center justify-center overflow-y-auto rounded-2xl bg-white px-2 py-6 lg:rounded-l-none lg:rounded-r-2xl lg:px-10">
          <div className="my-auto flex w-[90%] flex-col gap-5">
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
                  {titles[step][0]}
                </p>
                <p className="font-urbanist text-[14px] text-[#363633] select-none">
                  {titles[step][1]}
                </p>
              </div>

              {/* STEP 1: EMAIL */}
              {step === "email" && (
                <form
                  noValidate
                  onSubmit={handleSendEmail}
                  className="font-urbanist flex flex-col gap-7 pt-7"
                >
                  <div className="flex flex-col">
                    <label
                      htmlFor="email"
                      className="leading-none text-[#363633] select-none"
                    >
                      SorSU Email
                    </label>
                    <input
                      id="email"
                      placeholder="email@sorsu.edu.ph"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  {error && (
                    <p role="alert" className="-mt-4 text-sm text-red-600">
                      {error}
                    </p>
                  )}
                  <PrimaryButton loading={loading}>Send link</PrimaryButton>
                </form>
              )}

              {/* STEP 2: LINK SENT */}
              {step === "sent" && (
                <div className="font-urbanist flex flex-col gap-4 pt-7">
                  {info && !error && (
                    <p role="status" className="text-sm text-[#363633]">
                      {info}
                    </p>
                  )}
                  {error && (
                    <p role="alert" className="text-sm text-red-600">
                      {error}
                    </p>
                  )}
                  <p className="text-sm text-[#999595]">
                    Didn&apos;t get it? Check your spam folder or{" "}
                    <button
                      type="button"
                      onClick={requestLink}
                      disabled={loading}
                      className="text-[#071437] underline disabled:opacity-50"
                    >
                      {loading ? "sending..." : "resend the link"}
                    </button>
                    .
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setInfo("");
                      setStep("email");
                    }}
                    className="self-start text-sm text-[#363633] underline"
                  >
                    Use a different email
                  </button>
                </div>
              )}

              <p className="font-urbanist pt-6 text-sm text-[#363633]">
                Remembered it?{" "}
                <Link href="/login" className="text-[#071437] underline">
                  Back to login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
