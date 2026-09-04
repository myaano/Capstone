//react imports
import { useState, useEffect } from "react";
//react imports

// fixed 18x18 box for both states so the row it sits in never resizes on toggle
function ToggleIcon({ isOpen }) {
  return (
    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center">
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          x1="1"
          y1="9"
          x2="17"
          y2="9"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {!isOpen && (
          <line
            x1="9"
            y1="17"
            x2="9"
            y2="1"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}
      </svg>
    </span>
  );
}

export default function Filter({ onFilterChange }) {
  //request block here

  useEffect(() => {
    const data = async () => {
      try {
        const response = await fetch("data.com/api/sample");
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const data = await response.json();

        // get the filter details (campus, dept, course, year)
      } catch (error) {
        console.error("Failed to Fetch Data", error);
      }
    };
  }, []);

  //request block here

  // each paper data are (title, researchers, campus, dept, course, year)

  // filter data are (campus, dept, course, year)

  // these usestates are for opening and closing the filter options
  const [CampusOpen, setCampusOpen] = useState(false);
  const [DepartmentOpen, setDepartmentOpen] = useState(false);
  const [CourseOpen, setCourseOpen] = useState(false);
  const [YearOpen, setYearOpen] = useState(false);
  // these usestates are for opening and closing the filter options

  //selected options use states
  const [selectedCampus, setSelectedCampus] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState([]);
  const [selectedYear, setSelectedYear] = useState([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  //selected options use states

  const resetFilter = () => {
    setSelectedCampus([]);
    setSelectedDepartment([]);
    setSelectedCourse([]);
    setSelectedYear([]);
  };

  useEffect(() => {
    onFilterChange?.({
      campus: selectedCampus,
      department: selectedDepartment,
      course: selectedCourse,
      year: selectedYear,
    });
  }, [selectedCampus, selectedDepartment, selectedCourse, selectedYear]);

  // this is the current sample of the details that will arrive from the db/server.
  // the incoming data should be stored within this object and presented in the ui for filtering
  const FilterOptions = {
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
  };

  const startYear = 2018;
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => String(startYear + i),
  );

  return (
    <div className="font-urbanist flex flex-1 flex-col gap-4 bg-white">
      <div className="flex items-center justify-between">
        <span className="text-xl text-black lg:text-3xl">Filter :</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileFilterOpen((prev) => !prev)}
            className="cursor-pointer border border-[#071437] bg-white px-4 py-1 text-[#071437] md:hidden"
            aria-expanded={mobileFilterOpen}
            aria-controls="filter-options-panel"
          >
            {mobileFilterOpen ? "Hide" : "Show"}
          </button>
          <button
            onClick={resetFilter}
            className="cursor-pointer border border-[#071437] bg-white px-6 py-1 text-[#071437] transition-colors duration-200 hover:bg-[#071437] hover:text-white"
          >
            Reset
          </button>
        </div>
      </div>
      <div
        id="filter-options-panel"
        className={`flex flex-1 flex-col gap-8 overflow-hidden transition-all duration-300 ease-out select-none md:max-h-none md:opacity-100 ${mobileFilterOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="bg-[#071437] px-5 py-4 text-white">
          <div
            className="flex cursor-pointer items-center justify-between"
            onClick={() => setCampusOpen((prev) => !prev)}
          >
            <h1 className="text-xl text-white">Campus</h1>
            <ToggleIcon isOpen={CampusOpen} />
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ease-out ${CampusOpen ? "max-h-52 opacity-100" : "max-h-0 opacity-0"}`}
          >
            {Object.keys(FilterOptions).map((campus) => (
              <label key={campus} className="flex gap-2 py-1">
                <input
                  type="checkbox"
                  checked={selectedCampus.includes(campus)}
                  onChange={() =>
                    setSelectedCampus((previous) =>
                      previous.includes(campus)
                        ? previous.filter((x) => x !== campus)
                        : [...previous, campus],
                    )
                  }
                />
                <span>{campus}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-[#071437] px-5 py-4 text-white">
          <div
            className="flex cursor-pointer items-center justify-between"
            onClick={() => setDepartmentOpen((prev) => !prev)}
          >
            <h1 className="text-xl text-white">Departments</h1>
            <ToggleIcon isOpen={DepartmentOpen} />
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ease-out ${DepartmentOpen ? "max-h-52 opacity-100" : "max-h-0 opacity-0"}`}
          >
            {Object.keys(FilterOptions.Bulan).map((departments) => (
              <label key={departments} className="flex gap-2 py-1">
                <input
                  type="checkbox"
                  checked={selectedDepartment.includes(departments)}
                  onChange={() =>
                    setSelectedDepartment((previous) =>
                      previous.includes(departments)
                        ? previous.filter((x) => x !== departments)
                        : [...previous, departments],
                    )
                  }
                />
                <span>{departments}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-[#071437] px-5 py-4 text-white">
          <div
            className="flex cursor-pointer items-center justify-between"
            onClick={() => setCourseOpen((prev) => !prev)}
          >
            <h1 className="text-xl text-white">Course/Program</h1>
            <ToggleIcon isOpen={CourseOpen} />
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ease-out ${CourseOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"}`}
          >
            {Object.keys(FilterOptions.Bulan).flatMap((department) =>
              FilterOptions.Bulan[department].map((course) => (
                <label key={course} className="flex gap-2 pb-2">
                  <input
                    type="checkbox"
                    checked={selectedCourse.includes(course)}
                    onChange={() =>
                      setSelectedCourse((previous) =>
                        previous.includes(course)
                          ? previous.filter((x) => x !== course)
                          : [...previous, course],
                      )
                    }
                  />
                  <span className="leading-5">{course}</span>
                </label>
              )),
            )}
          </div>
        </div>

        <div className="bg-[#071437] px-5 py-4 text-white">
          <div
            className="flex cursor-pointer items-center justify-between"
            onClick={() => setYearOpen((prev) => !prev)}
          >
            <h1 className="text-xl text-white">Year</h1>
            <ToggleIcon isOpen={YearOpen} />
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ease-out ${YearOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
          >
            {Object.values(yearOptions).map((year) => (
              <label key={year} className="flex gap-2 py-1">
                <input
                  type="checkbox"
                  checked={selectedYear.includes(year)}
                  onChange={() =>
                    setSelectedYear((previous) =>
                      previous.includes(year)
                        ? previous.filter((x) => x !== year)
                        : [...previous, year],
                    )
                  }
                />
                <span>{year}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
