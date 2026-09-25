"use client";
import Header from "../reusable_components/Header";

import { useState, useEffect } from "react";

//useAuthStore, authorize who can go in or not
import { useAuthStore } from "../store/useAuthStore";
//rerout someone
import { useRouter } from "next/navigation";

// ---- placeholder API endpoints, swap these for your real routes ----
const API_URL =
  "https://application-production-cfb3.up.railway.app/api/locations";

// get campuses
async function getCampuses() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to load campuses");
  const json = await res.json();
  const list = Array.isArray(json) ? json : (json.campuses ?? json.data);
  console.log(json);
  return Array.isArray(list) ? list : [];
}

// submit campus
async function postCampus(campus) {
  const token = localStorage.getItem("token");

  console.log("token:", token);
  const res = await fetch(
    `https://application-production-cfb3.up.railway.app/api/locations`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(campus),
    },
  );
  if (!res.ok) {
    let detail;
    try {
      detail = await res.json();
    } catch {
      detail = await res.text();
    }
    console.error("Create campus failed:", res.status, detail);
    throw new Error(
      detail?.message || `Failed to create campus (${res.status})`,
    );
  }
  const json = await res.json();
  console.log("create campus response:", json);
  // putCampus unwraps its response as `json.campus` — the create endpoint
  // likely shares the same response wrapper, so check that first.
  return json.campus ?? json.data ?? json;
}

//submit the edited campus card fetch

async function putCampus(id, campus) {
  const token = localStorage.getItem("token");
  const res = await fetch(
    `https://application-production-cfb3.up.railway.app/api/locations/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(campus),
    },
  );
  if (!res.ok) {
    let detail;
    try {
      detail = await res.json();
    } catch {
      detail = await res.text();
    }
    console.error("Update campus failed:", res.status, detail);
    throw new Error(
      detail?.message || `Failed to update campus (${res.status})`,
    );
  }
  const json = await res.json();
  return json.campus;
}

// delete
async function deleteCampus(id) {
  const token = localStorage.getItem("token");
  const res = await fetch(
    `https://application-production-cfb3.up.railway.app/api/campus/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (!res.ok) {
    let detail;
    try {
      detail = await res.json();
    } catch {
      detail = await res.text();
    }
    console.error("Delete campus failed:", res.status, detail);
    throw new Error(
      detail?.message || `Failed to delete campus (${res.status})`,
    );
  }
  return true;
}

// Each category is edited individually (its own input, its own id carried
// along the whole time) rather than through a flattened text field, so an
// unchanged or renamed category keeps its real id — same as how existing
// colleges/programs keep theirs. Before sending to postCampus/putCampus,
// just trim names and drop any category rows left blank; a category with an
// id gets updated in place, one with no id is new and the backend creates it.
function toApiColleges(colleges) {
  return colleges.map((college) => ({
    ...college,
    programs: (college.programs || []).map((program) => ({
      ...program,
      categories: (program.categories || [])
        .map((category) => ({
          ...category,
          name: (category.name || "").trim(),
        }))
        .filter((category) => category.name),
    })),
  }));
}

