"use client";

import Header from "../reusable_components/Header";
import { submitUpload } from "./actions";

import { useRef, useState, useEffect, useActionState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useRouter } from "next/navigation";

const LOCATIONS_URL =
  "https://capstone-backend-1yta.onrender.com/api/locations";

// same endpoint/shape as getCampuses() in the campus editor page
async function getCampuses() {
  const res = await fetch(LOCATIONS_URL);
  if (!res.ok) throw new Error("Failed to load campuses");
  const json = await res.json();
  const list = Array.isArray(json) ? json : (json.campuses ?? json.data);
  return Array.isArray(list) ? list : [];
}

// turns [{ id, name, colleges: [{ id, name, programs: [{ id, name }] }] }, ...]
// into { [campusName]: { id, colleges: { [collegeName]: { id, programs: [{ id, name }] } } } }
// for the cascading Campus -> College -> Program dropdowns below — the ids are
// what actually get submitted to the backend (campus_id/college_id/program_id),
// the names are only for display in the selects
function buildCampusData(campuses) {
  const campusData = {};
  campuses.forEach((campus) => {
    const colleges = {};
    (campus.colleges || []).forEach((college) => {
      colleges[college.name] = {
        id: college.id,
        programs: (college.programs || []).map((program) => ({
          id: program.id,
          name: program.name,
          categories: (program.categories || []).map((category) => ({
            id: category.id,
            name: category.name,
          })),
        })),
      };
    });
    campusData[campus.name] = { id: campus.id, colleges };
  });
  return campusData;
}

