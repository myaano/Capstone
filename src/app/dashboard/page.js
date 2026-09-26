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

// campus/college/program/category on a paper are nested { id, name } objects
// — render the name instead of handing React the raw object.
function fieldLabel(value) {
  if (value && typeof value === "object") return value.name ?? "";
  return value ?? "";
}

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
          "https://capstone-backend-1yta.onrender.com/api/analytics",
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
    body.append("year", updatedPaper.year);
    body.append("paper_type", updatedPaper.paper_type);
    // campus/college/program/category aren't editable from this form yet
    // (they need real dropdowns, not text input) - send the existing ids
    // back unchanged so the update doesn't blank out these relations
    body.append("campus_id", updatedPaper.campus_id);
    body.append("college_id", updatedPaper.college_id);
    body.append("program_id", updatedPaper.program_id);
    body.append("category_id", updatedPaper.category_id);
    if (updatedPaper.newFile) {
      body.append("file", updatedPaper.newFile);
    }

    // returns a result object instead of touching page-level state, so
    // the overlay can show its own success/error message and decide
    // when to close itself
    try {
      const saved = await updatePaper(updatedPaper.id, body);
      setPapers((prev) =>
        prev.map((p) => (p.id === updatedPaper.id ? saved : p)),
      );
      return { success: true, message: "Paper updated successfully." };
    } catch (err) {
      return {
        success: false,
        message: err.message || "Failed to update paper.",
      };
    }
  }

  async function handleDelete(paper) {
    try {
      await deletePaper(paper.id);
      setPapers((prev) => prev.filter((p) => p.id !== paper.id));
      return { success: true, message: "Paper deleted." };
    } catch (err) {
      return {
        success: false,
        message: err.message || "Failed to delete paper.",
      };
    }
  }

  return (
    <div className="font-urbanist min-h-screen bg-white">
      <Header />
      <div className="mx-auto flex max-w-6xl flex-1 flex-col px-6 py-10 text-black sm:px-10">
        <div className="flex flex-col">
          <div className="flex flex-col gap-1 border-b border-black/10 pb-6">
            <p className="text-xs tracking-[0.2em] text-[#242423]/50 uppercase">
              Overview
            </p>
            <h1 className="font-cormorant_infant text-6xl text-[#800000]">
              Dashboard
            </h1>
          </div>

          {error && (
            <p className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-16">
            {/* stat cards */}
            <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-black/10 bg-black/10 sm:grid-cols-3">
              <StatCard label="Thesis" ref={thesisTimer} />
              <StatCard label="Capstone" ref={capstoneTimer} />
              <StatCard label="Papers" ref={totalTimer} />
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
          <div className="my-5 flex items-end justify-end border-t border-black/10 pt-5 text-black">
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

function StatCard({ label, ref }) {
  return (
    <div className="flex h-52 flex-col justify-between bg-white px-6 py-8">
      <div>
        <p className="text-xs leading-none font-light tracking-wide text-[#242423]/50 uppercase">
          Total
        </p>
        <p className="font-cormorant_infant text-3xl leading-none text-[#800000] italic">
          {label}
        </p>
      </div>
      <h1
        ref={ref}
        className="text-right text-7xl leading-none font-light tabular-nums"
      >
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
        <Field label="Campus" value={fieldLabel(paper.campus)} />
        <Field label="Department" value={fieldLabel(paper.college)} />
        <Field label="Course" value={fieldLabel(paper.program)} />
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
  // campus/college/program on `paper` are nested { id, name } objects -
  // pull out plain values for the editable fields, and keep the ids
  // around unchanged so handleSave can send them back even though
  // they're not editable here yet
  const [form, setForm] = useState({
    ...paper,
    campus_id: paper.campus_id ?? paper.campus?.id,
    college_id: paper.college_id ?? paper.college?.id,
    program_id: paper.program_id ?? paper.program?.id,
    category_id: paper.category_id ?? paper.category?.id,
  });
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: "error"|"success", message }

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setSaving(true);
    setFeedback(null);
    const result = await onSave(form);
    setSaving(false);

    if (result?.success) {
      setFeedback({ type: "success", message: result.message });
      setTimeout(onClose, 1200); // let them see the success message, then close
    } else {
      setFeedback({
        type: "error",
        message: result?.message || "Failed to save changes.",
      });
    }
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    setFeedback(null);
    const result = await onDelete(paper);
    setDeleting(false);

    if (result?.success) {
      setFeedback({ type: "success", message: result.message });
      setTimeout(onClose, 1000);
    } else {
      setFeedback({
        type: "error",
        message: result?.message || "Failed to delete paper.",
      });
    }
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

        {feedback && (
          <p
            className={`mb-4 rounded-md border px-3 py-2 text-sm ${
              feedback.type === "success"
                ? "border-green-200 bg-green-50 text-green-600"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            {feedback.message}
          </p>
        )}

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
                {/* read-only for now: changing these needs cascading
                    dropdowns tied to real campus/college/program data
                    (like Filter.js), not a plain text field */}
                <ReadOnlyField
                  label="Campus"
                  value={fieldLabel(paper.campus)}
                />
                <ReadOnlyField
                  label="Department"
                  value={fieldLabel(paper.college)}
                />
                <ReadOnlyField
                  label="Course"
                  value={fieldLabel(paper.program)}
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
                className="flex-1 rounded-md border border-[#071437] bg-[#071437] py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-white hover:text-[#071437] disabled:opacity-60"
              >
                {saving ? "Saving…" : "Submit edit"}
              </button>
              <button
                onClick={() => setConfirmingDelete(true)}
                className="flex-1 rounded-md border border-red-400 bg-red-600 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-white hover:text-red-600"
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
                onClick={() => {
                  setConfirmingDelete(false);
                  setFeedback(null);
                }}
                className="flex-1 rounded-md border border-gray-300 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 rounded-md bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <label className="block text-black">
      <span className="text-[11px] text-[#242423]">{label}</span>
      <p className="mt-0.5 w-full rounded-md border border-gray-100 bg-gray-50 px-2 py-1.5 text-sm text-gray-600">
        {value}
      </p>
    </label>
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
