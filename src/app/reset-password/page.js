"use client";
import Image from "next/image";
import Rizal from "../../../public/Rizal.jpg";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

// Left photo + quote panel
function PhotoPanel() {
  return (
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
          If Knowledge is the heritage of mankind, only the brave inherit it.
        </p>
        <p className="text-2xl font-light">— Jose Rizal, Noli Me Tangere</p>
      </div>
    </div>
  );
}

// Logo + titles
function Header({ title, subtitle }) {
  return (
    <>
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
        <p className="font-urbanist text-[14px] text-[#363633]">{subtitle}</p>
      </div>
    </>
  );
}

// Step 2: the link in the verification email lands here, e.g.
//   /reset-password?token=abc123&email=juan@sorsu.edu.ph
// Arriving through that link is the proof that the user owns the email, so
// all that's left is choosing a new password.
export default function ResetPassword() {
  const router = useRouter();

  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Read token + email from the link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") ?? "");
    setEmail(params.get("email") ?? "");
  }, []);

  // POST /reset-password
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await post("/reset-password", {
        token,
        email,
        password: newPassword,
        password_confirmation: confirmPassword,
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

  return (
    <div className="h-screen bg-[#800000] px-10 py-12">
      <div className="flex h-full rounded-2xl">
        <PhotoPanel />

        <div className="flex flex-1 items-center justify-center overflow-y-auto rounded-2xl bg-white px-2 py-6 lg:rounded-l-none lg:rounded-r-2xl lg:px-10">
          <div className="my-auto flex w-[90%] flex-col gap-5">
            <div>
              <Header
                title={done ? "Password updated" : "New password"}
                subtitle={
                  done
                    ? info || "You can now log in with your new password."
                    : email
                      ? `Email verified. Choose a new password for ${email}.`
                      : "Choose a new password for your account."
                }
              />

              {done ? (
                <div className="font-urbanist pt-7">
                  <PrimaryButton
                    type="button"
                    loading={false}
                    onClick={() => router.push("/login")}
                  >
                    Back to login
                  </PrimaryButton>
                </div>
              ) : (
                <form
                  noValidate
                  onSubmit={handleSubmit}
                  className="font-urbanist flex flex-col gap-7 pt-7"
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
                        autoComplete="new-password"
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
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  {error && (
                    <p role="alert" className="-mt-4 text-sm text-red-600">
                      {error}
                    </p>
                  )}
                  <PrimaryButton loading={loading}>
                    Reset password
                  </PrimaryButton>
                </form>
              )}
            </div>

            {!done && (
              <p className="font-urbanist text-sm text-[#363633]">
                Link not working?{" "}
                <Link
                  href="/forgot-password"
                  className="text-[#071437] underline"
                >
                  Request a new one
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