export default function Upload() {
  //redirect
  const router = useRouter();

  //checks user
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      console.log("Unauthorized Access Detected");
      router.push("/");
    }
  }, [isLoading, user]);

  // file upload logics
  const uploadRef = useRef(null);

  const [file, setFile] = useState(null);

  const [error, setError] = useState("");

  const initialState = {
    success: false,
    message: "",
    errors: {},
  };

  const [state, formAction, isPending] = useActionState(
    submitUpload,
    initialState,
  );

  //drag n drop NOTE: false is used since this is a toggle not an api related thing
  const [isDragOver, setIsDragOver] = useState(false);

  //check file size
  const max_size = 10 * 1024 * 1024;

  const validateFile = (selectedFile) => {
    setError("");

    if (!selectedFile) return false;

    const isPdfMimeType = selectedFile.type === "application/pdf";
    const extension = selectedFile.name.split(".").pop()?.toLowerCase();
    const isPdfExtension = extension === "pdf";

    if (!isPdfMimeType || !isPdfExtension) {
      setError("PDF file type required.");
      setFile(null);
      return false;
    }
    if (selectedFile.size > max_size) {
      setError("File is too large. Max size is 10MB.");
      setFile(null);
      return false;
    }

    setFile(selectedFile);
    return true;
  };

  const handleChange = () => {
    const selectedFile = uploadRef.current?.files?.[0];
    validateFile(selectedFile);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const droppedFile = event.dataTransfer?.files?.[0];
    validateFile(droppedFile);
    setIsDragOver(false);
  };
  // file upload logics

  //dropdown options

  const [campusData, setCampusData] = useState({});
  const [campusDataError, setCampusDataError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function populateCampusData() {
      try {
        const campuses = await getCampuses();
        if (!cancelled) setCampusData(buildCampusData(campuses));
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setCampusDataError("Couldn't load campus list. Please refresh.");
        }
      }
    }

    populateCampusData();

    return () => {
      cancelled = true;
    };
  }, []);

  const currentYear = new Date().getFullYear();
  const startYear = 2018;

  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => currentYear - i,
  );

  const [SelectedCategory, setSelectedCategory] = useState("");
  const [CategoryOptions, setCategoryOptions] = useState([]);

  const [FileType, setFileType] = useState("");

  const fileTypes = ["Capstone", "Thesis"];

  // campus, department, course use states HERE
  const [Campus, setCampus] = useState("");
  const [Department, setDepartment] = useState("");
  const [Course, setCourse] = useState("");
  const [DepartmentOptions, setDepartmentOptions] = useState([]);
  const [CourseOptions, setCourseOptions] = useState([]);
  // campus, department, course use states HERE

  // cascading dropdown logic
  useEffect(() => {
    if (Campus) {
      setDepartmentOptions(Object.keys(campusData[Campus]?.colleges || {}));
      setDepartment("");
      setCourse("");
      setCourseOptions([]);
    } else {
      setDepartmentOptions([]);
      setCourseOptions([]);
      setDepartment("");
      setCourse("");
    }
  }, [Campus]);

  useEffect(() => {
    if (Campus && Department) {
      const programs =
        campusData[Campus]?.colleges?.[Department]?.programs || [];
      setCourseOptions(programs.map((program) => program.name));
      setCourse("");
    } else {
      setCourseOptions([]);
      setCourse("");
    }
  }, [Campus, Department]);
  useEffect(() => {
    if (Campus && Department && Course) {
      const programs =
        campusData[Campus]?.colleges?.[Department]?.programs || [];
      const selectedProgram = programs.find(
        (program) => program.name === Course,
      );
      setCategoryOptions(
        (selectedProgram?.categories || []).map((category) => category.name),
      );
      setSelectedCategory("");
    } else {
      setCategoryOptions([]);
      setSelectedCategory("");
    }
  }, [Campus, Department, Course]);
  // cascading dropdown logic

  // derive the actual DB ids from the selected names, for submission
  const campusId = campusData[Campus]?.id ?? "";
  const collegeId = campusData[Campus]?.colleges?.[Department]?.id ?? "";
  const selectedProgram = campusData[Campus]?.colleges?.[
    Department
  ]?.programs?.find((program) => program.name === Course);
  const programId = selectedProgram?.id ?? "";
  const categoryId =
    selectedProgram?.categories?.find(
      (category) => category.name === SelectedCategory,
    )?.id ?? "";

  //dropdown options

  // add reset into the input file
  useEffect(() => {
    if (state.success) {
      setFile(null);
      setCampus("");
      if (uploadRef.current) {
        uploadRef.current.value = "";
      }
    }
  }, [state]);

  //token
  const [token, setToken] = useState("");

  useEffect(() => {
    setToken(localStorage.getItem("token") || "");
  }, []);

  const Categories = ["Business", "Politics & Society", "Technology"];
  return (
    <div className="min-h-screen bg-white">
      {isLoading || !user || user.role !== "admin" ? (
        <div className="font-urbanist flex min-h-screen items-center justify-center">
          <h1>Unauthorized Access Detected</h1>
        </div>
      ) : (
        <div>
          <Header></Header>
          <div className="font-urbanist min-h-screen bg-white px-4 py-6 text-black sm:px-10 lg:px-20 lg:py-12">
            <div className="flex flex-col rounded-b-xl border-black shadow-2xl">
              <div className="rounded-t-2xl bg-[#800000]">
                <p className="px-4 py-4 text-3xl text-white sm:px-10 sm:py-5 sm:text-5xl">
                  Upload
                </p>
              </div>

              {/* FORM LOGICS HERE */}
              <form
                action={formAction}
                className="rounded-b-xl"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                type="hidden"
              >
                <div className="lg:flex lg:h-180">
                  <div className="flex w-full flex-col px-4 py-4 text-black sm:px-10">
                    <div className="flex h-full flex-col justify-between gap-6 lg:gap-0">
                      <div className="w-full bg-white p-2">
                        <div className="flex flex-col gap-2 text-lg sm:text-xl">
                          <div className="items-center justify-between lg:flex">
                            <p>File Upload :</p>

                            <span className="text-sm text-red-500">
                              {state.errors.file}
                              {error && (
                                <p className="text-sm text-red-500">{error}</p>
                              )}
                            </span>
                          </div>
                        </div>
                        {/* FILE DROP CONTAINER */}
                        <div className="h-40 divide-dashed border-2 border-dashed border-[#686565]">
                          <div
                            className={`flex h-full cursor-pointer flex-col items-center justify-center gap-2 bg-white ${isDragOver ? "opacity-50" : "opacity-100"}`}
                            onClick={() => uploadRef.current.click()}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onDragLeave={() => setIsDragOver(false)}
                          >
                            <input
                              type="file"
                              className="hidden"
                              accept="application/pdf"
                              ref={uploadRef}
                              name="file"
                              onChange={handleChange}
                            />
                            <input type="hidden" name="token" value={token} />
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 22 22"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M11 0.999794L11 13.6445M11 0.999794C10.1597 0.999794 8.58984 3.52154 8 4.16098M11 0.999794C11.8403 0.999794 13.4102 3.52154 14 4.16098"
                                stroke="#686565"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M21 16.3193C21 20.1418 20.3525 20.9395 17.25 20.9395H4.75C1.6475 20.9395 1 20.1418 1 16.3193"
                                stroke="#686565"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>

                            <p className="text-[#686565]">
                              {file ? file.name : "Drop Files Here"}
                            </p>
                          </div>
                        </div>
                        {/* FILE DROP CONTAINER */}
                      </div>
                      <div className="w-full px-2">
                        <div className="items-center justify-between lg:flex">
                          <p className="flex gap-2 text-xl">
                            Abstract/Summary :
                          </p>
                          <span className="text-sm text-red-500">
                            {state.errors.abstract}
                          </span>
                        </div>
                        <div className="h-50 w-full">
                          <textarea
                            className="h-full w-full resize-none overflow-y-auto rounded-md border border-black bg-white px-2 py-1 text-black focus:outline-none"
                            placeholder="Abstract or Summary here ..."
                            name="abstract/summary"
                          />
                        </div>
                      </div>
                      <div className="w-full px-2">
                        <div className="items-center justify-between lg:flex">
                          <p className="flex gap-2 text-xl">Title :</p>
                          <span className="text-sm text-red-500">
                            {state.errors.title}
                          </span>
                        </div>
                        <div className="w-full">
                          <input
                            placeholder="Title ..."
                            type="text"
                            className="h-full w-full rounded-md border border-black bg-white p-2 text-black"
                            name="title"
                          />
                        </div>
                      </div>
                      <div className="w-full px-2">
                        <div className="items-center justify-between lg:flex">
                          <p className="flex gap-2 text-xl">Researchers :</p>
                          <span className="text-sm text-red-500">
                            {state.errors.researchers}
                          </span>
                        </div>
                        <div className="h-30 w-full">
                          <textarea
                            placeholder="Name 1, Name 2, Name 3, ..."
                            className="h-full w-full resize-none overflow-y-auto rounded-md border border-black bg-white px-2 py-1 text-black focus:outline-none"
                            name="researchers"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full flex-col items-center justify-center px-4 py-4 sm:px-10">
                    <div className="flex h-full w-full flex-col justify-between gap-4 lg:gap-0">
                      <div>
                        <div className="items-center justify-between lg:flex">
                          <h1 className="text-xl">Campus :</h1>
                          <span className="text-sm text-red-500">
                            {state.errors.campus || campusDataError}
                          </span>
                        </div>
                        <select
                          name="campus"
                          id=""
                          value={Campus}
                          onChange={(event) => setCampus(event.target.value)}
                          className="w-full rounded-md border border-black p-2"
                        >
                          <option value="" hidden>
                            Campus
                          </option>
                          {Object.keys(campusData).map((selectedCampus) => (
                            <option
                              key={selectedCampus}
                              value={selectedCampus}
                              className=""
                            >
                              {selectedCampus}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <div className="items-center justify-between lg:flex">
                          <h1 className="text-xl">College :</h1>
                          <span className="text-sm text-red-500">
                            {state.errors.department}
                          </span>
                        </div>
                        <select
                          name="department"
                          id=""
                          onChange={(event) =>
                            setDepartment(event.target.value)
                          }
                          className="w-full rounded-md border border-black p-2"
                          disabled={!Campus}
                        >
                          <option value="" hidden>
                            College
                          </option>
                          {DepartmentOptions.map((selectedDepartment) => (
                            <option
                              key={selectedDepartment}
                              value={selectedDepartment}
                            >
                              {selectedDepartment}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <div className="items-center justify-between lg:flex">
                          <h1 className="text-xl">Program :</h1>
                          <span className="text-sm text-red-500">
                            {state.errors.course}
                          </span>
                        </div>
                        <select
                          name="course"
                          id=""
                          onChange={(event) => setCourse(event.target.value)}
                          className="w-full rounded-md border border-black p-2"
                          disabled={!Department}
                        >
                          <option value="" hidden>
                            Program
                          </option>
                          {CourseOptions.map((selectedCourse) => (
                            <option key={selectedCourse} value={selectedCourse}>
                              {selectedCourse}
                            </option>
                          ))}
                        </select>
                      </div>
                      <input type="hidden" name="campus_id" value={campusId} />
                      <input
                        type="hidden"
                        name="college_id"
                        value={collegeId}
                      />
                      <input
                        type="hidden"
                        name="program_id"
                        value={programId}
                      />
                      <div>
                        <div className="items-center justify-between lg:flex">
                          <h1 className="text-xl">Year :</h1>
                          <span className="text-sm text-red-500">
                            {state.errors.year}
                          </span>
                        </div>
                        <select
                          name="year"
                          id=""
                          className="w-full rounded-md border border-black p-2"
                        >
                          <option value="" hidden>
                            Year
                          </option>
                          {years.map((selectedYear) => (
                            <option key={selectedYear} value={selectedYear}>
                              {selectedYear}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <div className="items-center justify-between lg:flex">
                          <h1 className="text-xl">Paper Type :</h1>
                          <span className="text-sm text-red-500">
                            {state.errors.paper_type}
                          </span>
                        </div>
                        <select
                          name="paper_type"
                          id=""
                          onChange={(event) => setFileType(event.target.value)}
                          className="w-full rounded-md border border-black p-2"
                          disabled={!(Campus && Department && Course)}
                        >
                          <option value="" hidden>
                            Paper Type
                          </option>
                          {fileTypes.map((selectedFType) => (
                            <option key={selectedFType} value={selectedFType}>
                              {selectedFType}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <div className="items-center justify-between lg:flex">
                          <h1 className="text-xl">Category</h1>
                          <span className="text-sm text-red-500">
                            {state.errors.category}
                          </span>
                        </div>
                        <select
                          name="category"
                          id=""
                          value={SelectedCategory}
                          onChange={(event) =>
                            setSelectedCategory(event.target.value)
                          }
                          className="w-full rounded-md border border-black p-2"
                          disabled={!Course}
                        >
                          <option value="" hidden>
                            Category
                          </option>
                          {CategoryOptions.map((selectedCategory) => (
                            <option
                              key={selectedCategory}
                              value={selectedCategory}
                            >
                              {selectedCategory}
                            </option>
                          ))}
                        </select>
                        <input
                          type="hidden"
                          name="category_id"
                          value={categoryId}
                        />
                      </div>
                      <p className="text-sm font-extralight italic sm:text-xl">
                        Admin Note** Every single paper that will be uploaded
                        within the Web Repository should have a separate backup
                        storage that can be used specially for backup purposes
                        in case that the website is compromised.
                      </p>
                      <div className="flex items-center justify-center">
                        {state.message ? (
                          <p
                            className={`text-sm ${state.success ? "text-green-600" : "text-red-500"}`}
                          >
                            {state.message}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex items-center justify-center">
                        <button
                          type="submit"
                          className="w-full bg-[#071437] px-8 py-3 text-white disabled:opacity-70 sm:w-auto sm:px-15"
                          disabled={isPending}
                        >
                          {isPending ? "Uploading..." : "Upload"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
              {/* FORM LOGICS HERE */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
