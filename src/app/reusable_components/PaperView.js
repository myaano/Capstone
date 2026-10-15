"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PdfViewer from "./PdfViewer";
import ViewTracker from "./ViewTracker";
import { useAuthStore } from "../store/useAuthStore";

function fieldLabel(value) {
  if (value && typeof value === "object") return value.name ?? "";
  return value ?? "";
}

// this damn  file is reused for both [paperID] and [capstoneID] dynamic pages

//analyzes who the viewer is, if its a guest or a student and checks tokens
function useViewer(apiUrl) {
  const storeUser = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [hasToken, setHasToken] = useState(null); // null = not checked yet
  const [gaveUp, setGaveUp] = useState(false);
  // fallback: if the store has a token but no user, ask the API who this is
  const [fetchedUser, setFetchedUser] = useState(null);
  const [fetchDone, setFetchDone] = useState(false);

  useEffect(() => {
    setHasToken(Boolean(localStorage.getItem("token")));
  }, []);

  useEffect(() => {
    if (!hasToken || storeUser || isLoading || fetchDone) return;
    let cancelled = false;
    async function whoAmI() {
      try {
        const res = await fetch(`${apiUrl}/api/user`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          cache: "no-store",
        });
        if (!res.ok) throw new Error(String(res.status));
        const json = await res.json();
        if (!cancelled) setFetchedUser(json?.data ?? json?.user ?? json);
      } catch (e) {
        console.warn("PaperView: could not load the logged-in user", e);
      } finally {
        if (!cancelled) setFetchDone(true);
      }
    }
    whoAmI();
    return () => {
      cancelled = true;
    };
  }, [apiUrl, hasToken, storeUser, isLoading, fetchDone]);

  // never wait forever (the backend on Render can be slow to wake up)
  useEffect(() => {
    if (!hasToken || storeUser) return;
    const timer = setTimeout(() => setGaveUp(true), 25000);
    return () => clearTimeout(timer);
  }, [hasToken, storeUser]);

  const user = storeUser ?? fetchedUser ?? null;

  if (hasToken === null) return { ready: false, user: null };
  if (!hasToken) return { ready: true, user: null };
  // token present but user not known yet: don't treat them as a guest
  if (!user && !fetchDone && !gaveUp) return { ready: false, user: null };
  return { ready: true, user };
}

// ---------------------------------------------------------------------
// The rules, read from the campus policy that comes with the paper
//   guest   -> true/false fields
//   student -> "all_campuses" | "same_campus" | "none"
// ---------------------------------------------------------------------
function scopeAllows(scope, viewerCampusId, paperCampusId) {
  if (scope === "all_campuses" || scope === "all_campus") return true;
  if (scope === "same_campus") {
    return (
      viewerCampusId != null && String(viewerCampusId) === String(paperCampusId)
    );
  }
  return false; // "none", missing, or anything unknown
}

function getAccess(user, paper) {
  const policy = paper.campus?.policy;
  const paperCampusId = paper.campus_id ?? paper.campus?.id;
  const all = { details: true, viewFile: true, download: true };
  const none = { details: false, viewFile: false, download: false };

  if (user?.role === "super_admin") return all;
  // a campus admin gets everything for their own campus's papers
  if (
    (user?.role === "campus_admin" || user?.role === "admin") &&
    String(user.campus_id) === String(paperCampusId)
  ) {
    return all;
  }
  if (!policy) return none; // no policy came with the paper: stay closed

  if (!user) {
    return {
      details: Boolean(policy.guest_can_view_metadata),
      viewFile: Boolean(policy.guest_can_view_file),
      download: Boolean(policy.guest_can_download),
    };
  }

  // logged in: students, and admins looking at another campus's papers
  const campusId = user.campus_id;
  return {
    details: scopeAllows(
      policy.student_view_metadata_scope,
      campusId,
      paperCampusId,
    ),
    viewFile: scopeAllows(
      policy.student_view_file_scope,
      campusId,
      paperCampusId,
    ),
    download: scopeAllows(
      policy.student_download_scope,
      campusId,
      paperCampusId,
    ),
  };
}

// Note for a logged-in user who may not open the file (guests see nothing)
function fileDeniedMessage(paper) {
  const scope = paper.campus?.policy?.student_view_file_scope;
  if (scope === "same_campus") {
    return `Only students from ${fieldLabel(paper.campus)} Campus can view the file of this paper.`;
  }
  return "Based on Campus Policy, the file cannot be viewed.";
}

