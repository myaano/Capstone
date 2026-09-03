import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null, // will hold { name, role, ... } once fetched
  isLoading: true,

  setUser: (user) => set({ user, isLoading: false }),

  logout: () => set({ user: null }),
}));