export default function Campus() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAdmin = user?.role === "admin";

  //checks whos the user is and reroutes
  useEffect(() => {
    if (isLoading) return;
    if (!isAdmin) {
      router.replace("/");
    }
  }, [isLoading, isAdmin, router]);

  const [isOpen, setIsOpen] = useState(false);
  const [campuses, setCampuses] = useState([]);
  const [editingCampus, setEditingCampus] = useState(null); // campus object being edited, or null
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCampuses() {
      setLoading(true);
      setLoadError("");
      try {
        const data = await getCampuses();
        if (!cancelled) setCampuses(data);
      } catch (err) {
        console.error(err);
        if (!cancelled) setLoadError("Couldn't load campuses. Please refresh.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCampuses();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleCreated(newCampus) {
    console.log("created campus:", newCampus);
    setCampuses((prev) => [...prev, newCampus]);
  }

  function handleUpdated(updatedCampus) {
    setCampuses((prev) =>
      prev.map((c) => (c.id === updatedCampus.id ? updatedCampus : c)),
    );
  }

  function handleDeleted(id) {
    setCampuses((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <>
      <Header></Header>
      <div className="min-h-screen bg-white px-5 py-5 pt-15 text-[#242423] lg:px-10 lg:py-10">
        <div className="flex flex-1 flex-col border-gray-500/90 pb-5 shadow-xl lg:pb-10">
          <div className="font-bona_nova_sc bg-[#800000] px-5 py-5 text-4xl text-white">
            Campus Editor
          </div>
          <div className="flex flex-1 flex-col px-3 lg:px-5">
            <div className="mt-5 flex-1 items-center justify-center lg:flex">
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="divide-dashed border border-dashed border-[#071437] px-5 text-[#071437] transition-colors duration-200 hover:bg-[#071437] hover:text-white"
              >
                Add Campus
              </button>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {loading && (
                <p className="text-[#242423]/60">Loading campuses...</p>
              )}
              {!loading && loadError && (
                <p className="text-[#800000]">{loadError}</p>
              )}
              {!loading &&
                !loadError &&
                campuses.map((campus, i) => (
                  <CampusCard
                    key={campus.id ?? `${campus.name ?? "campus"}-${i}`}
                    campus={campus}
                    onEdit={() => setEditingCampus(campus)}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <Modal onClose={() => setIsOpen(false)} onSave={handleCreated} />
      )}

      {editingCampus && (
        <EditOverlay
          campus={editingCampus}
          onClose={() => setEditingCampus(null)}
          onSave={(updated) => {
            handleUpdated(updated);
            setEditingCampus(null);
          }}
          onDelete={(id) => {
            handleDeleted(id);
            setEditingCampus(null);
          }}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------
// ErrorBanner: shared dismissible error box for the forms below
// ---------------------------------------------------------------------
function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-[#800000]/30 bg-[#800000]/5 px-3 py-2 text-sm text-[#800000]">
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss error"
        className="leading-none text-[#800000]/70 hover:text-[#800000]"
      >
        ×
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------
// ConfirmDialog: shared yes/no dialog styled to match the app, replaces
// the native window.confirm() popup
// ---------------------------------------------------------------------
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 text-black"
      onClick={onCancel}
    >
      <div
        className="w-[90vw] max-w-sm rounded-2xl border border-black bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-5 text-[#242423]">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-black/20 px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-[#800000] px-4 py-2 text-sm text-white"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Modal: create a new campus
// ---------------------------------------------------------------------
function Modal({ onClose, onSave }) {
  const [campusName, setCampusName] = useState("");
  const [colleges, setColleges] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const maxLength = 25;

  const hasUnsavedChanges = campusName.trim() !== "" || colleges.length > 0;

  function handleBackgroundClick() {
    if (hasUnsavedChanges) {
      setShowExitConfirm(true);
      return;
    }
    onClose();
  }

  function addCollege() {
    setError("");
    setColleges((prev) => [...prev, { name: "", programs: [] }]);
  }

  function updateCollegeName(index, name) {
    setColleges((prev) =>
      prev.map((college, i) => (i === index ? { ...college, name } : college)),
    );
  }

  function removeCollege(index) {
    const college = colleges[index];
    const hasCategories = college?.programs?.some(
      (p) => p.categories?.length > 0,
    );
    if (hasCategories) {
      setError(
        `Remove each program's category in "${college.name || "this college"}" before removing it.`,
      );
      return;
    }
    setColleges((prev) => prev.filter((_, i) => i !== index));
  }

  function addProgram(collegeIndex) {
    setColleges((prev) =>
      prev.map((college, i) =>
        i === collegeIndex
          ? {
              ...college,
              programs: [...college.programs, { name: "", categories: [] }],
            }
          : college,
      ),
    );
  }

  function updateProgram(collegeIndex, programIndex, field, value) {
    setColleges((prev) =>
      prev.map((college, i) => {
        if (i !== collegeIndex) return college;
        const programs = college.programs.map((p, j) =>
          j === programIndex ? { ...p, [field]: value } : p,
        );
        return { ...college, programs };
      }),
    );
  }

  function removeProgram(collegeIndex, programIndex) {
    const program = colleges[collegeIndex]?.programs?.[programIndex];
    if (program?.categories?.length > 0) {
      setError(
        `Remove the category from "${program.name || "this program"}" before removing it.`,
      );
      return;
    }
    setColleges((prev) =>
      prev.map((college, i) => {
        if (i !== collegeIndex) return college;
        return {
          ...college,
          programs: college.programs.filter((_, j) => j !== programIndex),
        };
      }),
    );
  }

  function addCategory(collegeIndex, programIndex) {
    setColleges((prev) =>
      prev.map((college, i) => {
        if (i !== collegeIndex) return college;
        const programs = college.programs.map((p, j) => {
          // only one category allowed per program
          if (j !== programIndex || p.categories.length > 0) return p;
          return { ...p, categories: [{ name: "" }] };
        });
        return { ...college, programs };
      }),
    );
  }

  function updateCategory(collegeIndex, programIndex, categoryIndex, name) {
    setColleges((prev) =>
      prev.map((college, i) => {
        if (i !== collegeIndex) return college;
        const programs = college.programs.map((p, j) => {
          if (j !== programIndex) return p;
          const categories = p.categories.map((c, k) =>
            k === categoryIndex ? { ...c, name } : c,
          );
          return { ...p, categories };
        });
        return { ...college, programs };
      }),
    );
  }

  function removeCategory(collegeIndex, programIndex, categoryIndex) {
    setColleges((prev) =>
      prev.map((college, i) => {
        if (i !== collegeIndex) return college;
        const programs = college.programs.map((p, j) => {
          if (j !== programIndex) return p;
          return {
            ...p,
            categories: p.categories.filter((_, k) => k !== categoryIndex),
          };
        });
        return { ...college, programs };
      }),
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!campusName.trim()) return;
    if (colleges.length === 0) {
      setError("Add at least one college before saving.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const saved = await postCampus({
        name: campusName,
        colleges: toApiColleges(colleges),
      });
      onSave(saved);
      onClose();
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Something went wrong saving this campus. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackgroundClick}
    >
      <div
        className="font-urbanist flex h-[80vh] w-[90vw] max-w-xl flex-col overflow-y-auto rounded-2xl border border-black bg-white text-black"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-black/10 px-4 py-4">
          <h1 className="text-4xl">Add Campus</h1>
          <button
            type="button"
            onClick={handleBackgroundClick}
            aria-label="Close"
            className="text-3xl leading-none text-[#242423]/50 transition-colors duration-200 hover:text-[#800000]"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 px-10 py-6"
        >
          <div className="border-b border-black/10 pb-4">
            <div className="flex justify-between">
              <h1>Campus Name :</h1>
              <span>
                {campusName.length}/{maxLength}
              </span>
            </div>
            <input
              type="text"
              maxLength={maxLength}
              onChange={(e) => setCampusName(e.target.value)}
              value={campusName}
              className="w-full rounded-xl border border-black px-2 py-1"
            />
          </div>

          <div className="flex flex-col gap-4">
            {colleges.map((college, index) => (
              <AddCollege
                key={index}
                college={college}
                index={index}
                onUpdateName={updateCollegeName}
                onAddProgram={addProgram}
                onUpdateProgram={updateProgram}
                onRemoveProgram={removeProgram}
                onAddCategory={addCategory}
                onUpdateCategory={updateCategory}
                onRemoveCategory={removeCategory}
                onRemoveCollege={removeCollege}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={addCollege}
            className="flex items-center justify-center divide-dashed border border-dashed border-[#071437] px-5 py-2 text-[#071437] transition-colors duration-200 hover:bg-[#071437] hover:text-white"
          >
            Add College
          </button>

          <ErrorBanner message={error} onDismiss={() => setError("")} />

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-xl bg-[#800000] px-5 py-2 text-white disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Campus"}
          </button>
        </form>
      </div>

      {showExitConfirm && (
        <ConfirmDialog
          message="Confirm exit without confirming changes?"
          onConfirm={onClose}
          onCancel={() => setShowExitConfirm(false)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// AddCollege: renders one college's name + its programs, purely controlled
// ---------------------------------------------------------------------
function AddCollege({
  college,
  index,
  onUpdateName,
  onAddProgram,
  onUpdateProgram,
  onRemoveProgram,
  onRemoveCollege,
  onAddCategory,
  onUpdateCategory,
  onRemoveCategory,
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-black/20 p-3">
      <div className="flex items-center justify-between">
        <h1>College of :</h1>
        <button
          type="button"
          onClick={() => onRemoveCollege(index)}
          className="text-sm text-[#800000]"
        >
          Remove College
        </button>
      </div>
      <input
        type="text"
        value={college.name}
        onChange={(e) => onUpdateName(index, e.target.value)}
        placeholder="College name"
        className="rounded-xl border border-black px-2 py-1"
      />
      <div className="flex flex-col gap-3">
        {college.programs.map((program, programIndex) => (
          <div
            key={programIndex}
            className="flex flex-col gap-2 rounded-lg border border-black/10 p-2"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="text"
                value={program.name}
                onChange={(e) =>
                  onUpdateProgram(index, programIndex, "name", e.target.value)
                }
                placeholder="Program name"
                className="min-w-0 flex-1 rounded-xl border border-black px-2 py-1"
              />
              <button
                type="button"
                onClick={() => onRemoveProgram(index, programIndex)}
                className="text-sm text-[#800000]"
              >
                Remove
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pl-1">
              {program.categories.map((category, categoryIndex) => (
                <div
                  key={category.id ?? `new-${categoryIndex}`}
                  className="flex items-center gap-1"
                >
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) =>
                      onUpdateCategory(
                        index,
                        programIndex,
                        categoryIndex,
                        e.target.value,
                      )
                    }
                    placeholder="Category"
                    className="w-32 rounded-lg border border-black/40 px-2 py-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onRemoveCategory(index, programIndex, categoryIndex)
                    }
                    aria-label="Remove category"
                    className="text-black/40 hover:text-[#800000]"
                  >
                    ×
                  </button>
                </div>
              ))}
              {program.categories.length === 0 && (
                <button
                  type="button"
                  onClick={() => onAddCategory(index, programIndex)}
                  className="rounded-lg border border-dashed border-[#071437] px-2 py-1 text-xs text-[#071437] transition-colors duration-200 hover:bg-[#071437] hover:text-white"
                >
                  + Category
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onAddProgram(index)}
        className="mt-1 self-start border border-dashed border-[#071437] px-3 py-1 text-sm text-[#071437] transition-colors duration-200 hover:bg-[#071437] hover:text-white"
      >
        Add Programs
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------
// CampusCard: renders a saved campus, click to edit
// ---------------------------------------------------------------------
function CampusCard({ campus, onEdit }) {
  return (
    <div className="font-urbanist flex flex-col rounded-2xl border border-black/10 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-black/10 px-6 py-5">
        <h2 className="font-cormorant_infant text-3xl leading-none text-[#800000]">
          {campus.name}
        </h2>
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 border border-[#800000] px-3 py-1 text-xs font-medium tracking-wide text-[#800000] uppercase transition-colors duration-200 hover:bg-[#800000] hover:text-white"
        >
          Edit
        </button>
      </div>

      {/* Colleges */}
      <div className="flex flex-col divide-y divide-black/10">
        {campus.colleges?.map((college, i) => (
          <div key={i} className="grid grid-cols-[1fr_2fr] gap-4 px-6 py-4">
            <p className="text-sm font-semibold tracking-wide text-[#242423] uppercase">
              {college.name}
            </p>

            <div className="flex flex-wrap gap-2">
              {college.programs?.map((program, j) => (
                <span
                  key={j}
                  className="inline-flex items-center gap-1 border border-black/15 px-2.5 py-1 text-xs text-[#242423]"
                >
                  {program.name}
                  {program.categories?.length > 0 && (
                    <h1 className="flex items-center justify-center text-[#242423]/50">
                      {program.categories.map((c) => c.name).join(", ")}
                    </h1>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// EditOverlay: edit or delete an existing campus
// ---------------------------------------------------------------------
function EditOverlay({ campus, onClose, onSave, onDelete }) {
  const [campusName, setCampusName] = useState(campus.name);
  const [colleges, setColleges] = useState(
    (campus.colleges || []).map((college) => ({
      ...college,
      programs: (college.programs || []).map((program) => ({
        ...program,
        name: program.name ?? "",
        categories: program.categories || [],
      })),
    })),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const maxLength = 25;

  const hasChanges =
    campusName !== campus.name ||
    JSON.stringify(colleges) !== JSON.stringify(campus.colleges || []);

  function handleBackgroundClick() {
    if (hasChanges) {
      setShowExitConfirm(true);
      return;
    }
    onClose();
  }

  function addCollege() {
    setColleges((prev) => [...prev, { name: "", programs: [] }]);
  }

  function updateCollegeName(index, name) {
    setColleges((prev) =>
      prev.map((college, i) => (i === index ? { ...college, name } : college)),
    );
  }

  function removeCollege(index) {
    const college = colleges[index];
    if (college.programs?.length > 0) {
      setError(
        `Delete every program in "${college.name || "this college"}" before removing it.`,
      );
      return;
    }
    // No API call needed here — colleges left out of this array get deleted
    // server-side when handleSubmit's putCampus() call diffs against the DB.
    setColleges((prev) => prev.filter((_, i) => i !== index));
  }

  function addProgram(collegeIndex) {
    setColleges((prev) =>
      prev.map((college, i) =>
        i === collegeIndex
          ? {
              ...college,
              programs: [...college.programs, { name: "", categories: [] }],
            }
          : college,
      ),
    );
  }

  function updateProgram(collegeIndex, programIndex, field, value) {
    setColleges((prev) =>
      prev.map((college, i) => {
        if (i !== collegeIndex) return college;
        const programs = college.programs.map((p, j) =>
          j === programIndex ? { ...p, [field]: value } : p,
        );
        return { ...college, programs };
      }),
    );
  }

  function removeProgram(collegeIndex, programIndex) {
    const program = colleges[collegeIndex]?.programs?.[programIndex];
    if (program?.categories?.length > 0) {
      setError(
        `Remove the category from "${program.name || "this program"}" before removing it.`,
      );
      return;
    }
    setColleges((prev) =>
      prev.map((college, i) => {
        if (i !== collegeIndex) return college;
        return {
          ...college,
          programs: college.programs.filter((_, j) => j !== programIndex),
        };
      }),
    );
  }

  function addCategory(collegeIndex, programIndex) {
    setColleges((prev) =>
      prev.map((college, i) => {
        if (i !== collegeIndex) return college;
        const programs = college.programs.map((p, j) => {
          // only one category allowed per program
          if (j !== programIndex || p.categories.length > 0) return p;
          return { ...p, categories: [{ name: "" }] };
        });
        return { ...college, programs };
      }),
    );
  }

  function updateCategory(collegeIndex, programIndex, categoryIndex, name) {
    setColleges((prev) =>
      prev.map((college, i) => {
        if (i !== collegeIndex) return college;
        const programs = college.programs.map((p, j) => {
          if (j !== programIndex) return p;
          const categories = p.categories.map((c, k) =>
            k === categoryIndex ? { ...c, name } : c,
          );
          return { ...p, categories };
        });
        return { ...college, programs };
      }),
    );
  }

  function removeCategory(collegeIndex, programIndex, categoryIndex) {
    setColleges((prev) =>
      prev.map((college, i) => {
        if (i !== collegeIndex) return college;
        const programs = college.programs.map((p, j) => {
          if (j !== programIndex) return p;
          return {
            ...p,
            categories: p.categories.filter((_, k) => k !== categoryIndex),
          };
        });
        return { ...college, programs };
      }),
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!campusName.trim()) return;
    setError("");
    setSubmitting(true);
    try {
      const updated = await putCampus(campus.id, {
        name: campusName,
        colleges: toApiColleges(colleges),
      });
      onSave(updated);
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Something went wrong updating this campus. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleDeleteCampusClick() {
    if (colleges.length > 0) {
      setError(
        "Delete every college in this campus before deleting the campus itself.",
      );
      return;
    }
    setShowDeleteConfirm(true);
  }

  async function performDelete() {
    setShowDeleteConfirm(false);
    setError("");
    setSubmitting(true);
    try {
      await deleteCampus(campus.id);
      onDelete(campus.id);
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Something went wrong deleting this campus. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-amber-900/20 text-black"
      onClick={handleBackgroundClick}
    >
      <div
        className="font-urbanist flex h-[80vh] w-[90vw] max-w-xl flex-col overflow-y-auto rounded-2xl border border-black bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-black/10 px-4 py-4">
          <h1 className="text-4xl">Edit Campus</h1>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleDeleteCampusClick}
              className="text-sm text-[#800000]"
            >
              Delete Campus
            </button>
            <button
              type="button"
              onClick={handleBackgroundClick}
              aria-label="Close"
              className="text-3xl leading-none text-[#242423]/50 transition-colors duration-200 hover:text-[#800000]"
            >
              ×
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 px-10 py-6"
        >
          <div className="border-b border-black/10 pb-4">
            <div className="flex justify-between">
              <h1>Campus Name :</h1>
              <span>
                {campusName.length}/{maxLength}
              </span>
            </div>
            <input
              type="text"
              maxLength={maxLength}
              onChange={(e) => setCampusName(e.target.value)}
              value={campusName}
              className="w-full rounded-xl border border-black px-2 py-1"
            />
          </div>

          <div className="flex flex-col gap-4">
            {colleges.map((college, index) => (
              <AddCollege
                key={index}
                college={college}
                index={index}
                onUpdateName={updateCollegeName}
                onAddProgram={addProgram}
                onUpdateProgram={updateProgram}
                onRemoveProgram={removeProgram}
                onAddCategory={addCategory}
                onUpdateCategory={updateCategory}
                onRemoveCategory={removeCategory}
                onRemoveCollege={removeCollege}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={addCollege}
            className="flex items-center justify-center divide-dashed border border-dashed border-[#071437] px-5 py-2 text-[#071437] transition-colors duration-200 hover:bg-[#071437] hover:text-white"
          >
            Add College
          </button>

          <ErrorBanner message={error} onDismiss={() => setError("")} />

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-xl bg-[#800000] px-5 py-2 text-white disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {showExitConfirm && (
        <ConfirmDialog
          message="Confirm exit without confirming changes?"
          onConfirm={onClose}
          onCancel={() => setShowExitConfirm(false)}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          message="Delete this campus? This cannot be undone."
          onConfirm={performDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
