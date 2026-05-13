import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import useStore from "../lib/store";
export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { jobs } = useStore();
  const [job, setJob] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [selectedCVs, setSelectedCVs] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [activeRoleFilter, setActiveRoleFilter] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const fetchCandidates = async (jobIdParam, positionName) => {
    setLoadingCandidates(true);
    try {
      let url;
      if (jobIdParam && jobIdParam !== "sample-1" && jobIdParam !== "sample-2")
        url = `/api/get-results?job_id=${encodeURIComponent(jobIdParam)}`;
      else if (positionName)
        url = `/api/get-results?position=${encodeURIComponent(positionName)}`;
      else url = "/api/get-results";
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) setCandidates(json.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCandidates(false);
    }
  };
  useEffect(() => {
    if (id) {
      const found = jobs.find((j) => j.id === id);
      if (found) {
        setJob(found);
        fetchCandidates(id, found.positionName || found.title);
      } else if (id === "sample-1")
        fetchCandidates(null, "Senior Recruitment Specialist");
      else if (id === "sample-2")
        fetchCandidates(null, "Full Stack Developer - Internship");
    }
  }, [id, jobs]);
  useEffect(() => {
    if (!isProcessing || !job) return;
    const pos = job.title || job.positionName;
    const t = setInterval(() => fetchCandidates(id, pos), 4000);
    return () => clearInterval(t);
  }, [isProcessing, job]);
  const getRoles = () => {
    const raw = job?.positionName || "";
    const p = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return p.length > 1 ? p : [];
  };
  const getPositionName = () => {
    if (job) return job.title || job.positionName || "";
    if (id === "sample-1") return "Senior Recruitment Specialist";
    if (id === "sample-2") return "Full Stack Developer - Internship";
    return "";
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (f) => setSelectedCVs((p) => [...p, ...f]),
    accept: { "application/pdf": [".pdf"] },
  });
  const handleProcessCVs = async () => {
    if (!selectedCVs.length) return;
    setIsProcessing(true);
    const sessionId = crypto.randomUUID();
    const roles = getRoles();
    const parameters = {
      positionName: getPositionName(),
      roleName: "",
      roles: roles.length > 0 ? roles : undefined,
      jobDescription: job?.jobDescription || "",
      qualification: job?.qualification || "",
      minExperience: "",
      minEducation: "",
      hardSkills: [],
      notes: "",
      requirements: job?.requirements || [],
    };
    try {
      const queuedIds = [];
      for (const cv of selectedCVs) {
        const fd = new FormData();
        fd.append("cv", cv);
        fd.append("parameters", JSON.stringify(parameters));
        fd.append("session_id", sessionId);
        if (id && id !== "sample-1" && id !== "sample-2")
          fd.append("job_id", id);
        const r = await fetch("/api/queue-cv", { method: "POST", body: fd });
        const j = await r.json();
        if (r.ok && j.success) queuedIds.push(j.id);
        else console.error("queue-cv error:", j.error);
      }
      if (!queuedIds.length)
        throw new Error("Tidak ada CV yang berhasil di-queue.");
      for (let i = 0; i < queuedIds.length; i++) {
        const r = await fetch("/api/process-cv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ candidateId: queuedIds[i] }),
        });
        const j = await r.json();
        if (!j.success) console.error("process-cv error:", j.error);
        if (i < queuedIds.length - 1)
          await new Promise((r) => setTimeout(r, 4000));
      }
      await fetchCandidates(id, parameters.positionName);
      setSelectedCVs([]);
      setShowUpload(false);
      setIsProcessing(false);
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
      setIsProcessing(false);
    }
  };
  if (!job && id !== "sample-1" && id !== "sample-2")
    return <div style={{ padding: "2rem" }}>Job not found</div>;
  const displayTitle = job
    ? job.title
    : id === "sample-1"
      ? "Senior Recruitment Specialist"
      : "Full Stack Developer - Internship";
  const roles = getRoles();
  const filtered = activeRoleFilter
    ? candidates.filter((c) => c.role_name === activeRoleFilter)
    : candidates;
  const highC = filtered.filter((c) => c.match_level === "High").length;
  const medC = filtered.filter((c) => c.match_level === "Medium").length;
  const avg =
    filtered.length > 0
      ? Math.round(
          filtered.reduce((s, c) => s + (c.score ?? 0), 0) / filtered.length,
        )
      : 0;
  const medals = ["1st", "2nd", "3rd"];
  const mc = {
    High: { bg: "#dcfce7", border: "#86efac", text: "#166534" },
    Medium: { bg: "#fef9c3", border: "#fde047", text: "#854d0e" },
    Low: { bg: "#ffdad6", border: "#fca5a5", text: "#ba1a1a" },
  };
  const barColor = (s) =>
    s >= 75 ? "#166534" : s >= 50 ? "#854d0e" : "#ba1a1a";
  const S = {
    row: { display: "flex", alignItems: "center" },
    hdr: {
      padding: "1rem 1.5rem",
      textAlign: "left",
      fontSize: "0.75rem",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    input: {
      width: "100%",
      border: "1px solid var(--color-outline-variant)",
      padding: "0.5rem 1rem",
      borderRadius: "0.25rem",
      fontFamily: "inherit",
      fontSize: "0.875rem",
      outline: "none",
    },
  };
  return (
    <div
      style={{
        background: "var(--color-background)",
        color: "var(--color-on-surface)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          background: "var(--color-primary)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 1.5rem",
        }}
      >
        <div style={{ ...S.row, gap: "3rem" }}>
          <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "white" }}>
            ACC Career
          </span>
          <nav style={{ ...S.row, gap: "2rem" }}>
            <Link
              to="/"
              style={{
                color: "rgba(255,255,255,0.8)",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Job Posting
            </Link>
            <Link
              to="/job-listing"
              style={{
                color: "white",
                fontWeight: 700,
                borderBottom: "2px solid var(--color-secondary-container)",
                paddingBottom: "0.25rem",
                textDecoration: "none",
              }}
            >
              Job Listing
            </Link>
          </nav>
        </div>
      </header>
      <main
        style={{
          flexGrow: 1,
          padding: "2rem 1.5rem",
          maxWidth: "80rem",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            marginBottom: "2rem",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "2.25rem",
                  fontWeight: 700,
                  color: "var(--color-primary)",
                }}
              >
                Candidate Management
              </h1>
              <div
                style={{
                  ...S.row,
                  gap: "0.5rem",
                  color: "var(--color-on-surface-variant)",
                }}
              >
                <span className="material-symbols-outlined">work</span>
                <span style={{ fontSize: "1.125rem" }}>{displayTitle}</span>
              </div>
            </div>
            <button
              onClick={() => setShowUpload((v) => !v)}
              style={{
                ...S.row,
                gap: "0.5rem",
                background: "var(--color-secondary-container)",
                color: "var(--color-on-secondary-container)",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.25rem",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
              }}
            >
              <span className="material-symbols-outlined">upload_file</span>
              Upload CV
            </button>
          </div>
        </div>
        {showUpload && (
          <div
            style={{
              background: "white",
              border: "1px solid var(--color-outline-variant)",
              borderRadius: "0.5rem",
              padding: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h3
                style={{
                  fontWeight: 700,
                  color: "var(--color-primary)",
                  fontSize: "1.25rem",
                }}
              >
                Upload Applicant CVs
              </h3>
              <button
                onClick={() => setShowUpload(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {roles.length > 0 && (
              <div
                style={{
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                  color: "var(--color-primary)",
                  background: "rgba(0,62,111,0.05)",
                  border: "1px solid rgba(0,62,111,0.2)",
                  borderRadius: "0.25rem",
                  padding: "0.5rem 1rem",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "1rem" }}
                >
                  auto_awesome
                </span>
                <span>
                  AI akan otomatis menentukan role terbaik:{" "}
                  <strong>{roles.join(", ")}</strong>
                </span>
              </div>
            )}
            <div
              {...getRootProps()}
              style={{
                border: `2px dashed ${isDragActive ? "var(--color-primary)" : "var(--color-outline-variant)"}`,
                borderRadius: "0.5rem",
                padding: "2.5rem",
                textAlign: "center",
                cursor: "pointer",
                background: isDragActive
                  ? "rgba(0,62,111,0.05)"
                  : "transparent",
              }}
            >
              <input {...getInputProps()} />
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: "2.5rem",
                  display: "block",
                  color: "var(--color-on-surface-variant)",
                }}
              >
                cloud_upload
              </span>
              <p
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 500,
                  color: "var(--color-on-surface-variant)",
                }}
              >
                Drag &amp; drop CVs atau klik untuk pilih
              </p>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-on-surface-variant)",
                }}
              >
                Format PDF
              </p>
            </div>
            {selectedCVs.length > 0 && (
              <div style={{ marginTop: "1.5rem" }}>
                <h4
                  style={{
                    fontWeight: 600,
                    marginBottom: "0.75rem",
                    fontSize: "1.125rem",
                  }}
                >
                  Selected Files ({selectedCVs.length})
                </h4>
                <ul
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.75rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  {selectedCVs.map((f, i) => (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        border: "1px solid var(--color-outline-variant)",
                        padding: "0.75rem",
                        borderRadius: "0.25rem",
                        background: "white",
                      }}
                    >
                      <div style={{ overflow: "hidden", paddingRight: "1rem" }}>
                        <span
                          style={{
                            fontWeight: 500,
                            fontSize: "0.875rem",
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {f.name}
                        </span>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--color-on-surface-variant)",
                          }}
                        >
                          {Math.round(f.size / 1024)} KB
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCVs((p) => p.filter((_, j) => j !== i));
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--color-error)",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "1rem" }}
                        >
                          delete
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    borderTop: "1px solid var(--color-outline-variant)",
                    paddingTop: "1.5rem",
                  }}
                >
                  <button
                    onClick={handleProcessCVs}
                    disabled={isProcessing}
                    style={{
                      padding: "0.75rem 2rem",
                      background: "var(--color-primary)",
                      color: "var(--color-on-primary)",
                      fontWeight: 700,
                      borderRadius: "0.25rem",
                      border: "none",
                      cursor: isProcessing ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      opacity: isProcessing ? 0.7 : 1,
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <svg
                          style={{
                            width: "1.25rem",
                            height: "1.25rem",
                            animation: "spin 1s linear infinite",
                          }}
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            opacity="0.25"
                          />
                          <path
                            fill="currentColor"
                            opacity="0.75"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        Menganalisis...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">
                          psychology
                        </span>
                        Analisis CV
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {[
            {
              label: "Total Kandidat",
              val: filtered.length,
              style: { background: "white", color: "var(--color-primary)" },
            },
            {
              label: "High Match",
              val: highC,
              style: { background: "white", color: "#166534" },
            },
            {
              label: "Medium Match",
              val: medC,
              style: { background: "white", color: "#854d0e" },
            },
            {
              label: "Rata-rata Skor",
              val: avg > 0 ? avg : "-",
              style: { background: "var(--color-primary)", color: "white" },
            },
          ].map(({ label, val, style }) => (
            <div
              key={label}
              style={{
                ...style,
                border: "1px solid var(--color-outline-variant)",
                borderRadius: "0.25rem",
                padding: "1.5rem",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  opacity: 0.8,
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                {label}
              </span>
              <span style={{ fontSize: "1.875rem", fontWeight: 700 }}>
                {val}
              </span>
            </div>
          ))}
        </div>
        <div
          style={{
            background: "white",
            border: "1px solid var(--color-outline-variant)",
            borderRadius: "0.25rem",
            overflow: "hidden",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            color: "black",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.75rem 1.5rem",
              borderBottom: "1px solid var(--color-outline-variant)",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                Daftar Kandidat{" "}
                {isProcessing && (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--color-on-surface-variant)",
                      marginLeft: "0.5rem",
                    }}
                  >
                    (memperbarui...)
                  </span>
                )}
              </span>
              {roles.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    flexWrap: "wrap",
                  }}
                >
                  {["", ...roles].map((r) => (
                    <button
                      key={r || "all"}
                      onClick={() => setActiveRoleFilter(r)}
                      style={{
                        fontSize: "0.75rem",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "9999px",
                        fontWeight: 600,
                        border: `1px solid ${activeRoleFilter === r ? "var(--color-primary)" : "var(--color-outline-variant)"}`,
                        background:
                          activeRoleFilter === r
                            ? "var(--color-primary)"
                            : "transparent",
                        color:
                          activeRoleFilter === r
                            ? "var(--color-on-primary)"
                            : "var(--color-on-surface-variant)",
                        cursor: "pointer",
                      }}
                    >
                      {r === "" ? "Semua" : r}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() =>
                fetchCandidates(id, job?.title || job?.positionName)
              }
              disabled={loadingCandidates}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                fontSize: "0.75rem",
                color: "var(--color-secondary)",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <span
                className={`material-symbols-outlined${loadingCandidates ? " animate-spin" : ""}`}
                style={{ fontSize: "0.875rem" }}
              >
                refresh
              </span>
              Refresh
            </button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                textAlign: "left",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#fe9835",
                    color: "#693600",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  <th style={S.hdr}>Rank</th>
                  <th style={S.hdr}>Nama Kandidat</th>
                  <th style={S.hdr}>Kontak</th>
                  {roles.length > 0 && <th style={S.hdr}>Role</th>}
                  <th style={S.hdr}>AI Matching Score</th>
                  <th style={S.hdr}>Match Level</th>
                </tr>
              </thead>
              <tbody>
                {loadingCandidates &&
                  candidates.length === 0 &&
                  [1, 2, 3].map((i) => (
                    <tr key={i}>
                      {[80, 160, 120, 160, 80].map((w, j) => (
                        <td key={j} style={{ padding: "1.5rem" }}>
                          <div
                            className="shimmer"
                            style={{
                              height: "1rem",
                              width: w,
                              borderRadius: "0.25rem",
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                {!loadingCandidates && candidates.length === 0 && (
                  <tr>
                    <td
                      colSpan={roles.length > 0 ? 6 : 5}
                      style={{
                        padding: "3rem",
                        textAlign: "center",
                        fontSize: "0.875rem",
                        color: "var(--color-on-surface-variant)",
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: "2.5rem",
                          display: "block",
                          marginBottom: "0.5rem",
                          opacity: 0.3,
                        }}
                      >
                        people
                      </span>
                      Belum ada kandidat. Upload CV untuk memulai.
                    </td>
                  </tr>
                )}
                {filtered.map((c, i) => {
                  const s = c.score ?? 0;
                  const col = barColor(s);
                  const m = mc[c.match_level] || mc.Low;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCandidate(c)}
                      style={{
                        backgroundColor: i % 2 === 0 ? "#fff" : "#f8f9fa",
                        cursor: "pointer",
                      }}
                    >
                      <td
                        style={{
                          padding: "1rem 1.5rem",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                        }}
                      >
                        {i < 3 ? medals[i] : `#${i + 1}`}
                      </td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <p
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: "#003e6f",
                          }}
                        >
                          {c.candidate_name || "Nama tidak terdeteksi"}
                        </p>
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--color-on-surface-variant)",
                            marginTop: "0.125rem",
                          }}
                        >
                          {c.file_name}
                        </p>
                      </td>
                      <td
                        style={{
                          padding: "1rem 1.5rem",
                          fontSize: "0.875rem",
                          color: "var(--color-on-surface-variant)",
                        }}
                      >
                        {c.email || c.phone || "-"}
                      </td>
                      {roles.length > 0 && (
                        <td style={{ padding: "1rem 1.5rem" }}>
                          {c.role_name ? (
                            <span
                              style={{
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                padding: "0.25rem 0.625rem",
                                borderRadius: "9999px",
                                background: "rgba(0,62,111,0.1)",
                                color: "var(--color-primary)",
                                border: "1px solid rgba(0,62,111,0.2)",
                              }}
                            >
                              {c.role_name}
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--color-on-surface-variant)",
                              }}
                            >
                              -
                            </span>
                          )}
                        </td>
                      )}
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <div
                            style={{
                              flexGrow: 1,
                              height: "0.5rem",
                              borderRadius: "9999px",
                              background: "var(--color-surface-container-high)",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                borderRadius: "9999px",
                                width: `${s}%`,
                                backgroundColor: col,
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: "0.875rem",
                              fontWeight: 700,
                              width: "2.5rem",
                              textAlign: "right",
                              color: col,
                            }}
                          >
                            {s}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            padding: "0.25rem 0.625rem",
                            borderRadius: "9999px",
                            background: m.bg,
                            border: `1px solid ${m.border}`,
                            color: m.text,
                          }}
                        >
                          {c.match_level || "-"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {candidates.length > 0 && (
            <div
              style={{
                padding: "0.75rem 1.5rem",
                borderTop: "1px solid var(--color-outline-variant)",
                background: "var(--color-surface-container-low)",
                fontSize: "0.75rem",
                color: "var(--color-on-surface-variant)",
              }}
            >
              Menampilkan {filtered.length} kandidat, diurutkan berdasarkan skor
              tertinggi
            </div>
          )}
        </div>
      </main>
      {selectedCandidate && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedCandidate(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "32rem",
              maxHeight: "85vh",
              overflowY: "auto",
              borderRadius: "0.5rem",
              background: "white",
              border: "1px solid var(--color-outline-variant)",
              boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                padding: "1.5rem",
                borderBottom: "1px solid var(--color-outline-variant)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>
                  {selectedCandidate.candidate_name || "Tidak diketahui"}
                </h2>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-on-surface-variant)",
                    marginTop: "0.125rem",
                  }}
                >
                  {selectedCandidate.email}
                  {selectedCandidate.email && selectedCandidate.phone
                    ? " · "
                    : ""}
                  {selectedCandidate.phone}
                </p>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-on-surface-variant)",
                    marginTop: "0.25rem",
                  }}
                >
                  Skor: <strong>{selectedCandidate.score}</strong> ·{" "}
                  {selectedCandidate.match_level}
                  {selectedCandidate.role_name && (
                    <span>
                      {" "}
                      · Role: <strong>{selectedCandidate.role_name}</strong>
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.5rem",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
            <div
              style={{
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {selectedCandidate.summary && (
                <div>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--color-on-surface-variant)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Ringkasan
                  </p>
                  <p style={{ fontSize: "0.875rem", lineHeight: 1.625 }}>
                    {selectedCandidate.summary}
                  </p>
                </div>
              )}
              {selectedCandidate.role_scores &&
                Object.keys(selectedCandidate.role_scores).length > 0 && (
                  <div>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "var(--color-on-surface-variant)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Skor per Role
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                      }}
                    >
                      {Object.entries(selectedCandidate.role_scores)
                        .sort((a, b) => b[1] - a[1])
                        .map(([role, s]) => {
                          const isA = role === selectedCandidate.role_name;
                          const c =
                            s >= 70
                              ? "#166534"
                              : s >= 45
                                ? "#854d0e"
                                : "#ba1a1a";
                          return (
                            <div
                              key={role}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  width: "4rem",
                                  flexShrink: 0,
                                  color: isA
                                    ? "var(--color-primary)"
                                    : "var(--color-on-surface-variant)",
                                }}
                              >
                                {role}
                                {isA ? " ★" : ""}
                              </span>
                              <div
                                style={{
                                  flexGrow: 1,
                                  height: "0.5rem",
                                  borderRadius: "9999px",
                                  background:
                                    "var(--color-surface-container-high)",
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    height: "100%",
                                    borderRadius: "9999px",
                                    width: `${s}%`,
                                    backgroundColor: c,
                                  }}
                                />
                              </div>
                              <span
                                style={{
                                  fontSize: "0.75rem",
                                  fontWeight: 700,
                                  width: "2rem",
                                  textAlign: "right",
                                  color: c,
                                }}
                              >
                                {s}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              {selectedCandidate.matched_requirements?.length > 0 && (
                <div>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#166534",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Terpenuhi
                  </p>
                  <ul
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.25rem",
                    }}
                  >
                    {selectedCandidate.matched_requirements.map((r, i) => (
                      <li
                        key={i}
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          fontSize: "0.875rem",
                        }}
                      >
                        <span style={{ color: "#166534" }}>✓</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedCandidate.missing_requirements?.length > 0 && (
                <div>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#ba1a1a",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Tidak Terpenuhi
                  </p>
                  <ul
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.25rem",
                    }}
                  >
                    {selectedCandidate.missing_requirements.map((r, i) => (
                      <li
                        key={i}
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          fontSize: "0.875rem",
                        }}
                      >
                        <span style={{ color: "#ba1a1a" }}>✗</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedCandidate.reasoning && (
                <div
                  style={{
                    borderRadius: "0.5rem",
                    padding: "1rem",
                    background: "var(--color-surface-container)",
                    border: "1px solid var(--color-outline-variant)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#003e6f",
                      marginBottom: "0.25rem",
                    }}
                  >
                    AI Reasoning
                  </p>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      fontStyle: "italic",
                      lineHeight: 1.625,
                    }}
                  >
                    {selectedCandidate.reasoning}
                  </p>
                </div>
              )}
            </div>
            <div
              style={{
                padding: "1rem",
                borderTop: "1px solid var(--color-outline-variant)",
              }}
            >
              <button
                onClick={() => setSelectedCandidate(null)}
                style={{
                  width: "100%",
                  padding: "0.625rem",
                  borderRadius: "0.25rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  border: "1px solid var(--color-outline-variant)",
                  background: "none",
                  cursor: "pointer",
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      <footer
        style={{
          background: "white",
          borderTop: "1px solid var(--color-outline-variant)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "2rem 1.5rem",
          marginTop: "auto",
        }}
      >
        <span
          style={{
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "var(--color-primary)",
          }}
        >
          Berijalan Recruitment
        </span>
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--color-on-surface-variant)",
            marginTop: "0.25rem",
          }}
        >
          © 2024 Berijalan Recruitment Management System. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
