"use client";

// A styled text box that matches the Dropdown: one-line input by default, or a
// multi-line box with as="textarea". Everything else (name, value, onChange,
// placeholder, type, disabled ...) passes straight through.
//   <TextField name="title" value={title} onChange={...} invalid={hasError} />
export default function TextField({
  as = "input",
  invalid = false,
  className = "",
  ...props
}) {
  const Tag = as;

  const base =
    "w-full rounded-xl border bg-white px-4 py-2.5 text-black shadow-sm outline-none transition duration-150 placeholder:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none";

  const state = invalid
    ? "border-red-400 hover:border-red-500 focus:ring-2 focus:ring-red-200"
    : "border-gray-300 hover:border-gray-400 focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/20";

  const shape =
    as === "textarea"
      ? "h-full resize-none overflow-y-auto leading-relaxed"
      : "";

  return (
    <Tag
      aria-invalid={invalid || undefined}
      className={`${base} ${state} ${shape} ${className}`}
      {...props}
    />
  );
}
