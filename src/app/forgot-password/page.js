"use client";
import Image from "next/image";
import Rizal from "../../../public/Rizal.jpg";
import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const API = "https://capstone-backend-1yta.onrender.com/api";

// Name of the field the backend expects for the emailed code.
// Laravel's default is `token`; change this if your controller uses `code`.
const CODE_FIELD = "token";

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

// Steps: "email" -> "reset" (code + new password) -> "done"
export default function ForgotPassword() {
  const router = useRouter();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState(""); // success message from the backend
  const [loading, setLoading] = useState(false);
  const codeRefs = useRef([]);

  // POST /forgot-password: the backend emails the code to the user.
  // Used by the first step and by "Resend code".
  const requestCode = async () => {
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
    if (await requestCode()) setStep("reset");
  };

  const handleResend = async () => {
    if (await requestCode()) {
      setCode(["", "", "", "", "", ""]);
      codeRefs.current[0]?.focus();
    }
  };

  // POST /reset-password: code + new password in one request
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await post("/reset-password", {
        email,
        [CODE_FIELD]: code.join(""),
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      if (!res.ok) {
        setError(await backendError(res));
        return;
      }
      const data = await res.json().catch(() => ({}));
      setInfo(data.message || "");
      setStep("done");
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Code input helpers (one box per digit)
  const handleCodeChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...code];
    next[index] = value;
    setCode(next);
    if (value && index < 5) codeRefs.current[index + 1]?.focus();
  };

  const handleCodeKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    setCode(pasted.split("").concat(Array(6).fill("")).slice(0, 6));
    codeRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const titles = {
    email: [
      "Forgot password",
      "Enter your SorSU email and we'll send you a verification code.",
    ],
    reset: [
      "Reset password",
      `Enter the code we sent to ${email} and choose a new password.`,
    ],
    done: [
      "Password updated",
      info || "You can now log in with your new password.",
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
                  <PrimaryButton loading={loading}>Send code</PrimaryButton>
                </form>
              )}

              {/* STEP 2: CODE + NEW PASSWORD */}
              {step === "reset" && (
                <form
                  noValidate
                  onSubmit={handleResetPassword}
                  className="font-urbanist flex flex-col gap-6 pt-7"
                >
                  <div className="flex flex-col gap-2">
                    <p className="leading-none text-[#363633] select-none">
                      Verification code
                    </p>
                    <div className="flex gap-2" onPaste={handleCodePaste}>
                      {code.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => (codeRefs.current[i] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleCodeChange(e.target.value, i)}
                          onKeyDown={(e) => handleCodeKeyDown(e, i)}
                          aria-label={`Digit ${i + 1}`}
                          className="h-12 w-full max-w-12 rounded-lg border border-[#363633] bg-[#fffff6] text-center text-xl text-[#363633] outline-[#363633]"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-[#999595]">
                      Didn&apos;t get it?{" "}
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={loading}
                        className="text-[#071437] underline disabled:opacity-50"
                      >
                        Resend code
                      </button>
                    </p>
                  </div>

                  <div className="flex flex-col">
                    <label
                      htmlFor="newPassword"
                      className="leading-none text-[#363633] select-none"
                    >
                      New password
                    </label>
                    <div className="relative">
                      <input
                        id="newPassword"
                        placeholder="New password"
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`${inputClass} w-full pr-14`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute inset-y-0 right-2 text-sm text-[#515050]"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label
                      htmlFor="confirmPassword"
                      className="leading-none text-[#363633] select-none"
                    >
                      Confirm new password
                    </label>
                    <input
                      id="confirmPassword"
                      placeholder="Re-enter your password"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  {info && !error && (
                    <p role="status" className="-mt-3 text-sm text-[#363633]">
                      {info}
                    </p>
                  )}
                  {error && (
                    <p role="alert" className="-mt-3 text-sm text-red-600">
                      {error}
                    </p>
                  )}
                  <PrimaryButton loading={loading}>
                    Reset password
                  </PrimaryButton>
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setInfo("");
                      setStep("email");
                    }}
                    className="-mt-3 text-sm text-[#363633] underline"
                  >
                    Use a different email
                  </button>
                </form>
              )}

              {/* STEP 3: DONE */}
              {step === "done" && (
                <div className="font-urbanist flex flex-col gap-7 pt-7">
                  <PrimaryButton
                    type="button"
                    loading={false}
                    onClick={() => router.push("/login")}
                  >
                    Back to login
                  </PrimaryButton>
                </div>
              )}

              {step !== "done" && (
                <p className="font-urbanist pt-6 text-sm text-[#363633]">
                  Remembered it?{" "}
                  <Link href="/login" className="text-[#071437] underline">
                    Back to login
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
