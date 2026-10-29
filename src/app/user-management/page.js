"use client";

import Header from "../reusable_components/Header";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/useAuthStore";

const API = "https://capstone-backend-1yta.onrender.com/api/admin/users";
const USERS_URL = API; // GET list, PUT/DELETE /{id}
const CAMPUS_ADMINS_URL =
  "https://capstone-backend-1yta.onrender.com/api/admin/campus-admins"; // POST: add an admin
const LOCATIONS_URL =
  "https://capstone-backend-1yta.onrender.com/api/locations";
const USERNAME_MAX = 10;
// every new admin starts with this password and is told to change it
const DEFAULT_ADMIN_PASSWORD = "12345678";

// Shows the backend's own error: first Laravel field error, else `message`
async function backendError(res) {
  const data = await res.json().catch(() => null);
  const firstFieldError = data?.errors
    ? Object.values(data.errors)[0]?.[0]
    : null;
  return firstFieldError || data?.message || `Request failed (${res.status})`;
}

function authHeaders(withBody = false) {
  const token = localStorage.getItem("token");
  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
    ...(withBody ? { "Content-Type": "application/json" } : {}),
  };
}

// "super admin" | "admin" | "student" (tolerates super_admin / campus_admin)
function roleKey(u) {
  const r = String(u?.role ?? "")
    .toLowerCase()
    .replace(/_/g, " ");
  if (r.includes("super")) return "super admin";
  if (r.includes("admin")) return "admin";
  return "student";
}

const ROLE_LABEL = {
  "super admin": "Super Admin",
  admin: "Admin",
  student: "Student",
};

const campusIdOf = (u) => u?.campus_id ?? u?.campus?.id ?? null;

const inputClass =
  "w-full rounded-lg border border-[#242423] bg-[#fffff6] px-3 py-2 placeholder:text-[#999595]";

