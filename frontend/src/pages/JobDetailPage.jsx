import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDropzone } from "react-dropzone";

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [selectedCVs, setSelectedCVs] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [activeRoleFilter, setActiveRoleFilter] = useState("");

  const fetchCandidates = async (jobIdParam) => {
    if (!jobIdParam) return;
    setLoadingCandidates(true);
    try {
      const res = await fetch(`/api/get-results?job_id=${encodeURIComponent(jobIdParam)}`);
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
      fetch(`/api/jobs/${id}`)
        .then(r => r.json())
        .then(json => {
          if (json.success) {
            setJob(json.data);
            fetchCandidates(id);
          }
        })
        .catch(err => console.error(err));
    }
  }, [id]);

  useEffect(() => {
    if (!isProcessing || !id) return;
    const t = setInterval(() => fetchCandidates(id), 5000);
    return () => clearInterval(t);
  }, [isProcessing, id]);

  const getRoles = () => {
    const raw = job?.position_name || "";
    const p = raw.split(",").map((s) => s.trim()).filter(Boolean);
    return p.length > 1 ? p : [];
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (f) => setSelectedCVs((p) => [...p, ...f]),
    accept: { "application/pdf": [".pdf"] },
  });

  const handleProcessCVs = async () => {
    if (!selectedCVs.length) return;
    setIsProcessing(true);
    
    try {
      const analysisIds = [];
      for (const cv of selectedCVs) {
        const fd = new FormData();
        fd.append("cv", cv);
        fd.append("job_id", id);
        
        const r = await fetch("/api/queue-cv", { method: "POST", body: fd });
        const j = await r.json();
        if (r.ok && j.success) analysisIds.push(j.analysisId);
        else console.error("queue-cv error:", j.error);
      }

      if (!analysisIds.length)
        throw new Error("Tidak ada CV yang berhasil di-queue.");

      for (let i = 0; i < analysisIds.length; i++) {
        const r = await fetch("/api/process-cv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ analysisId: analysisIds[i] }),
        });
        const j = await r.json();
        if (!j.success) console.error("process-cv error:", j.error);
        if (i < analysisIds.length - 1)
          await new Promise((r) => setTimeout(r, 2000));
      }

      await fetchCandidates(id);
      setSelectedCVs([]);
      setShowUpload(false);
      setIsProcessing(false);
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
      setIsProcessing(false);
    }
  };

  if (!job) return <div style={{ padding: "2rem" }}>Loading...</div>;

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
  };

  return (
    <div style={{ background: "var(--color-background)", color: "var(--color-on-surface)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ background: "var(--color-primary)", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.5rem" }}>
        <div style={{ ...S.row, gap: "3rem" }}>
          <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "white" }}>ACC Career</span>
          <nav style={{ ...S.row, gap: "2rem" }}>
            <Link to="/" style={{ color: "rgba(255,255,255,0.8)", fontWeight: 700, textDecoration: "none" }}>Job Posting</Link>
            <Link to="/job-listing" style={{ color: "white", fontWeight: 700, borderBottom: "2px solid var(--color-secondary-container)", paddingBottom: "0.25rem", textDecoration: "none" }}>Job Listing</Link>
          </nav>
        </div>
      </header>

      <main style={{ flexGrow: 1, padding: "2rem 1.5rem", maxWidth: "80rem", margin: "0 auto", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontSize: "2.25rem", fontWeight: 700, color: "var(--color-primary)" }}>Candidate Management</h1>
            <div style={{ ...S.row, gap: "0.5rem", color: "var(--color-on-surface-variant)" }}>
              <span className="material-symbols-outlined">work</span>
              <span style={{ fontSize: "1.125rem" }}>{job.title}</span>
            </div>
          </div>
          <button onClick={() => setShowUpload(v => !v)} style={{ ...S.row, gap: "0.5rem", background: "var(--color-secondary-container)", color: "var(--color-on-secondary-container)", padding: "0.75rem 1.5rem", borderRadius: "0.25rem", fontWeight: 700, border: "none", cursor: "pointer" }}>
            <span className="material-symbols-outlined">upload_file</span> Upload CV
          </button>
        </div>

        {showUpload && (
          <div style={{ background: "white", border: "1px solid var(--color-outline-variant)", borderRadius: "0.5rem", padding: "1.5rem", marginBottom: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontWeight: 700, color: "var(--color-primary)", fontSize: "1.25rem" }}>Upload Applicant CVs</h3>
              <button onClick={() => setShowUpload(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {roles.length > 0 && (
              <div style={{ marginBottom: "1rem", fontSize: "0.875rem", color: "var(--color-primary)", background: "rgba(0,62,111,0.05)", border: "1px solid rgba(0,62,111,0.2)", borderRadius: "0.25rem", padding: "0.5rem 1rem" }}>
                AI akan otomatis menentukan role terbaik: <strong>{roles.join(", ")}</strong>
              </div>
            )}
            <div {...getRootProps()} style={{ border: `2px dashed ${isDragActive ? "var(--color-primary)" : "var(--color-outline-variant)"}`, borderRadius: "0.5rem", padding: "2.5rem", textAlign: "center", cursor: "pointer", background: isDragActive ? "rgba(0,62,111,0.05)" : "transparent" }}>
              <input {...getInputProps()} />
              <span className="material-symbols-outlined" style={{ fontSize: "2.5rem", display: "block", color: "var(--color-on-surface-variant)" }}>cloud_upload</span>
              <p style={{ fontSize: "1.125rem", fontWeight: 500, color: "var(--color-on-surface-variant)" }}>Drag & drop CVs atau klik untuk pilih</p>
            </div>
            {selectedCVs.length > 0 && (
              <div style={{ marginTop: "1.5rem" }}>
                <ul style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
                  {selectedCVs.map((f, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid var(--color-outline-variant)", padding: "0.75rem", borderRadius: "0.25rem", background: "white" }}>
                      <span style={{ fontWeight: 500, fontSize: "0.875rem" }}>{f.name}</span>
                      <button onClick={() => setSelectedCVs(p => p.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-error)" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>delete</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <button onClick={handleProcessCVs} disabled={isProcessing} style={{ padding: "0.75rem 2rem", background: "var(--color-primary)", color: "var(--color-on-primary)", fontWeight: 700, borderRadius: "0.25rem", border: "none", cursor: isProcessing ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "auto" }}>
                  {isProcessing ? "Menganalisis..." : "Analisis CV"}
                </button>
              </div>
            )}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Total Kandidat", val: filtered.length, style: { background: "white", color: "var(--color-primary)" } },
            { label: "High Match", val: highC, style: { background: "white", color: "#166534" } },
            { label: "Medium Match", val: medC, style: { background: "white", color: "#854d0e" } },
            { label: "Rata-rata Skor", val: avg > 0 ? avg : "-", style: { background: "var(--color-primary)", color: "white" } },
          ].map(({ label, val, style }) => (
            <div key={label} style={{ ...style, border: "1px solid var(--color-outline-variant)", borderRadius: "0.25rem", padding: "1.5rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "0.5rem", opacity: 0.8 }}>{label}</span>
              <span style={{ fontSize: "1.875rem", fontWeight: 700 }}>{val}</span>
            </div>
          ))}
        </div>

        <div style={{ background: "white", border: "1px solid var(--color-outline-variant)", borderRadius: "0.25rem", overflow: "hidden", color: "black" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1.5rem", borderBottom: "1px solid var(--color-outline-variant)", flexWrap: "wrap", gap: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Daftar Kandidat {isProcessing && "(memperbarui...)"}</span>
              {roles.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", flexWrap: "wrap" }}>
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
                        background: activeRoleFilter === r ? "var(--color-primary)" : "transparent",
                        color: activeRoleFilter === r ? "var(--color-on-primary)" : "var(--color-on-surface-variant)",
                        cursor: "pointer",
                      }}
                    >
                      {r === "" ? "Semua" : r}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => fetchCandidates(id)} style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: "var(--color-secondary)", background: "none", border: "none", cursor: "pointer" }}>
              <span className={`material-symbols-outlined ${loadingCandidates ? 'animate-spin' : ''}`} style={{ fontSize: "0.875rem" }}>refresh</span> Refresh
            </button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#fe9835", color: "#693600", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>
                  <th style={S.hdr}>Rank</th>
                  <th style={S.hdr}>Nama Kandidat</th>
                  <th style={S.hdr}>Kontak</th>
                  {roles.length > 0 && <th style={S.hdr}>Role</th>}
                  <th style={S.hdr}>AI Matching Score</th>
                  <th style={S.hdr}>Match Level</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && !loadingCandidates && (
                  <tr><td colSpan={roles.length > 0 ? 6 : 5} style={{ padding: "3rem", textAlign: "center", fontSize: "0.875rem", color: "var(--color-on-surface-variant)" }}>Belum ada kandidat. Upload CV untuk memulai.</td></tr>
                )}
                {filtered.map((c, i) => {
                  const s = c.score ?? 0;
                  const col = barColor(s);
                  const m = mc[c.match_level] || mc.Low;
                  return (
                    <tr key={c.id} onClick={() => setSelectedCandidate(c)} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#f8f9fa", cursor: "pointer", borderBottom: "1px solid var(--color-outline-variant)" }}>
                      <td style={{ padding: "1rem 1.5rem", fontSize: "0.875rem", fontWeight: 600 }}>{i < 3 ? medals[i] : `#${i + 1}`}</td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#003e6f" }}>{c.candidate_name || "Nama tidak terdeteksi"}</p>
                        <p style={{ fontSize: "0.75rem", color: "var(--color-on-surface-variant)" }}>{c.file_name}</p>
                      </td>
                      <td style={{ padding: "1rem 1.5rem", fontSize: "0.875rem" }}>{c.email || c.phone || "-"}</td>
                      {roles.length > 0 && (
                        <td style={{ padding: "1rem 1.5rem" }}>
                          {c.role_name ? (
                            <span style={{ fontSize: "0.75rem", fontWeight: 600, padding: "0.25rem 0.625rem", borderRadius: "9999px", background: "rgba(0,62,111,0.1)", color: "var(--color-primary)" }}>{c.role_name}</span>
                          ) : "-"}
                        </td>
                      )}
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <div style={{ flexGrow: 1, height: "0.5rem", borderRadius: "9999px", background: "var(--color-surface-container-high)", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${s}%`, backgroundColor: col }} />
                          </div>
                          <span style={{ fontSize: "0.875rem", fontWeight: 700, color: col }}>{s}</span>
                        </div>
                      </td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 600, padding: "0.25rem 0.625rem", borderRadius: "9999px", background: m.bg, border: `1px solid ${m.border}`, color: m.text }}>{c.match_level || "-"}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {selectedCandidate && (
        <div className="modal-backdrop" onClick={() => setSelectedCandidate(null)} style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: "32rem", maxHeight: "85vh", overflowY: "auto", borderRadius: "0.5rem", background: "white", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>{selectedCandidate.candidate_name || "Detail Kandidat"}</h2>
              <button onClick={() => setSelectedCandidate(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.5rem" }}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <p style={{ fontSize: "0.875rem" }}><strong>Email:</strong> {selectedCandidate.email || "-"}</p>
              <p style={{ fontSize: "0.875rem" }}><strong>Telepon:</strong> {selectedCandidate.phone || "-"}</p>
              <p style={{ fontSize: "0.875rem" }}><strong>Skor:</strong> {selectedCandidate.score}</p>
              {selectedCandidate.role_name && <p style={{ fontSize: "0.875rem" }}><strong>Role:</strong> {selectedCandidate.role_name}</p>}
              <p style={{ fontSize: "0.875rem" }}><strong>Ringkasan:</strong> {selectedCandidate.summary || "-"}</p>
              <div style={{ background: "#f8f9fa", padding: "1rem", borderRadius: "0.25rem" }}>
                 <p style={{ fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>AI REASONING</p>
                 <p style={{ fontSize: "0.875rem", fontStyle: "italic" }}>{selectedCandidate.reasoning}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
