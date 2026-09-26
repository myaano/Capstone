"use server";

// Same pattern as /upload/actions.js - point this at your Laravel LAN IP.
const API_URL = "https://capstone-backend-1yta.onrender.com/api"; // TODO: swap in your actual LAN IP

export async function fetchPapers(page) {
  const params = new URLSearchParams({ page });
  const res = await fetch(`${API_URL}/papers?${params}`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Failed to fetch papers");
  }

  return res.json();
}

// Called from the dashboard overlay's "Submit edit" button.
// Always sends FormData (not JSON) since a replacement file may be attached -
// same POST + _method=PUT workaround used for multipart updates in Laravel.

//update paper

export async function updatePaper(id, formData) {
  formData.append("_method", "PUT");

  const res = await fetch(`${API_URL}/papers/${id}`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to update paper");
  }

  return res.json();
}

// Called from the overlay's "Yes, delete" confirmation step.
export async function deletePaper(id) {
  const res = await fetch(`${API_URL}/papers/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete paper");
  }

  return true;
}
