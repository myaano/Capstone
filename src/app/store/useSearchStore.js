import { create } from "zustand";

// lives outside any one page's component tree, so the typed query
// survives navigating between root, /theses, /capstone, /search, etc -
// a plain useState in Search.js would reset every time it remounts
export const useSearchStore = create((set) => ({
  query: "",
  setQuery: (query) => set({ query }),
}));
