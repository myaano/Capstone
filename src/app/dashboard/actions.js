"use server";

// Same pattern as /upload/actions.js - point this at your Laravel LAN IP.
const API_URL = "https://capstone-backend-1yta.onrender.com/api"; // TODO: swap in your actual LAN IP

export async function fetchPapers(
  page,
  search = "",
  token = "",
  paperType = "",
) {
  // sort=oldest asks Laravel for oldest-first, so newly added papers land at
  // the end of the list (the last page). Ordering has to happen on the
  // backend: the list is paginated, so sorting in the browser could only
  // shuffle the 5 papers already on screen.
  const params = new URLSearchParams({ page, sort: "oldest" });
  if (search) params.append("search", search);
  // "thesis" or "capstone" (the dashboard's stat cards); empty means both
  if (paperType) params.append("paper_type", paperType);
  // The token tells Laravel who is asking, so it can limit an admin to their
  // own campus's papers (super_admin gets everything). It runs server-side
  // here, so the dashboard passes the token in from localStorage.
  const headers = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}/admin/papers?${params}`, {
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    // the body shows in the terminal running `npm run dev`; it says WHY Laravel refused
    const body = await res.text();
    console.error(
      `fetchPapers failed: ${res.status} ${res.url} - ${body.slice(0, 300)}`,
    );
    throw new Error(`Failed to fetch papers (${res.status})`);
  }

  return res.json();
}

// Called from the dashboard overlay's "Submit edit" button.
// Always sends FormData (not JSON) since a replacement file may be attached -
// same POST + _method=PUT workaround used for multipart updates in Laravel.

//update paper

export async function updatePaper(id, formData) {
  formData.append("_method", "PUT");
  // token travels inside the FormData (same pattern as submitUpload) since
  // this runs server-side and can't read the browser's localStorage itself -
  // pull it out here so it isn't also sent as a stray form field to Laravel
  const token = formData.get("token")?.toString().trim() || "";
  formData.delete("token");

  const res = await fetch(`${API_URL}/papers/${id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`updatePaper failed: ${res.status} - ${errorText}`);
    throw new Error(errorText || "Failed to update paper");
  }

  return res.json();
}

// Called from the overlay's "Yes, delete" confirmation step.
export async function deletePaper(id, token) {
  const res = await fetch(`${API_URL}/papers/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`deletePaper failed: ${res.status} - ${errorText}`);
    throw new Error(errorText || "Failed to delete paper");
  }

  return true;
}