// Full-page message with a button back to the list
function FullPageMessage({ backHref, children }) {
  return (
    <div className="font-urbanist flex min-h-[60vh] flex-col items-center justify-center gap-6 bg-white px-6 py-16 text-center text-[#242423]">
      <p className="font-bona_nova max-w-xl text-2xl text-[#800000] sm:text-3xl">
        {children}
      </p>
      <Link
        href={backHref}
        className="border border-[#800000] bg-white px-5 py-2 text-[#800000] transition-colors duration-200 hover:bg-[#800000] hover:text-white"
      >
        &lt;- Go back
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------
// The paper page (client side, because who is viewing is only known here)
// ---------------------------------------------------------------------
export default function PaperView({
  paperId,
  paperType,
  apiUrl,
  backHref,
  summaryLabel = "Summary", // the heading above the abstract ("Abstract" for theses)
}) {
  const { ready, user } = useViewer(apiUrl);
  console.log("PaperView mounted", { paperId, paperType, apiUrl, ready, user });
  const [paper, setPaper] = useState(null);
  // "loading" | "ok" | "restricted" | "notfound" | "error"
  const [status, setStatus] = useState("loading");
  // the address the PDF is opened from (a short-lived link made for this viewer)
  const [fileUrl, setFileUrl] = useState(null);
  const [fileState, setFileState] = useState("idle"); // "idle" | "loading" | "ready" | "denied" | "error"

  // The paper is fetched here, in the browser, so the request can carry the
  // login token. A server component can't read it, so Laravel would treat
  // every visitor as a guest.
  useEffect(() => {
    let cancelled = false;

    async function request(token) {
      return fetch(`${apiUrl}/api/papers/${paperId}?paper_type=${paperType}`, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      });
    }

    async function load() {
      try {
        const token = localStorage.getItem("token");
        let res = await request(token);
        // an expired token shouldn't lock someone out of what guests can see
        if (res.status === 401 && token) res = await request(null);
        if (cancelled) return;
        console.log("PaperView: paper request answered", {
          status: res.status,
          sentToken: Boolean(token),
        });

        if (res.status === 401 || res.status === 403) {
          console.warn(
            `PaperView: the API refused this paper (HTTP ${res.status}). Check the backend access check.`,
          );
          setStatus("restricted");
        } else if (res.status === 404) {
          setStatus("notfound");
        } else if (!res.ok) {
          setStatus("error");
        } else {
          const json = await res.json();
          if (cancelled) return;
          // accept a bare paper, or one wrapped as { data: ... } / { paper: ... }
          const loaded = json?.data ?? json?.paper ?? json;
          console.log("PaperView: backend access verdict", loaded?.access);
          setPaper(loaded);
          setStatus("ok");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [apiUrl, paperId, paperType]);

  const access = useMemo(() => {
    if (!paper) return null;
    // The backend knows the real viewer from the login token, so when it sends
    // its own verdict (paper.access) that is used instead of guessing here.
    if (typeof paper.access?.details === "boolean") {
      return {
        details: paper.access.details,
        viewFile: Boolean(paper.access.view_file),
        download: Boolean(paper.access.download),
      };
    }
    const result = getAccess(user, paper);
    console.log("PaperView access", {
      viewer: user ? { role: user.role, campus_id: user.campus_id } : "guest",
      paperCampusId: paper.campus_id ?? paper.campus?.id,
      result,
    });
    return result;
  }, [user, paper]);

  // A link or an embedded viewer can't send the login token, so the PDF is
  // fetched here with the token and opened from a temporary blob address.
  const wantsFile = Boolean(
    access && access.details && (access.viewFile || access.download),
  );
  useEffect(() => {
    if (!paper || !wantsFile) return;
    let cancelled = false;
    let objectUrl = null;

    async function loadFile() {
      setFileState("loading");
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${apiUrl}/api/papers/${paper.id}/file`, {
          headers: {
            Accept: "application/pdf, application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        });
        if (cancelled) return;
        if (res.status === 401 || res.status === 403) {
          console.warn("PaperView: the backend refused the file", {
            status: res.status,
            viewer: user
              ? { role: user.role, campus_id: user.campus_id }
              : "guest",
            paperCampusId: paper.campus_id ?? paper.campus?.id,
            viewFileScope: paper.campus?.policy?.student_view_file_scope,
            viewable: paper.viewable,
          });
          setFileState("denied");
          return;
        }
        if (!res.ok) {
          setFileState("error");
          return;
        }
        const blob = await res.blob();
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setFileUrl(objectUrl);
        setFileState("ready");
      } catch {
        if (!cancelled) setFileState("error");
      }
    }

    loadFile();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [apiUrl, paper, wantsFile, user]);

  // no need to wait for the login store when the backend already decided
  if (status === "loading" || (!ready && !paper?.access)) {
    return (
      <div className="bg-white py-10">
        <p className="font-urbanist px-5 text-[#999595] lg:px-10">Loading...</p>
      </div>
    );
  }

  // details restricted: either Laravel refused the request, or the paper came
  // back and the campus policy says this viewer can't see the details
  if (access && !access.details && !paper.campus?.policy) {
    console.warn(
      "PaperView: the paper has no campus.policy, so access defaults to closed. Load 'campus.policy' in the backend.",
      paper,
    );
    return (
      <FullPageMessage backHref={backHref}>
        The access policy for this paper&apos;s campus could not be loaded.
      </FullPageMessage>
    );
  }

  if (access && !access.details) {
    console.warn("PaperView: details denied by the campus policy", {
      viewer: user
        ? { role: user.role, campus_id: user.campus_id }
        : "guest (no user loaded)",
      paperCampusId: paper.campus_id ?? paper.campus?.id,
      studentDetailsScope: paper.campus?.policy?.student_view_metadata_scope,
      guestDetails: paper.campus?.policy?.guest_can_view_metadata,
    });
  }

  if (status === "restricted" || (access && !access.details)) {
    return (
      <FullPageMessage backHref={backHref}>
        Based on the campus&apos; policy access to the details are restricted.
      </FullPageMessage>
    );
  }

  if (status === "notfound") {
    return (
      <FullPageMessage backHref={backHref}>Paper not found.</FullPageMessage>
    );
  }

  if (status === "error" || !paper) {
    return (
      <FullPageMessage backHref={backHref}>
        Something went wrong while loading this paper.
      </FullPageMessage>
    );
  }

  const data = paper;
  const sizeMb = data.file_size
    ? `${(data.file_size / 1024 / 1024).toFixed(1)} MB`
    : null;

  // the file section:
  //   view only         -> embedded viewer
  //   view + download   -> link that opens the PDF (its viewer has a download button)
  //   download only     -> download link
  //   neither           -> nothing for guests, a short note for logged-in users
  const denied = fileState === "denied";
  const canView = !denied && access.viewFile;
  const canDownload = !denied && access.download;
  const fileReady = fileState === "ready" && Boolean(fileUrl);
  const showViewer = canView && !canDownload && fileReady;
  const showLink = canDownload && fileReady;
  const showNote = Boolean(user) && !canView && !canDownload;
  const showFileStatus = (canView || canDownload) && !fileReady;

  return (
    <div className="bg-white py-10">
      {/* counts this paper's view (renders nothing) */}
      <ViewTracker paperId={data.id} />

      <div className="font-urbanist px-5 lg:px-10">
        <Link
          href={backHref}
          className="flex w-fit cursor-pointer gap-2 border border-[#800000] bg-white p-2 text-[#800000] transition-colors duration-200 hover:bg-[#800000] hover:text-white"
        >
          Back &lt;-
        </Link>
      </div>

      <div className="flex min-h-screen flex-col bg-white py-10">
        <div className="flex flex-1 flex-col px-4 lg:px-10">
          <p className="font-bona_nova text-3xl wrap-break-word text-[#242423]">
            {data.title}
          </p>

          <div className="mt-5 flex flex-1 flex-col">
            <div className="lg:w-[55%]">
              <div className="pb-10">
                <p className="font-urbanist border-b border-black pb-2 font-semibold wrap-break-word text-[#242423]">
                  {data.researchers}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-10 lg:flex lg:flex-row lg:gap-0">
              <div className="bg-[#800000] p-10 lg:w-[55%]">
                <div className="flex flex-col gap-6 text-white">
                  <p className="font-bona_nova_sc text-3xl leading-relaxed">
                    {summaryLabel}
                  </p>
                  <p className="font-urbanist max-w-[65ch] text-[1.1rem] wrap-break-word">
                    {data.abstract}
                  </p>
                </div>
              </div>

              <div className="font-urbanist flex flex-1 gap-5 px-5 text-[#242423]">
                <div className="grid grid-cols-2 gap-5 text-xl">
                  <div>
                    <p className="font-semibold">Document Type :</p>
                    <p>
                      {data.paper_type
                        ? data.paper_type.charAt(0).toUpperCase() +
                          data.paper_type.slice(1)
                        : ""}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">College :</p>
                    <p>{fieldLabel(data.college)}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Program :</p>
                    <p>{fieldLabel(data.program)}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Campus Library :</p>
                    <p>{fieldLabel(data.campus)} Campus</p>
                  </div>
                  <div>
                    <p className="font-semibold">Year :</p>
                    <p>{data.year}</p>
                  </div>
                </div>
              </div>
            </div>

            {(showViewer || showLink || showNote || showFileStatus) && (
              <div className="mt-10 w-full lg:w-[55%]">
                {showFileStatus && (
                  <p className="font-urbanist text-[#999595]">
                    {fileState === "error"
                      ? "The file couldn't be loaded. Please try again."
                      : "Loading file..."}
                  </p>
                )}

                {showViewer && <PdfViewer fileUrl={fileUrl} />}

                {showLink && (
                  <Link
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-urbanist inline-flex flex-col gap-1 border border-[#800000] bg-[#800000] px-6 py-4 text-white transition-opacity hover:opacity-90"
                  >
                    <span className="text-xl">
                      {canView ? "Open paper (PDF)" : "Download paper (PDF)"}
                    </span>
                    {(data.original_filename || sizeMb) && (
                      <span className="text-sm break-all text-white/80">
                        {[data.original_filename, sizeMb]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    )}
                  </Link>
                )}

                {showNote && (
                  <p className="font-urbanist border border-[#800000] bg-[#fffff6] p-4 text-[#242423]">
                    {fileDeniedMessage(data)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
