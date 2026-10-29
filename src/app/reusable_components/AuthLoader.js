"use client";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

export default function AuthLoader() {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      return;
    }

    fetch("https://capstone-backend-1yta.onrender.com/api/users", {
      headers: {
        // without Accept, Laravel can answer a bad token with a redirect
        // instead of a clean 401
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          // expired or revoked: forget it so it isn't sent with every request
          localStorage.removeItem("token");
        }
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      // accept a bare user, or one wrapped as { data: ... } / { user: ... }
      .then((data) => setUser(data?.data ?? data?.user ?? data))
      .catch(() => setUser(null));
  }, [setUser]);

  return null; // renders nothing, just runs the fetch
}
