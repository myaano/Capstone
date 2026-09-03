"use client";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

export default function AuthLoader() {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    console.log("AuthLoader mounted, token:", localStorage.getItem("token"));
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      return;
    }

    fetch("https://application-production-cfb3.up.railway.app/api/user", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, [setUser]);

  return null; // renders nothing, just runs the fetch
}
