"use client";

import { useState } from "react";
import Header from "../reusable_components/Header";

export default function Dashboard() {
  // TODO: replace with your real papers fetch (useEffect + fetch to Laravel)
  const [papers, setPapers] = useState([
    {
      id: 1,
      title: "Filter UX in web apps",
      file: "filter-ux.pdf",
      researchers: "J. Cruz, M. Santos",
      abstract: "A study on how filter placement affects usability...",
      campus: "Main",
      department: "CS",
      course: "BSIT",
      year: 2025,
      fileType: "PDF",
    },
    // ...more papers from your API
  ]);

  // TODO: replace with your real auth check, e.g. from AuthContext -> user?.role === "admin"
  const isAdmin = true;

  const [activePaper, setActivePaper] = useState(null); // controls the overlay

  function handleSave(updatedPaper) {
    // TODO: PUT/PATCH the edited fields to Laravel.
    // if updatedPaper.newFile exists, the admin picked a replacement file - send as
    // FormData instead of JSON, e.g.
    //   const body = new FormData();
    //   body.append("file", updatedPaper.newFile);
    //   body.append("title", updatedPaper.title); // ...etc for other fields
    //   await fetch(`${API_URL}/papers/${updatedPaper.id}`, { method: "POST", body }); // Laravel: use POST + _method=PUT for multipart
    // if no newFile, a plain JSON PUT/PATCH is fine.
    setPapers((prev) =>
      prev.map((p) => (p.id === updatedPaper.id ? updatedPaper : p)),
    );
    setActivePaper(null);
  }

  function handleDelete(paper) {
    // TODO: DELETE to Laravel, e.g.
    // await fetch(`${API_URL}/papers/${paper.id}`, { method: "DELETE", headers: {...} })
    setPapers((prev) => prev.filter((p) => p.id !== paper.id));
    setActivePaper(null);
  }

  return (
    <div className="min-h-screen bg-amber-900 font-urbanist">
      <Header />
      <div className="text-black flex flex-col bg-amber-300 px-10 py-10 flex-1">
        <div className="flex flex-col">
          <h1 className="text-6xl bg-blue-200">Dashboard</h1>

          <div className="flex flex-col gap-16">
            {/* stat cards - unchanged, still hardcoded, hook up to your API totals when ready */}
            <div className="flex justify-between mt-10 px-10 bg-white">
              <div className="bg-green-200 h-60 w-60 px-5 py-10 flex flex-col justify-between rounded-2xl shadow-2xl">
                <div>
                  <h1 className="font-light leading-none">Total</h1>
                  <h1 className="text-3xl italic leading-none">Thesis</h1>
                </div>
                <h1 className="bg-blue-900 flex justify-end items-end text-7xl">
                  61
                </h1>
              </div>
              <div className="bg-green-300 h-60 w-60 px-5 py-10 flex flex-col justify-between rounded-2xl shadow-2xl">
                <div>
                  <h1 className="font-light leading-none">Total</h1>
                  <h1 className="text-3xl italic leading-none">Capstone</h1>
                </div>
                <h1 className="bg-blue-900 flex justify-end items-end text-7xl">
                  181
                </h1>
              </div>
              <div className="bg-green-500 h-60 w-60 px-5 py-10 flex flex-col justify-between rounded-2xl shadow-2xl">
                <div>
                  <h1 className="font-light leading-none">Total</h1>
                  <h1 className="text-3xl italic leading-none">Papers</h1>
                </div>
                <h1 className="bg-blue-900 flex justify-end items-end text-7xl">
                  242
                </h1>
              </div>
            </div>

            {/* was the grid-cols-9 table - now a stacked card list, mobile-friendly */}
            <div className="flex flex-col gap-4">
              {papers.map((paper) => (
                <PaperCard
                  key={paper.id}
                  paper={paper}
                  isAdmin={isAdmin}
                  onView={() => setActivePaper(paper)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* the overlay is where edit AND delete both live - opened by clicking the card */}
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

// one row = one card. the whole card is clickable and opens the edit/delete overlay.
// "Click card to edit" is a plain label sitting where the old buttons were - not clickable itself.
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
// fields are editable inputs; Save submits the edit, Delete asks for confirmation first.
function PaperOverlay({ paper, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({ ...paper });
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose} // click backdrop to close
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // don't close when clicking inside the card
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
                {/* shows the currently submitted file, or the newly picked one if the admin replaced it */}
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
                onClick={() => onSave(form)}
                className="flex-1 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
              >
                Submit edit
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
          // inline confirmation step - replaces the form until the admin decides
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
