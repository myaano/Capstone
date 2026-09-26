//react imports
import { useState, useEffect, useMemo } from "react";
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

// pulls { id, name } pairs out of a list of college/program-ish objects,
// deduped by id
function toOptions(items) {
  const map = new Map();
  (items || []).forEach((item) => {
    if (item && item.id != null && !map.has(item.id)) {
      map.set(item.id, { id: item.id, name: item.name });
    }
  });
  return [...map.values()];
}

// like toOptions, but groups by name — merges categories that share a
// name (e.g. "Technology" under 3 different programs) into one checkbox
// that carries all their ids
function toGroupedOptions(items) {
  const map = new Map();
  (items || []).forEach((item) => {
    if (!item || item.id == null) return;
    if (!map.has(item.name)) {
      map.set(item.name, { name: item.name, ids: [item.id] });
    } else {
      map.get(item.name).ids.push(item.id);
    }
  });
  return [...map.values()];
}

export default function Filter({ onFilterChange }) {
  //request block here — full campus -> college -> program -> category tree,
  // same endpoint/shape the campus editor and upload form use

  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchLocations = async () => {
      try {
        const response = await fetch(
          "https://capstone-backend-1yta.onrender.com/api/locations",
          { signal: controller.signal },
        );
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        const json = await response.json();
        const list = Array.isArray(json)
          ? json
          : (json.campuses ?? json.data ?? []);
        setLocations(list);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Failed to fetch locations", error);
        }
      }
    };
    fetchLocations();
    return () => controller.abort();
  }, []);

  //request block here

  // each paper data are (title, researchers, campus, college, program, category, year)

  // filter data are (campus_id, college_id, program_id, category_id, year)

  // these usestates are for opening and closing the filter options
  const [CampusOpen, setCampusOpen] = useState(false);
  const [CollegeOpen, setCollegeOpen] = useState(false);
  const [ProgramOpen, setProgramOpen] = useState(false);
  const [CategoryOpen, setCategoryOpen] = useState(false);
  const [YearOpen, setYearOpen] = useState(false);
  // these usestates are for opening and closing the filter options

  //selected options use states — these hold ids, not names
  const [selectedCampus, setSelectedCampus] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedYear, setSelectedYear] = useState([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  //selected options use states

  // ---- cascading option lists ----
  // campuses are always the full list — nothing narrows them
  const campusOptions = useMemo(
    () => toOptions(locations.map((c) => ({ id: c.id, name: c.name }))),
    [locations],
  );

  // colleges: all colleges under the selected campuses, or every college if
  // no campus is selected yet
  const visibleColleges = useMemo(() => {
    const campuses =
      selectedCampus.length === 0
        ? locations
        : locations.filter((c) => selectedCampus.includes(c.id));
    const pool = [];
    campuses.forEach((campus) => pool.push(...(campus.colleges || [])));
    return pool;
  }, [locations, selectedCampus]);
  const collegeOptions = useMemo(
    () => toOptions(visibleColleges),
    [visibleColleges],
  );

  // programs: all programs under the selected (or all visible) colleges
  const visiblePrograms = useMemo(() => {
    const colleges =
      selectedCollege.length === 0
        ? visibleColleges
        : visibleColleges.filter((c) => selectedCollege.includes(c.id));
    const pool = [];
    colleges.forEach((college) => pool.push(...(college.programs || [])));
    return pool;
  }, [visibleColleges, selectedCollege]);
  const programOptions = useMemo(
    () => toOptions(visiblePrograms),
    [visiblePrograms],
  );

  // categories: all categories under the selected (or all visible) programs
  const visibleCategories = useMemo(() => {
    const programs =
      selectedProgram.length === 0
        ? visiblePrograms
        : visiblePrograms.filter((p) => selectedProgram.includes(p.id));
    const pool = [];
    programs.forEach((program) => pool.push(...(program.categories || [])));
    return pool;
  }, [visiblePrograms, selectedProgram]);
  const categoryOptions = useMemo(
    () => toGroupedOptions(visibleCategories),
    [visibleCategories],
  );

  // when a parent level narrows, drop any child selections that are no
  // longer valid (e.g. a selected college that isn't under the campus
  // you just picked)
  useEffect(() => {
    const validIds = new Set(collegeOptions.map((c) => c.id));
    setSelectedCollege((prev) => {
      const next = prev.filter((id) => validIds.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [collegeOptions]);

  useEffect(() => {
    const validIds = new Set(programOptions.map((p) => p.id));
    setSelectedProgram((prev) => {
      const next = prev.filter((id) => validIds.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [programOptions]);

  useEffect(() => {
    const validIds = new Set(categoryOptions.flatMap((c) => c.ids));
    setSelectedCategory((prev) => {
      const next = prev.filter((id) => validIds.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [categoryOptions]);

  const resetFilter = () => {
    setSelectedCampus([]);
    setSelectedCollege([]);
    setSelectedProgram([]);
    setSelectedCategory([]);
    setSelectedYear([]);
  };

  useEffect(() => {
    onFilterChange?.({
      campus_id: selectedCampus,
      college_id: selectedCollege,
      program_id: selectedProgram,
      category_id: selectedCategory,
      year: selectedYear,
    });
  }, [
    selectedCampus,
    selectedCollege,
    selectedProgram,
    selectedCategory,
    selectedYear,
  ]);

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
            className={`transition-all duration-300 ease-out ${CampusOpen ? "max-h-52 overflow-y-auto opacity-100" : "max-h-0 overflow-hidden opacity-0"}`}
          >
            {campusOptions.map((campus) => (
              <label key={campus.id} className="flex gap-2 py-1">
                <input
                  type="checkbox"
                  checked={selectedCampus.includes(campus.id)}
                  onChange={() =>
                    setSelectedCampus((previous) =>
                      previous.includes(campus.id)
                        ? previous.filter((x) => x !== campus.id)
                        : [...previous, campus.id],
                    )
                  }
                />
                <span>{campus.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-[#071437] px-5 py-4 text-white">
          <div
            className="flex cursor-pointer items-center justify-between"
            onClick={() => setCollegeOpen((prev) => !prev)}
          >
            <h1 className="text-xl text-white">Colleges</h1>
            <ToggleIcon isOpen={CollegeOpen} />
          </div>

          <div
            className={`transition-all duration-300 ease-out ${CollegeOpen ? "max-h-52 overflow-y-auto opacity-100" : "max-h-0 overflow-hidden opacity-0"}`}
          >
            {collegeOptions.map((college) => (
              <label key={college.id} className="flex gap-2 py-1">
                <input
                  type="checkbox"
                  checked={selectedCollege.includes(college.id)}
                  onChange={() =>
                    setSelectedCollege((previous) =>
                      previous.includes(college.id)
                        ? previous.filter((x) => x !== college.id)
                        : [...previous, college.id],
                    )
                  }
                />
                <span>{college.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-[#071437] px-5 py-4 text-white">
          <div
            className="flex cursor-pointer items-center justify-between"
            onClick={() => setProgramOpen((prev) => !prev)}
          >
            <h1 className="text-xl text-white">Program</h1>
            <ToggleIcon isOpen={ProgramOpen} />
          </div>

          <div
            className={`transition-all duration-300 ease-out ${ProgramOpen ? "max-h-80 overflow-y-auto opacity-100" : "max-h-0 overflow-hidden opacity-0"}`}
          >
            {programOptions.map((program) => (
              <label key={program.id} className="flex gap-2 pb-2">
                <input
                  type="checkbox"
                  checked={selectedProgram.includes(program.id)}
                  onChange={() =>
                    setSelectedProgram((previous) =>
                      previous.includes(program.id)
                        ? previous.filter((x) => x !== program.id)
                        : [...previous, program.id],
                    )
                  }
                />
                <span className="leading-5">{program.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-[#071437] px-5 py-4 text-white">
          <div
            className="flex cursor-pointer items-center justify-between"
            onClick={() => setCategoryOpen((prev) => !prev)}
          >
            <h1 className="text-xl text-white">Category</h1>
            <ToggleIcon isOpen={CategoryOpen} />
          </div>

          <div
            className={`transition-all duration-300 ease-out ${CategoryOpen ? "max-h-52 overflow-y-auto opacity-100" : "max-h-0 overflow-hidden opacity-0"}`}
          >
            {categoryOptions.map((category) => {
              const isChecked = category.ids.some((id) =>
                selectedCategory.includes(id),
              );
              return (
                <label key={category.name} className="flex gap-2 py-1">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() =>
                      setSelectedCategory((previous) =>
                        isChecked
                          ? previous.filter((x) => !category.ids.includes(x))
                          : [...new Set([...previous, ...category.ids])],
                      )
                    }
                  />
                  <span>{category.name}</span>
                </label>
              );
            })}
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
            className={`transition-all duration-300 ease-out ${YearOpen ? "max-h-96 overflow-y-auto opacity-100" : "max-h-0 overflow-hidden opacity-0"}`}
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
