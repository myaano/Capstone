"use client";
import Image from "next/image";
import Rizal from "../../../public/Rizal.jpg";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/useAuthStore";

const API = "https://capstone-backend-1yta.onrender.com/api";
const USERNAME_MAX = 10;

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

// The login token goes along, so Laravel knows whose credentials these are
async function post(path, body) {
  const token = localStorage.getItem("token");
  return fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

// One labelled input row
function Field({ id, label, right, children }) {
  return (
    <div className="flex flex-col">
      <div className="flex justify-between leading-none text-[#363633]">
        <label htmlFor={id} className="select-none">
          {label}
        </label>
        {right}
      </div>
      {children}
    </div>
  );
}

// Campus admins only. One form: the credentials go to Laravel, and Laravel
// emails a verification link to the SorSU email that was typed.
export default function ChangePassword() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const isLoadingAuth = useAuthStore((s) => s.isLoading);
  const isCampusAdmin = user?.role === "campus_admin" || user?.role === "admin";

  // only campus admins belong here
  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isCampusAdmin) router.replace("/");
  }, [isLoadingAuth, isCampusAdmin, router]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState(""); // success message from the backend
  const [loading, setLoading] = useState(false);

  // start from the details already on the account (never overwrites typing)
  useEffect(() => {
    if (!user) return;
    setName((v) => v || user.name || "");
    setUsername((v) => v || user.username || "");
    setEmail((v) => v || user.email || "");
  }, [user]);

  // POST /account/setup-credentials
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await post("/account/setup-credentials", {
        current_password: currentPassword,
        name,
        username,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      if (!res.ok) {
        setError(await backendError(res));
        return;
      }
      const data = await res.json().catch(() => ({}));
      setInfo(data.message || "");

      // refresh the stored user from Laravel so the profile menu shows the truth
      // (for example must_change_credentials); nothing is assumed here
      try {
        const token = localStorage.getItem("token");
        const meRes = await fetch(`${API}/users`, {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (meRes.ok) {
          const me = await meRes.json();
          setUser(me?.data ?? me?.user ?? me);
        }
      } catch {
        // the saved credentials are fine; the menu catches up on the next refresh
      }
      setDone(true);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingAuth || !isCampusAdmin) {
    return (
      <div className="font-urbanist flex h-screen items-center justify-center bg-[#800000] text-white">
        Loading...
      </div>
    );
  }

  const canGoToDashboard = Boolean(user) && !user.must_change_credentials;

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
                  {done ? "Check your email" : "Change password"}
                </p>
                <p className="font-urbanist text-[14px] text-[#363633] select-none">
                  {done
                    ? `Your password was updated. We sent a verification link to ${email}. Open it to verify your email.`
                    : "Enter your current password, check your details and choose a new password. We'll email a verification link to your SorSU email."}
                </p>
              </div>

              {done ? (
                <div className="font-urbanist flex flex-col gap-4 pt-7">
                  {info && (
                    <p role="status" className="text-sm text-[#363633]">
                      {info}
                    </p>
                  )}
                  <PrimaryButton
                    type="button"
                    loading={false}
                    onClick={() =>
                      router.push(canGoToDashboard ? "/dashboard" : "/")
                    }
                  >
                    {canGoToDashboard ? "Go to dashboard" : "Back to home"}
                  </PrimaryButton>
                </div>
              ) : (
                <form
                  noValidate
                  onSubmit={handleSubmit}
                  className="font-urbanist flex flex-col gap-5 pt-7"
                >
                  <Field id="current_password" label="Current password">
                    <input
                      id="current_password"
                      placeholder="Current password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={inputClass}
                    />
                  </Field>

                  <Field id="name" label="Name">
                    <input
                      id="name"
                      placeholder="Full name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass}
                    />
                  </Field>

                  <Field
                    id="username"
                    label="Username"
                    right={
                      <span className="text-sm">
                        {username.length}/{USERNAME_MAX}
                      </span>
                    }
                  >
                    <input
                      id="username"
                      placeholder="Username"
                      type="text"
                      autoComplete="username"
                      maxLength={USERNAME_MAX}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={inputClass}
                    />
                  </Field>

                  <Field id="email" label="SorSU Email">
                    <input
                      id="email"
                      placeholder="email@sorsu.edu.ph"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                    />
                    <p className="pt-1 text-xs text-[#999595]">
                      A verification link will be sent to this email.
                    </p>
                  </Field>

                  <Field id="password" label="New password">
                    <div className="relative">
                      <input
                        id="password"
                        placeholder="New password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                  </Field>

                  <Field
                    id="password_confirmation"
                    label="Confirm new password"
                  >
                    <input
                      id="password_confirmation"
                      placeholder="Re-enter your new password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      className={inputClass}
                    />
                  </Field>

                  {error && (
                    <p role="alert" className="-mt-2 text-sm text-red-600">
                      {error}
                    </p>
                  )}
                  <PrimaryButton loading={loading}>
                    Save and verify
                  </PrimaryButton>
                </form>
              )}

              {!done && (
                <p className="font-urbanist pt-6 text-sm text-[#363633]">
                  Changed your mind?{" "}
                  <Link href="/" className="text-[#071437] underline">
                    Back to home
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
