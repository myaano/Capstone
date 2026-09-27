"use client";

import { useEffect } from "react";

const API_URL = "https://capstone-backend-1yta.onrender.com";

// generates (once) and reuses a per-browser id, matching the backend's
// session_id de-dupe check so repeat views in the same browser don't
// get counted twice
function getSessionId() {
  let sessionId = localStorage.getItem("view_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("view_session_id", sessionId);
  }
  return sessionId;
}

// renders nothing - just fires the view-count POST once, when a specific
// paper's detail page actually mounts in the browser
export default function ViewTracker({ paperId }) {
  useEffect(() => {
    if (!paperId) return;

    const sessionId = getSessionId();

    // TODO: swap this path for whatever route incrementViews is
    // actually registered under in routes/api.php
    fetch(`${API_URL}/api/papers/${paperId}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    }).catch((error) => {
      // a failed view-count ping shouldn't disrupt the reader
      console.error("Failed to record view", error);
    });
  }, [paperId]);

  return null;
}
