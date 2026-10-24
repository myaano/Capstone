"use client";
import Image from "next/image";
import Rizal from "../../../public/Rizal.jpg";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API = "https://capstone-backend-1yta.onrender.com/api";

async function backendError(res) {
  const data = await res.json().catch(() => null);
  const firstFieldError = data?.errors
    ? Object.values(data.errors)[0]?.[0]
    : null;
  return firstFieldError || data?.message || `Request failed (${res.status})`;
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

// The emailed link looks like: /reset-password?token=XXXX&email=name@sorsu.edu.ph
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [done, setDone] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  // The link is broken if the token or email is missing from the URL
  const linkInvalid = !token || !email;

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          token,
          email,
          password: newPassword,
          password_confirmation: confirmPassword,
        }),
      });
      if (!res.ok) {
        setError(await backendError(res));
        return;
      }
      const data = await res.json().catch(() => ({}));
      setInfo(data.message || "");
      setDone(true);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  let title = "Reset password";
  let subtitle = `Choose a new password for ${email}.`;
  if (linkInvalid) {
    title = "Invalid link";
    subtitle = "This reset link is incomplete. Please request a new one.";
  } else if (done) {
    title = "Password updated";
    subtitle = info || "You can now log in with your new password.";
  }

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
              <p className="font-urbanist my-1 text-[14px] text-[#999595] select-none">
                SORSOGON STATE UNIVERSITY
              </p>
              <div className="inline-flex flex-col gap-1">
                <p className="font-cormorant_infant text-5xl leading-none text-[#363633] select-none">
                  {title}
                </p>
                <p className="font-urbanist text-[14px] text-[#363633] select-none">
                  {subtitle}
                </p>
              </div>

              {/* BAD LINK */}
              {linkInvalid && (
                <div className="font-urbanist flex flex-col gap-7 pt-7">
                  <PrimaryButton
                    type="button"
                    loading={false}
                    onClick={() => router.push("/forgot-password")}
                  >
                    Request a new link
                  </PrimaryButton>
                </div>
              )}

              {/* NEW PASSWORD FORM */}
              {!linkInvalid && !done && (
                <form
                  noValidate
                  onSubmit={handleResetPassword}
                  className="font-urbanist flex flex-col gap-6 pt-7"
                >
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

                  {error && (
                    <p role="alert" className="-mt-3 text-sm text-red-600">
                      {error}
                    </p>
                  )}
                  <PrimaryButton loading={loading}>
                    Reset password
                  </PrimaryButton>
                </form>
              )}

              {/* DONE */}
              {!linkInvalid && done && (
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

              {!done && (
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

// useSearchParams must be wrapped in <Suspense> in the App Router
export default function ResetPassword() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
