"use client";

import Image from "next/image";
import Rizal from "../../../public/Rizal.jpg";
import Link from "next/link";

import { useState, useEffect } from "react";

const API = "https://capstone-backend-1yta.onrender.com/api";
const USERNAME_MAX = 10;
const SORSU_EMAIL = /^[\w.+-]+@sorsu\.edu\.ph$/i; // same domain the backend accepts

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [campusId, setCampusId] = useState("");

  const [campuses, setCampuses] = useState([]);
  const [campusesLoading, setCampusesLoading] = useState(true);
  const [campusesError, setCampusesError] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  const RESEND_COOLDOWN = 60; // seconds
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Fetch the campus list for the dropdown
  useEffect(() => {
    async function loadCampuses() {
      try {
        const res = await fetch(`${API}/locations`);
        if (!res.ok) throw new Error("Failed to load campuses");
        const json = await res.json();
        const list = Array.isArray(json) ? json : (json.campuses ?? json.data);
        setCampuses(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error(err);
        setCampusesError("Could not load campuses. Please refresh the page.");
      } finally {
        setCampusesLoading(false);
      }
    }
    loadCampuses();
  }, []);

  // Counts the resend cooldown down once per second
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleResend() {
    if (resending || cooldown > 0) return;
    setResending(true);
    setResendMessage("");
    try {
      const res = await fetch(`${API}/email/resend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setResendMessage(
          data.message || "A new verification email has been sent.",
        );
        setCooldown(RESEND_COOLDOWN);
      } else if (res.status === 429) {
        setResendMessage("Too many requests. Please wait a moment.");
        setCooldown(RESEND_COOLDOWN);
      } else {
        setResendMessage(data.message || "Could not resend. Please try again.");
      }
    } catch {
      setResendMessage("Could not resend. Please try again.");
    } finally {
      setResending(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!username.trim() || username.length > USERNAME_MAX) {
      setError(`Username must be 1 to ${USERNAME_MAX} characters.`);
      return;
    }
    if (!SORSU_EMAIL.test(email)) {
      setError("Please use your SorSU email (must end in @sorsu.edu.ph).");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!campusId) {
      setError("Please select your campus.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: fullName.trim(),
          username,
          email,
          password,
          password_confirmation: confirmPassword, // required by the `confirmed` rule
          campus_id: Number(campusId),
        }),
      });

      if (!res.ok) {
        let detail = null;
        try {
          detail = await res.json();
        } catch {}
        // Laravel validation errors look like { message, errors: { field: [..] } }
        const firstFieldError = detail?.errors
          ? Object.values(detail.errors)[0]?.[0]
          : null;
        setError(
          firstFieldError ||
            detail?.message ||
            `Registration failed (${res.status})`,
        );
        return;
      }

      setRegistered(true);
      setCooldown(RESEND_COOLDOWN); // the first email was just sent
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "rounded-lg border border-[#363633] bg-[#fffff6] px-2 py-1 text-[#363633] outline-[#363633] placeholder:text-[#999595]";

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
                  {registered ? "Check your email" : "Register"}
                </p>
                <p className="font-urbanist text-[14px] text-[#363633] select-none">
                  {registered
                    ? `We sent a verification message to ${email}. Verify your SorSU email to activate your account.`
                    : "Create an account with your SorSU email."}
                </p>
              </div>

              {registered ? (
                <div className="font-urbanist flex flex-col gap-4 pt-7">
                  <p className="text-sm text-[#363633]">
                    Didn&apos;t get it? Check your spam folder, or{" "}
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resending || cooldown > 0}
                      className="text-[#071437] underline disabled:no-underline disabled:opacity-50"
                    >
                      {resending
                        ? "Sending..."
                        : cooldown > 0
                          ? `Resend in ${cooldown}s`
                          : "resend the email"}
                    </button>
                    .
                  </p>
                  {resendMessage && (
                    <p role="status" className="text-sm text-[#363633]">
                      {resendMessage}
                    </p>
                  )}
                  <Link
                    href="/login"
                    className="inline-block self-start rounded-xl bg-[#071437] px-6 py-2 text-xl text-white"
                  >
                    Go to login
                  </Link>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="font-urbanist flex flex-col gap-6 pt-7"
                >
                  {/* FULL NAME */}
                  <div className="flex flex-col">
                    <label
                      htmlFor="fullName"
                      className="leading-none text-[#363633] select-none"
                    >
                      Full name
                    </label>
                    <input
                      id="fullName"
                      placeholder="Juan Dela Cruz"
                      type="text"
                      maxLength={255}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className={inputClass}
                    />
                  </div>

                  {/* USERNAME */}
                  <div className="flex flex-col">
                    <div className="flex justify-between leading-none text-[#363633]">
                      <label htmlFor="username" className="select-none">
                        Username
                      </label>
                      <span className="text-sm">
                        {username.length}/{USERNAME_MAX}
                      </span>
                    </div>
                    <input
                      id="username"
                      placeholder="Username"
                      type="text"
                      maxLength={USERNAME_MAX}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className={inputClass}
                    />
                  </div>

                  {/* EMAIL */}
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
                      required
                      className={inputClass}
                    />
                  </div>

                  {/* PASSWORD */}
                  <div className="flex flex-col">
                    <label
                      htmlFor="password"
                      className="leading-none text-[#363633] select-none"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      placeholder="At least 8 characters"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className={inputClass}
                    />
                  </div>

                  {/* CONFIRM PASSWORD */}
                  <div className="flex flex-col">
                    <label
                      htmlFor="confirmPassword"
                      className="leading-none text-[#363633] select-none"
                    >
                      Confirm password
                    </label>
                    <input
                      id="confirmPassword"
                      placeholder="Re-enter your password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className={inputClass}
                    />
                  </div>

                  {/* CAMPUS */}
                  <div className="flex flex-col">
                    <label
                      htmlFor="campus"
                      className="leading-none text-[#363633] select-none"
                    >
                      Campus
                    </label>
                    <select
                      id="campus"
                      value={campusId}
                      onChange={(e) => setCampusId(e.target.value)}
                      disabled={campusesLoading || !!campusesError}
                      aria-describedby="campus-warning"
                      required
                      className={`${inputClass} disabled:opacity-60`}
                    >
                      <option value="" disabled>
                        {campusesLoading
                          ? "Loading campuses..."
                          : "Select your campus"}
                      </option>
                      {campuses.map((campus) => (
                        <option key={campus.id} value={campus.id}>
                          {campus.name}
                        </option>
                      ))}
                    </select>
                    <p
                      id="campus-warning"
                      className="mt-1 flex items-center gap-1 text-sm text-[#800000]"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      Warning: this cannot be changed.
                    </p>
                    {campusesError && (
                      <p className="mt-1 text-sm text-red-600">
                        {campusesError}
                      </p>
                    )}
                  </div>

                  {error && (
                    <p className="-mt-3 text-sm text-red-600">{error}</p>
                  )}

                  <div
                    className={`group relative flex w-full cursor-pointer active:opacity-70 ${
                      submitting ? "pointer-events-none opacity-60" : ""
                    }`}
                  >
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex w-full items-center justify-center rounded-xl bg-[#071437] p-2 text-xl text-white"
                    >
                      Register
                    </button>
                    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-xl border border-[#071437] bg-white text-xl text-[#071437] transition-[clip-path,background-color,color] duration-500 [clip-path:polygon(0_0%,101%_0%,101%_101%,0_101%)] group-hover:bg-white group-hover:text-[#071437] group-hover:[clip-path:polygon(0_0%,0%_0%,0%_101%,0_101%)]">
                      {submitting ? "Please wait..." : "Register"}
                    </div>
                  </div>
                </form>
              )}
            </div>

            {!registered && (
              <p className="font-urbanist text-sm text-[#242423]">
                Already have an account?{" "}
                <Link href="/login" className="underline">
                  Login here
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
