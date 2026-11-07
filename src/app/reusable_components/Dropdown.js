"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

// A styled replacement for <select>. It works like a controlled input:
//   <Dropdown name="campus" value={campus} onChange={setCampus}
//             options={["Bulan", "Castilla"]} placeholder="Campus" />
// - `onChange` receives the chosen value (a string), not an event.
// - when `name` is given, the value is also submitted with the surrounding
//   <form> through a hidden input (a disabled dropdown still submits it).
// - keyboard: arrows, Home/End, Enter/Space, Escape, and typing a letter.
// - it opens upward when there isn't room below it.
export default function Dropdown({
  name,
  value = "",
  onChange,
  options = [],
  placeholder = "Select",
  disabled = false,
  invalid = false,
  ariaLabel,
  className = "",
}) {
  const uid = useId();
  const listId = `${uid}-list`;
  const rootRef = useRef(null);
  const listRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [dropUp, setDropUp] = useState(false);

  const items = useMemo(() => options.map((o) => String(o)), [options]);
  const selectedIndex = items.indexOf(String(value));

  const openMenu = () => {
    if (disabled) return;
    const rect = rootRef.current?.getBoundingClientRect();
    if (rect) {
      const below = window.innerHeight - rect.bottom;
      setDropUp(below < 260 && rect.top > below);
    }
    setActive(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };

  const choose = (index) => {
    const picked = items[index];
    if (picked === undefined) return;
    onChange?.(picked);
    setOpen(false);
  };

  // close when clicking anywhere else
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // a dropdown that becomes disabled can't stay open
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  // keep the highlighted option in view while using the arrow keys
  useEffect(() => {
    if (!open || active < 0) return;
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const onKeyDown = (e) => {
    if (disabled) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) openMenu();
        else setActive((a) => Math.min(a + 1, items.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) openMenu();
        else setActive((a) => Math.max(a - 1, 0));
        break;
      case "Home":
        if (open) {
          e.preventDefault();
          setActive(0);
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          setActive(items.length - 1);
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (!open) openMenu();
        else if (active >= 0) choose(active);
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        break;
      case "Tab":
        setOpen(false);
        break;
      default: {
        // typing a letter jumps to the next option that starts with it
        if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) break;
        if (items.length === 0) break;
        const letter = e.key.toLowerCase();
        const from = (open ? active : selectedIndex) + 1;
        const hit = items
          .map((_, i) => (from + i) % items.length)
          .find((i) => items[i].toLowerCase().startsWith(letter));
        if (hit !== undefined) {
          if (!open) openMenu();
          setActive(hit);
        }
      }
    }
  };

  const stateClasses = disabled
    ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 shadow-none"
    : invalid
      ? "border-red-400 bg-white hover:border-red-500 focus-visible:ring-2 focus-visible:ring-red-200"
      : open
        ? "border-[#800000] bg-white ring-2 ring-[#800000]/20"
        : "border-gray-300 bg-white hover:border-gray-400 focus-visible:border-[#800000] focus-visible:ring-2 focus-visible:ring-[#800000]/20";

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {name && <input type="hidden" name={name} value={value} />}

      <button
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={
          open && active >= 0 ? `${uid}-opt-${active}` : undefined
        }
        aria-invalid={invalid || undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        onKeyUp={(e) => e.key === " " && e.preventDefault()}
        className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-left shadow-sm transition duration-150 outline-none ${stateClasses}`}
      >
        <span
          className={`truncate ${
            selectedIndex >= 0 || disabled ? "" : "text-gray-400"
          } ${selectedIndex >= 0 && !disabled ? "text-black" : ""}`}
        >
          {selectedIndex >= 0 ? items[selectedIndex] : placeholder}
        </span>
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`shrink-0 text-gray-500 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          <path
            d="M3.5 6L8 10.5L12.5 6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <ul
        id={listId}
        ref={listRef}
        role="listbox"
        tabIndex={-1}
        className={`absolute left-0 z-30 max-h-60 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-xl transition duration-150 ${
          dropUp ? "bottom-full mb-2 origin-bottom" : "top-full mt-2 origin-top"
        } ${
          open
            ? "visible scale-100 opacity-100"
            : "pointer-events-none invisible scale-95 opacity-0"
        }`}
      >
        {items.length === 0 ? (
          <li className="px-3 py-2 text-sm text-gray-400">No options</li>
        ) : (
          items.map((item, i) => {
            const selected = i === selectedIndex;
            return (
              <li
                key={item}
                id={`${uid}-opt-${i}`}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(i)}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-100 ${
                  selected ? "font-medium text-[#800000]" : "text-black"
                } ${i === active ? "bg-[#800000]/10" : ""}`}
              >
                <span className="wrap-break-word">{item}</span>
                {selected && (
                  <svg
                    aria-hidden="true"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="shrink-0"
                  >
                    <path
                      d="M3.5 8.5L6.5 11.5L12.5 4.5"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
