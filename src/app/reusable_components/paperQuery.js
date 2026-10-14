// Builds the query string for GET /api/papers. Every list is sent as ONE
// comma-separated value, and empty lists are left out:
//
//   campus_id=1,4&college_id=2,3&program_id=5,7&year=2024,2025&paper_type=capstone,thesis&page=1
//
// The commas stay as real commas (URLSearchParams would turn them into %2C),
// while the values themselves are still URL-encoded.
const encode = (value) => encodeURIComponent(String(value));

export function buildPaperQuery({
  filters = {},
  search,
  paperType,
  page,
} = {}) {
  const parts = [];

  const add = (key, value) => {
    const list = (Array.isArray(value) ? value : [value]).filter(
      (v) => v !== undefined && v !== null && v !== "",
    );
    if (list.length === 0) return;
    parts.push(`${key}=${list.map(encode).join(",")}`);
  };

  if (search) parts.push(`search=${encode(search)}`); // free text, never split
  add("campus_id", filters.campus_id);
  add("college_id", filters.college_id);
  add("program_id", filters.program_id);
  add("category_id", filters.category_id);
  add("year", filters.year);
  add("paper_type", paperType); // "capstone", "thesis" or ["capstone", "thesis"]
  add("page", page);

  return parts.join("&");
}