function RoleBadge({ account }) {
  const key = roleKey(account);
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-xs font-semibold ${
        key === "student"
          ? "border-[#242423] text-[#242423]"
          : "border-[#800000] bg-[#800000] text-white"
      }`}
    >
      {ROLE_LABEL[key]}
    </span>
  );
}

// The backend stores this in the `status` column ("active" / "inactive")
const ACTIVE = "active";
const INACTIVE = "inactive";
const isActive = (u) => String(u?.status ?? ACTIVE).toLowerCase() === ACTIVE;

function StatusBadge({ account }) {
  const active = isActive(account);
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-xs font-semibold ${
        active
          ? "border-green-700 bg-green-50 text-green-700"
          : "border-red-700 bg-red-50 text-red-700"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function OutlineButton({
  children,
  onClick,
  disabled,
  danger,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`border px-3 py-2 text-sm transition-colors duration-200 disabled:opacity-50 ${
        danger
          ? "border-[#800000] bg-white text-[#800000] hover:bg-[#800000] hover:text-white"
          : "border-[#242423] bg-white text-[#242423] hover:bg-[#242423] hover:text-white"
      } ${className}`}
    >
      {children}
    </button>
  );
}

// Bottom sheet on phones, centered dialog on larger screens
function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:px-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="font-urbanist max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 sm:max-w-md sm:rounded-none sm:p-6"
      >
        <p className="font-bona_nova text-2xl text-[#242423]">{title}</p>
        {children}
      </div>
    </div>
  );
}

//admin modal: add a new admin. Editing accounts is not done from this page.
function AccountFormModal({
  presetCampusId, // when adding from a campus card
  campuses,
  adminByCampus, // Map(campusId -> admin account)
  onClose,
  onSaved,
}) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [campusId, setCampusId] = useState(String(presetCampusId ?? ""));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      // no role field: the backend's createCampusAdmin makes the account an admin
      const body = {
        name,
        username,
        email,
        campus_id: Number(campusId) || campusId,
        // every new admin starts with the fixed default password
        password: DEFAULT_ADMIN_PASSWORD,
        password_confirmation: DEFAULT_ADMIN_PASSWORD, // backend uses the `confirmed` rule
      };

      const res = await fetch(CAMPUS_ADMINS_URL, {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setError(await backendError(res));
        return;
      }
      await onSaved();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Add Admin" onClose={onClose}>
      <form
        noValidate
        onSubmit={handleSubmit}
        className="mt-4 flex flex-col gap-4 text-[#242423]"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="acc-name" className="text-sm">
            Name
          </label>
          <input
            id="acc-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="acc-username"
            className="flex justify-between text-sm"
          >
            <span>Username</span>
            <span className="text-[#999595]">
              {username.length}/{USERNAME_MAX}
            </span>
          </label>
          <input
            id="acc-username"
            value={username}
            maxLength={USERNAME_MAX}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="acc-email" className="text-sm">
            SorSU email
          </label>
          <input
            id="acc-email"
            type="email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@sorsu.edu.ph"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="acc-campus" className="text-sm">
            Campus
          </label>
          <select
            id="acc-campus"
            value={campusId}
            onChange={(e) => setCampusId(e.target.value)}
            className={inputClass}
          >
            <option value="" disabled>
              Select a campus
            </option>
            {campuses.map((c) => {
              // one admin per campus
              const taken = adminByCampus.has(String(c.id));
              return (
                <option key={c.id} value={c.id} disabled={taken}>
                  {c.name}
                  {taken ? " (already has an admin)" : ""}
                </option>
              );
            })}
          </select>
          <p className="text-xs text-[#999595]">Only one admin per campus.</p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="acc-password-default" className="text-sm">
            Password
          </label>
          <input
            id="acc-password-default"
            type="text"
            value={DEFAULT_ADMIN_PASSWORD}
            readOnly
            aria-readonly="true"
            className="w-full cursor-not-allowed rounded-lg border border-[#e5e5e5] bg-[#f5f5f5] px-3 py-2 text-[#555] select-all"
          />
          <p
            role="note"
            className="border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-900"
          >
            <span className="font-semibold">Warning:</span> the default password
            is <span className="font-semibold">12345678</span>. The admin should
            change it as soon as they log in.
          </p>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <OutlineButton onClick={onClose} disabled={saving}>
            Cancel
          </OutlineButton>
          <button
            type="submit"
            disabled={saving}
            className="border border-[#800000] bg-[#800000] px-4 py-2 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Add admin"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ---------------------------------------------------------------------
// Deactivate confirmation modal
// ---------------------------------------------------------------------
function DeactivateModal({ account, busy, onClose, onConfirm }) {
  const isAdmin = roleKey(account) === "admin";
  return (
    <Modal
      title={isAdmin ? "Deactivate admin?" : "Deactivate account?"}
      onClose={busy ? () => {} : onClose}
    >
      <p className="mt-3 text-[#242423]">
        <span className="font-semibold">{account.name}</span>
        {account.email && (
          <>
            {" "}
            (<span className="break-all">{account.email}</span>)
          </>
        )}{" "}
        won&apos;t be able to log in until the account is reactivated.
      </p>
      <p className="mt-2 text-sm text-[#999595]">
        Any session they have open will also stop working.
      </p>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <OutlineButton onClick={onClose} disabled={busy}>
          Cancel
        </OutlineButton>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="border border-[#800000] bg-[#800000] px-4 py-2 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Deactivating..." : "Deactivate"}
        </button>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------
// page
// ---------------------------------------------------------------------
export default function UserManagement() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoadingAuth = useAuthStore((s) => s.isLoading);
  const isSuperAdmin = roleKey(user) === "super admin" && Boolean(user);

  const [accounts, setAccounts] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");
  const [campusFilter, setCampusFilter] = useState("All");

  const [formModal, setFormModal] = useState(null); // { presetCampusId? } while the Add Admin modal is open
  const [busyId, setBusyId] = useState(null); // account id being (de)activated
  const [toDeactivate, setToDeactivate] = useState(null); // account awaiting confirmation
  const [statusError, setStatusError] = useState("");

  // only the super admin may be on this page
  useEffect(() => {
    if (isLoadingAuth) return;
    if (!isSuperAdmin) router.push("/");
  }, [isLoadingAuth, isSuperAdmin, router]);

  const load = useCallback(async () => {
    setLoadError("");
    try {
      const [usersRes, campusesRes] = await Promise.all([
        fetch(USERS_URL, { headers: authHeaders() }), // GET /api/admin/users
        fetch(LOCATIONS_URL, { headers: { Accept: "application/json" } }), // GET /api/locations
      ]);
      if (!usersRes.ok) throw new Error(await backendError(usersRes));
      if (!campusesRes.ok) throw new Error(await backendError(campusesRes));

      const usersJson = await usersRes.json();
      const campusesJson = await campusesRes.json();
      const userList = Array.isArray(usersJson)
        ? usersJson
        : (usersJson.users ?? usersJson.data);
      const campusList = Array.isArray(campusesJson)
        ? campusesJson
        : (campusesJson.campuses ?? campusesJson.data);

      setAccounts(Array.isArray(userList) ? userList : []);
      setCampuses(Array.isArray(campusList) ? campusList : []);
    } catch (err) {
      setLoadError(err.message || "Could not load accounts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSuperAdmin) load();
  }, [isSuperAdmin, load]);

  const campusName = useCallback(
    (a) =>
      a.campus?.name ??
      campuses.find((c) => String(c.id) === String(campusIdOf(a)))?.name ??
      "-",
    [campuses],
  );

  // campusId -> its admin (one per campus)
  const adminByCampus = useMemo(() => {
    const map = new Map();
    accounts.forEach((a) => {
      if (roleKey(a) === "admin" && campusIdOf(a) != null) {
        map.set(String(campusIdOf(a)), a);
      }
    });
    return map;
  }, [accounts]);

  const allCampusesHaveAdmin =
    campuses.length > 0 &&
    campuses.every((c) => adminByCampus.has(String(c.id)));

  // students only; admins have their own section
  const allStudents = useMemo(
    () => accounts.filter((a) => roleKey(a) === "student"),
    [accounts],
  );

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allStudents.filter((a) => {
      const matchesSearch =
        !q ||
        (a.name ?? "").toLowerCase().includes(q) ||
        (a.username ?? "").toLowerCase().includes(q) ||
        (a.email ?? "").toLowerCase().includes(q);
      const matchesCampus =
        campusFilter === "All" || String(campusIdOf(a)) === campusFilter;
      return matchesSearch && matchesCampus;
    });
  }, [allStudents, search, campusFilter]);

  async function afterChange() {
    setFormModal(null);
    await load();
  }

  async function toggleStatus(a) {
    const next = !isActive(a);
    setStatusError("");
    setBusyId(a.id);
    try {
      const res = await fetch(`${USERS_URL}/${a.id}`, {
        method: "PUT",
        headers: authHeaders(true),
        body: JSON.stringify({ status: next ? ACTIVE : INACTIVE }),
      });
      if (!res.ok) {
        setStatusError(await backendError(res));
        return;
      }
      // use the status the server actually saved, not what we asked for
      const data = await res.json().catch(() => null);
      const saved = data?.user?.status ?? (next ? ACTIVE : INACTIVE);
      setAccounts((prev) =>
        prev.map((u) => (u.id === a.id ? { ...u, status: saved } : u)),
      );
    } catch {
      setStatusError("Could not reach the server. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  // deactivating asks first; activating goes straight through
  function requestToggle(a) {
    if (isActive(a)) setToDeactivate(a);
    else toggleStatus(a);
  }

  async function confirmDeactivate() {
    await toggleStatus(toDeactivate);
    setToDeactivate(null);
  }

  if (isLoadingAuth || !isSuperAdmin) {
    return (
      <>
        <Header />
        <div className="font-urbanist flex min-h-screen items-center justify-center bg-white text-[#999595]">
          Loading...
        </div>
      </>
    );
  }

  // Activate / Deactivate button for one account (none for the super admin)
  const renderActions = (a) => {
    if (roleKey(a) === "super admin") {
      return <span className="text-sm text-[#999595]">-</span>;
    }
    return (
      <div className="flex gap-2">
        <OutlineButton
          danger={isActive(a)}
          disabled={busyId === a.id}
          onClick={() => requestToggle(a)}
          className="flex-1 md:flex-none"
        >
          {busyId === a.id ? "..." : isActive(a) ? "Deactivate" : "Activate"}
        </OutlineButton>
      </div>
    );
  };

  return (
    <>
      <Header />

      <div className="font-urbanist min-h-screen bg-white px-4 py-8 text-[#242423] sm:px-6 lg:px-10">
        {/* Title */}
        <div className="mb-8">
          <p className="font-bona_nova text-2xl sm:text-3xl">User Management</p>
          <p className="text-sm text-[#999595]">
            Manage campus admins and student accounts across all campuses.
          </p>
        </div>

        {loadError && (
          <div
            role="alert"
            className="mb-6 flex flex-col gap-2 border border-red-300 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>{loadError}</span>
            <OutlineButton onClick={load}>Retry</OutlineButton>
          </div>
        )}

        {statusError && (
          <div
            role="alert"
            className="mb-6 border border-red-300 bg-red-50 p-4 text-sm text-red-700"
          >
            {statusError}
          </div>
        )}

        {/* ADMIN ACCOUNTS: one card per campus */}
        <section aria-labelledby="admins-heading" className="mb-10">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p
                id="admins-heading"
                className="font-bona_nova_sc text-xl sm:text-2xl"
              >
                Admin Accounts
              </p>
              <p className="text-sm text-[#999595]">One admin per campus.</p>
            </div>
            <div className="flex flex-col items-start gap-1 sm:items-end">
              <button
                onClick={() => setFormModal({})}
                disabled={
                  loading || allCampusesHaveAdmin || campuses.length === 0
                }
                className="w-full border border-[#800000] bg-[#800000] px-4 py-2 text-white transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
              >
                + Add admin
              </button>
              {allCampusesHaveAdmin && (
                <p className="text-xs text-[#999595]">
                  Every campus already has an admin.
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {loading &&
              [0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-40 animate-pulse border border-[#e5e5e5] bg-[#f5f5f5]"
                />
              ))}
            {!loading &&
              campuses.map((c) => {
                const admin = adminByCampus.get(String(c.id));
                const studentCount = allStudents.filter(
                  (a) => String(campusIdOf(a)) === String(c.id),
                ).length;
                return (
                  <div
                    key={c.id}
                    className="flex flex-col gap-3 border border-[#800000] bg-[#fffff6] p-4 sm:p-5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-lg font-semibold">{c.name}</p>
                      <span className="shrink-0 rounded-full bg-[#800000] px-2 py-0.5 text-xs font-semibold text-white">
                        {studentCount}{" "}
                        {studentCount === 1 ? "student" : "students"}
                      </span>
                    </div>

                    {admin ? (
                      <div className="min-w-0">
                        <p className="font-semibold">{admin.name}</p>
                        {admin.username && (
                          <p className="text-sm text-[#999595]">
                            @{admin.username}
                          </p>
                        )}
                        <p className="text-sm break-all text-[#999595]">
                          {admin.email}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          <RoleBadge account={admin} />
                          <StatusBadge account={admin} />
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-[#999595]">
                        No admin assigned
                      </p>
                    )}

                    <div className="mt-auto flex gap-2">
                      {admin ? (
                        <>
                          <OutlineButton
                            danger={isActive(admin)}
                            disabled={busyId === admin.id}
                            className="flex-1"
                            onClick={() => requestToggle(admin)}
                          >
                            {busyId === admin.id
                              ? "..."
                              : isActive(admin)
                                ? "Deactivate"
                                : "Activate"}
                          </OutlineButton>
                        </>
                      ) : (
                        <OutlineButton
                          className="flex-1"
                          onClick={() => setFormModal({ presetCampusId: c.id })}
                        >
                          + Add admin
                        </OutlineButton>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        <hr className="mb-8 border-[#800000]/20" />

        {/* STUDENT ACCOUNTS */}
        <section aria-labelledby="students-heading">
          <p
            id="students-heading"
            className="font-bona_nova_sc text-xl sm:text-2xl"
          >
            Student Accounts
          </p>
          <p className="mb-4 text-sm text-[#999595]">
            {loading
              ? "Loading..."
              : `${allStudents.length} ${allStudents.length === 1 ? "student" : "students"} registered.`}
          </p>

          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto]">
            <input
              type="search"
              placeholder="Search name, username or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${inputClass} sm:col-span-2 lg:col-span-1`}
            />
            <select
              value={campusFilter}
              onChange={(e) => setCampusFilter(e.target.value)}
              className={inputClass}
              aria-label="Filter by campus"
            >
              <option value="All">All campuses</option>
              {campuses.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Phones: one card per student */}
          <div className="flex flex-col gap-3 md:hidden">
            {!loading && filteredStudents.length === 0 && (
              <p className="border border-[#e5e5e5] px-4 py-10 text-center text-[#999595]">
                No students found.
              </p>
            )}
            {filteredStudents.map((a) => (
              <div
                key={a.id}
                className="flex flex-col gap-3 border border-[#e5e5e5] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold">{a.name}</p>
                    {a.username && (
                      <p className="text-sm text-[#999595]">@{a.username}</p>
                    )}
                  </div>
                </div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                  <dt className="text-[#999595]">Email</dt>
                  <dd className="break-all">{a.email}</dd>
                  <dt className="text-[#999595]">Campus</dt>
                  <dd>{campusName(a)}</dd>
                  <dt className="text-[#999595]">Status</dt>
                  <dd>
                    <StatusBadge account={a} />
                  </dd>
                </dl>
                {renderActions(a)}
              </div>
            ))}
          </div>

          {/* Tablets and desktops: table */}
          <div className="hidden overflow-x-auto border border-[#242423] md:block">
            <table className="w-full text-left">
              <thead className="bg-[#242423] text-white">
                <tr>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">SorSU email</th>
                  <th className="px-4 py-3 font-semibold">Campus</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {!loading && filteredStudents.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-[#999595]"
                    >
                      No students found.
                    </td>
                  </tr>
                )}
                {filteredStudents.map((a) => (
                  <tr
                    key={a.id}
                    className="border-t border-[#e5e5e5] hover:bg-[#fffff6]"
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold">{a.name}</p>
                      {a.username && (
                        <p className="text-sm text-[#999595]">@{a.username}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 break-all">{a.email}</td>
                    <td className="px-4 py-3">{campusName(a)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge account={a} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">{renderActions(a)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-sm text-[#999595]">
            Showing {filteredStudents.length} of {allStudents.length} students
          </p>
        </section>
      </div>

      {toDeactivate && (
        <DeactivateModal
          account={toDeactivate}
          busy={busyId === toDeactivate.id}
          onClose={() => setToDeactivate(null)}
          onConfirm={confirmDeactivate}
        />
      )}

      {formModal && (
        <AccountFormModal
          presetCampusId={formModal.presetCampusId}
          campuses={campuses}
          adminByCampus={adminByCampus}
          onClose={() => setFormModal(null)}
          onSaved={afterChange}
        />
      )}
    </>
  );
}
