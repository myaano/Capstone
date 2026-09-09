"use client";

import { useEffect, useState, useRef } from "react";
import Header from "../reusable_components/Header";
import Pagination from "../reusable_components/Pagination";

import { fetchPapers, updatePaper, deletePaper } from "./actions";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

//useAuthStore, authorize who can go in or not
import { useAuthStore } from "../store/useAuthStore";
//rerout someone
import { useRouter } from "next/navigation";

export default function Dashboard() {
  //rerout
  const router = useRouter();

  //check admin or not
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin";
  const isLoading = useAuthStore((state) => state.isLoading);
  useEffect(() => {
    if (!user || user.role !== "admin") {
      console.log("Unauthorized Access Detected");
      router.push("/");
    }
  }, [isLoading, user]);

  const [papers, setPapers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activePaper, setActivePaper] = useState(null); // controls the overlay

  //pagination useStates
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  //main fetching of papers from actions.js of /dashboard
  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError(null);
      try {
        const papersData = await fetchPapers(page);
        if (!cancelled) {
          setPapers(papersData.data ?? []);
        }
        console.log(papersData);
        setTotalPages(papersData.last_page ?? 1);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [page]);

  const thesisTimer = useRef(null);
  const capstoneTimer = useRef(null);
  const totalTimer = useRef(null);

  const thesisCounterValue = useRef({ value: 0 });
  const capstoneCounterValue = useRef({ value: 0 });
  const totalCounterValue = useRef({ value: 0 });

  const [Analytics, setAnalytics] = useState(null);
  //analytics feetch
  useEffect(() => {
    async function loadAnalyticsData() {
      try {
        const response = await fetch(
          "https://application-production-cfb3.up.railway.app/api/papers/analytics",
        );
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        const data = await response.json();
        setAnalytics(data);
        console.log(setAnalytics);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    }
    loadAnalyticsData();
  }, []);

  // analytics animation
  useGSAP(() => {
    if (!Analytics) return;
    gsap.registerPlugin(SplitText);

    console.log("useGSAP ran, mounting fresh");

    // on counterValue.current, change the value on whatever is the current amount of papers available to a campus or research paper so that itll count from 0 to current amount
    gsap.to(thesisCounterValue.current, {
      value: Analytics.papers_thesis,
      duration: 3,
      ease: "power2.out",
      onUpdate: () => {
        if (thesisTimer.current) {
          thesisTimer.current.textContent = Math.floor(
            thesisCounterValue.current.value,
          );
        }
      },
    });
    // on counterValue.current, change the value on whatever is the current amount of papers available to a campus or research paper so that itll count from 0 to current amount
    gsap.to(capstoneCounterValue.current, {
      value: Analytics.papers_capstone,
      duration: 3,
      ease: "power2.out",
      onUpdate: () => {
        if (capstoneTimer.current) {
          capstoneTimer.current.textContent = Math.floor(
            capstoneCounterValue.current.value,
          );
        }
      },
    });
    // campus counter animations
    gsap.to(totalCounterValue.current, {
      value: Analytics.total_papers,
      ease: "power2.out",

      onUpdate: () => {
        if (totalTimer.current) {
          totalTimer.current.textContent = Math.floor(
            totalCounterValue.current.value,
          );
        }
      },
    });
  }, [Analytics]);

  async function handleSave(updatedPaper) {
    const body = new FormData();
    body.append("title", updatedPaper.title);
    body.append("researchers", updatedPaper.researchers);
    body.append("abstract", updatedPaper.abstract);
    body.append("campus", updatedPaper.campus);
    body.append("department", updatedPaper.department);
    body.append("course", updatedPaper.course);
    body.append("year", updatedPaper.year);
    body.append("fileType", updatedPaper.paper_type);
    if (updatedPaper.newFile) {
      body.append("file", updatedPaper.newFile);
    }

    try {
      const saved = await updatePaper(updatedPaper.id, body);
      setPapers((prev) =>
        prev.map((p) => (p.id === updatedPaper.id ? saved : p)),
      );
      setActivePaper(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(paper) {
    try {
      await deletePaper(paper.id);
      setPapers((prev) => prev.filter((p) => p.id !== paper.id));
      setActivePaper(null);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="font-urbanist min-h-screen bg-amber-900">
      <Header />
      <div className="flex flex-1 flex-col bg-amber-300 px-10 py-10 text-black">
        <div className="flex flex-col">
          <h1 className="bg-blue-200 text-6xl">Dashboard</h1>

          {error && (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-16">
            {/* stat cards */}
            <div className="mt-10 flex justify-between bg-white px-10">
              <StatCard
                label="Thesis"
                color="bg-green-200"
                className=""
                ref={thesisTimer}
              />
              <StatCard
                label="Capstone"
                color="bg-green-300"
                className=""
                ref={capstoneTimer}
              />
              <StatCard
                label="Papers"
                color="bg-green-500"
                className=""
                ref={totalTimer}
              />
            </div>

            <div className="flex flex-col gap-4">
              {loading ? (
                <p className="text-sm text-gray-500">Loading papers…</p>
              ) : papers.length === 0 ? (
                <p className="text-sm text-gray-500">No papers found.</p>
              ) : (
                papers.map((paper) => (
                  <PaperCard
                    key={paper.id}
                    paper={paper}
                    isAdmin={isAdmin}
                    onView={() => setActivePaper(paper)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
        {totalPages > 1 && (
          <div className="my-5 flex items-end justify-end border-t border-black pt-5 text-black">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </div>
        )}
      </div>

      {activePaper && (
        <PaperOverlay
          paper={activePaper}
          onClose={() => setActivePaper(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, color, className, ref }) {
  return (
    <div
      className={`${color} flex h-60 w-60 flex-col justify-between rounded-2xl px-5 py-10 shadow-2xl`}
    >
      <div>
        <h1 className="leading-none font-light">Total</h1>
        <h1 className="text-3xl leading-none italic">{label}</h1>
      </div>
      <h1 ref={ref} className="flex items-end justify-end bg-blue-900 text-7xl">
        0
      </h1>
    </div>
  );
}

// one row = one card. the whole card is clickable and opens the edit/delete overlay.
function PaperCard({ paper, isAdmin, onView }) {
  return (
    <div
      className="cursor-pointer rounded-2xl border border-gray-200 bg-white p-5 shadow transition hover:border-gray-300"
      onClick={onView}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-base font-medium">{paper.title}</p>
          <p className="text-sm text-gray-500">{paper.researchers}</p>
        </div>

        {isAdmin && (
          <p className="shrink-0 text-xs text-gray-400">Click card to edit</p>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-gray-100 pt-3 sm:grid-cols-3">
        <Field label="Campus" value={paper.campus} />
        <Field label="Department" value={paper.department} />
        <Field label="Course" value={paper.course} />
        <Field label="Year" value={paper.year} />
        <Field label="File type" value={formatPaperType(paper.paper_type)} />
      </div>
    </div>
  );
}

function formatPaperType(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-[11px] text-gray-400">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

// the overlay doubles as the edit form and the delete trigger.
function PaperOverlay({ paper, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({ ...paper });
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 sm:max-w-md sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-lg font-medium text-[#242423]">Edit paper</h2>
          <button
            onClick={onClose}
            className="text-2xl leading-none text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {!confirmingDelete ? (
          <>
            <div className="flex flex-col gap-3">
              <EditField
                label="Title"
                value={form.title}
                onChange={(v) => updateField("title", v)}
              />
              <EditField
                label="Researchers"
                value={form.researchers}
                onChange={(v) => updateField("researchers", v)}
              />
              <EditTextarea
                label="Abstract"
                value={form.abstract}
                onChange={(v) => updateField("abstract", v)}
              />

              <div className="grid grid-cols-2 gap-3">
                <EditField
                  label="Campus"
                  value={form.campus}
                  onChange={(v) => updateField("campus", v)}
                />
                <EditField
                  label="Department"
                  value={form.department}
                  onChange={(v) => updateField("department", v)}
                />
                <EditField
                  label="Course"
                  value={form.course}
                  onChange={(v) => updateField("course", v)}
                />
                <EditField
                  label="Year"
                  value={form.year}
                  onChange={(v) => updateField("year", v)}
                />
                <EditField
                  label="paper_type"
                  value={form.paper_type}
                  onChange={(v) => updateField("paper_type", v)}
                />
              </div>

              <label className="block">
                <span className="text-[11px] text-gray-400">File</span>
                <p className="mb-1 text-sm text-blue-600">
                  {form.newFile ? form.newFile.name : form.file}
                </p>
                <input
                  type="file"
                  onChange={(e) => updateField("newFile", e.target.files[0])}
                  className="text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              </label>
            </div>

            <div className="mt-6 flex gap-2 border-t border-gray-100 pt-4">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Submit edit"}
              </button>
              <button
                onClick={() => setConfirmingDelete(true)}
                className="flex-1 rounded-md border border-red-300 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </>
        ) : (
          <div className="pt-2">
            <p className="text-base font-medium">Confirm delete?</p>
            <p className="mt-1 text-sm text-gray-500">This cannot be undone.</p>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setConfirmingDelete(false)}
                className="flex-1 rounded-md border border-gray-300 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => onDelete(paper)}
                className="flex-1 rounded-md bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Yes, delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EditField({ label, value, onChange }) {
  return (
    <label className="block text-black">
      <span className="text-[11px] text-[#242423]">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-0.5 w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm focus:border-gray-400 focus:outline-none"
      />
    </label>
  );
}

function EditTextarea({ label, value, onChange }) {
  return (
    <label className="block text-black">
      <span className="text-[11px] text-[#242423]">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="mt-0.5 w-full resize-none rounded-md border border-gray-200 px-2 py-1.5 text-sm focus:border-gray-400 focus:outline-none"
      />
    </label>
  );
}
