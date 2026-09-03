"use client";

import { useEffect, useState, useRef } from "react";
import Header from "../reusable_components/Header";
import { useAuthStore } from "../store/useAuthStore";
import { fetchPapers, updatePaper, deletePaper } from "./actions";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin";

  const [papers, setPapers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activePaper, setActivePaper] = useState(null); // controls the overlay

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError(null);
      try {
        const papersData = await fetchPapers();
        if (!cancelled) {
          setPapers(papersData);
        }
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
  }, []);

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
    <div className="min-h-screen bg-amber-900 font-urbanist">
      <Header />
      <div className="text-black flex flex-col bg-amber-300 px-10 py-10 flex-1">
        <div className="flex flex-col">
          <h1 className="text-6xl bg-blue-200">Dashboard</h1>

          {error && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-16">
            {/* stat cards */}
            <div className="flex justify-between mt-10 px-10 bg-white">
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
      className={`${color} h-60 w-60 px-5 py-10 flex flex-col justify-between rounded-2xl shadow-2xl`}
    >
      <div>
        <h1 className="font-light leading-none">Total</h1>
        <h1 className="text-3xl italic leading-none">{label}</h1>
      </div>
      <h1 ref={ref} className="bg-blue-900 flex justify-end items-end text-7xl">
        0
      </h1>
    </div>
  );
}

// one row = one card. the whole card is clickable and opens the edit/delete overlay.
function PaperCard({ paper, isAdmin, onView }) {
  return (
    <div
      className="bg-white border border-gray-200 rounded-2xl p-5 shadow cursor-pointer hover:border-gray-300 transition"
      onClick={onView}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-base truncate">{paper.title}</p>
          <p className="text-sm text-gray-500">{paper.researchers}</p>
        </div>

        {isAdmin && (
          <p className="text-xs text-gray-400 shrink-0">Click card to edit</p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 border-t border-gray-100 mt-3 pt-3">
        <Field label="Campus" value={paper.campus} />
        <Field label="Department" value={paper.department} />
        <Field label="Course" value={paper.course} />
        <Field label="Year" value={paper.year} />
        <Field label="File type" value={paper.fileType} />
      </div>
    </div>
  );
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
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-medium">Edit paper</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
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
              </div>

              <label className="block">
                <span className="text-[11px] text-gray-400">File</span>
                <p className="text-sm text-blue-600 mb-1">
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

            <div className="flex gap-2 mt-6 border-t border-gray-100 pt-4">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Submit edit"}
              </button>
              <button
                onClick={() => setConfirmingDelete(true)}
                className="flex-1 py-2 rounded-md border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </>
        ) : (
          <div className="pt-2">
            <p className="text-base font-medium">Confirm delete?</p>
            <p className="text-sm text-gray-500 mt-1">This cannot be undone.</p>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setConfirmingDelete(false)}
                className="flex-1 py-2 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => onDelete(paper)}
                className="flex-1 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700"
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
      <span className="text-[11px] text-gray-400">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5 mt-0.5 focus:outline-none focus:border-gray-400"
      />
    </label>
  );
}

function EditTextarea({ label, value, onChange }) {
  return (
    <label className="block text-black">
      <span className="text-[11px] text-gray-400 ">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5 mt-0.5 focus:outline-none resize-none focus:border-gray-400"
      />
    </label>
  );
}
