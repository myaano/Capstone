"use client";

import Header from "../reusable_components/Header";
import { submitUpload } from "./actions";


import { useRef, useState, useEffect, useActionState } from "react";

export default function Upload() {
















  // add cascading dropdown options here

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

  const campusData = {
    Bulan: {
      CICT: [
        "Bachelor of Science in Computer Science",
        "Bachelor of Science in Information Technology",
        "Bachelor of Science in Information System",
      ],
      BME: [
        "Bachelor of Science in Accountancy",
        "Bachelor of Science in Entrepreneurship",
        "Bachelor of Science in Public Administration",
      ],
    },

    // list all the campuses and departments of each campuses in this array to be used by the cascading dropdown
  };

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
      setDepartmentOptions(Object.keys(campusData[Campus] || {}));
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
      setCourseOptions(campusData[Campus]?.[Department] || []);
      setCourse("");
    } else {
      setCourseOptions([]);
      setCourse("");
    }
  }, [Campus, Department]);
  // cascading dropdown logic

  //dropdown options

  return (
    <div className="bg-white h-screen">
      <Header></Header>
      <div className="bg-amber-500 px-10 py-12 h-[calc(100vh-84px)] font-urbanist">
        <div className="bg-green-500 h-full flex flex-col">
          <div className="bg-[#800000] rounded-t-2xl">
            <p className=" text-5xl py-5 px-10">Upload</p>
          </div>

          {/* FORM LOGICS HERE */}
          <form
            action={formAction}
            className="bg-pink-200 overflow-y-scroll"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="lg:flex h-180">
              <div className="bg-yellow-700 w-full py-4 px-10 flex flex-col  text-black">
                <div className="bg-cyan-400 h-full flex flex-col justify-between">
                  <div className="bg-white w-full p-2">
                    <div className="text-xl flex flex-col gap-2">
                      <div className="lg:flex justify-between items-center">
                        <p>File Upload :</p>
                        {/* {error && <p className="text-red-500">{error}</p>} */}

                        <span className="text-sm text-red-500">
                          {state.errors.file}
                        </span>
                      </div>
                    </div>
                    {/* FILE DROP CONTAINER */}
                    <div className="border-2 border-dashed divide-dashed border-[#686565] h-40">
                      <div
                        className={`bg-white  flex flex-col justify-center h-full items-center gap-2 cursor-pointer ${isDragOver ? "opacity-50" : "opacity-100"}`}
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
                          name="submissionFile"
                          onChange={handleChange}
                        />
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
                  <div className="bg-red-200 w-full px-2 ">
                    <div className="lg:flex  justify-between items-center">
                      <p className="text-xl flex gap-2">Abstract/Summary :</p>
                      <span className="text-sm text-red-500">
                        {state.errors.abstract}
                      </span>
                    </div>
                    <div className="text-white w-full h-50">
                      <textarea
                        className="w-full h-full bg-white text-black border border-black rounded-md px-2 py-1 overflow-y-auto resize-none focus:outline-none"
                        placeholder="Abstract and Summary here ..."
                        name="abstract/summary"
                      />
                    </div>
                  </div>
                  <div className="bg-green-300 w-full px-2 ">
                    <div className="lg:flex justify-between items-center">
                      <p className="text-xl flex gap-2">Title :</p>
                      <span className="text-sm text-red-500">
                        {state.errors.title}
                      </span>
                    </div>
                    <div className="w-full">
                      <input
                        placeholder="Title ..."
                        type="text"
                        className="w-full h-full bg-white text-black border border-black rounded-md p-2"
                        name="title"
                      />
                    </div>
                  </div>
                  <div className="bg-yellow-800 w-full px-2 ">
                    <div className="lg:flex justify-between items-center">
                      <p className="text-xl flex gap-2">Researchers :</p>
                      <span className="text-sm text-red-500">
                        {state.errors.researchers}
                      </span>
                    </div>
                    <div className="text-white w-full h-30">
                      <textarea
                        placeholder="Name 1, Name 2, Name 3, ..."
                        className="w-full h-full bg-white text-black border border-black rounded-md px-2 py-1 overflow-y-auto resize-none focus:outline-none"
                        name="researchers"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-blue-500 px-10 py-4 w-full  flex flex-col justify-center items-center ">
                <div className="bg-cyan-400 h-full  flex flex-col justify-between">
                  <div>
                    <div className="lg:flex  justify-between items-center ">
                      <h1 className="text-xl">Campus :</h1>
                      <span className="text-sm text-red-500">
                        {state.errors.campus}
                      </span>
                    </div>
                    <select
                      name="campus"
                      id=""
                      value={Campus}
                      onChange={(event) => setCampus(event.target.value)}
                      className="w-full bg-amber-700 border border-black p-2 rounded-md "
                    >
                      <option value="" hidden>
                        Campus
                      </option>
                      {Object.keys(campusData).map((selectedCampus) => (
                        <option key={selectedCampus} value={selectedCampus}>
                          {selectedCampus}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className="lg:flex  justify-between items-center ">
                      <h1 className="text-xl">Department :</h1>
                      <span className="text-sm text-red-500">
                        {state.errors.department}
                      </span>
                    </div>
                    <select
                      name="department"
                      id=""
                      onChange={(event) => setDepartment(event.target.value)}
                      className="w-full bg-amber-700 border p-2 border-black  rounded-md"
                      disabled={!Campus}
                    >
                      <option value="" hidden>
                        Department
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
                    <div className="lg:flex  justify-between items-center ">
                      <h1 className="text-xl">Course :</h1>
                      <span className="text-sm text-red-500">
                        {state.errors.course}
                      </span>
                    </div>
                    <select
                      name="course"
                      id=""
                      onChange={(event) => setCourse(event.target.value)}
                      className="w-full bg-amber-700 border p-2 border-black  rounded-md"
                      disabled={!Department}
                    >
                      <option value="" hidden>
                        Course
                      </option>
                      {CourseOptions.map((selectedCourse) => (
                        <option key={selectedCourse} value={selectedCourse}>
                          {selectedCourse}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className="lg:flex  justify-between items-center ">
                      <h1 className="text-xl">File Type :</h1>
                      <span className="text-sm text-red-500">
                        {state.errors.fileType}
                      </span>
                    </div>
                    <select
                      name="fileType"
                      id=""
                      onChange={(event) => setFileType(event.target.value)}
                      className="w-full bg-amber-700 border p-2 border-black  rounded-md"
                      disabled={!(Campus && Department && Course)}
                    >
                      <option value="" hidden>
                        File Type
                      </option>
                      {fileTypes.map((selectedFType) => (
                        <option key={selectedFType} value={selectedFType}>
                          {selectedFType}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-md font-extralight italic bg-lime-400">
                    Admin Note** Every single paper that will be uploaded within
                    the Web Repository should have a separate backup storage
                    that can be used specially for backup purposes in case that
                    the website is compromised.
                  </p>
                  <div className="flex justify-center items-center">
                    {state.message ? (
                      <p
                        className={`text-sm ${state.success ? "text-green-600" : "text-red-500"}`}
                      >
                        {state.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex justify-center items-center bg-fuchsia-950">
                    <button
                      type="submit"
                      className="bg-[#071437] px-15 py-3 disabled:opacity-70"
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
  );
}
