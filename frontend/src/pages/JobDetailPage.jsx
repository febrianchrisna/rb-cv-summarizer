import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageHeader from "../components/PageHeader";

// ── Icons ────────────────────────────────────────────────────────
const IconExternalLink = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

const IconFileText = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const IconRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
  </svg>
);

// ── Candidate Modal ──────────────────────────────────────────────
function CandidateModal({ candidate, onClose }) {
  if (!candidate) return null;
  const matchColor = candidate.score >= 75 ? "#166534" : candidate.score >= 50 ? "#854d0e" : "#ba1a1a";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", padding: "2rem" }}>
      <div style={{ width: "100%", maxWidth: "900px", maxHeight: "90vh", display: "flex", flexDirection: "column", background: "#f5f6fa", borderRadius: "0.5rem", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
        
        {/* Modal Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem", background: "#ffffff", borderBottom: "1px solid #e5e7eb" }}>
          <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "#111827" }}>Candidate</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#6b7280" }}>×</button>
        </div>

        <div style={{ overflowY: "auto", flexGrow: 1, padding: "1.5rem" }}>
          {/* Hero Banner */}
          <div style={{ 
            background: "linear-gradient(135deg, #005BAA 0%, #003e6f 100%)", 
            borderRadius: "0.5rem 0.5rem 0 0", 
            padding: "2rem 1.5rem", 
            display: "flex", alignItems: "center", justifyContent: "space-between",
            color: "#ffffff"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "#e0f2fe", color: "#005BAA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", fontWeight: 700, border: "4px solid #ffffff", position: "relative" }}>
                {(candidate.candidate_name || "??").substring(0,2).toUpperCase()}
                <div style={{ position: "absolute", bottom: 0, right: 0, width: "24px", height: "24px", background: "#0ea5e9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #ffffff" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                </div>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700 }}>{candidate.candidate_name || "Nama tidak terdeteksi"}</h3>
                <p style={{ margin: "0.5rem 0 0", fontSize: "0.9375rem", opacity: 0.9 }}>
                  Jakarta • Laki-laki • 25 Years Old • {candidate.phone || "08xxxx"} • {candidate.email || "email@domain.com"} <span style={{ color: "#4ade80" }}>✔</span>
                </p>
              </div>
            </div>
            <button style={{ background: "#ffffff", color: "#005BAA", border: "none", padding: "0.5rem 1.25rem", borderRadius: "0.25rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              Move <span style={{ fontSize: "1.25rem", lineHeight: 1 }}>→</span>
            </button>
          </div>

          {/* Info Bar */}
          <div style={{ background: "#fffbeb", padding: "1rem 1.5rem", border: "1px solid #fde68a", borderRadius: "0 0 0.5rem 0.5rem", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem", color: "#4b5563" }}>
            <div style={{ display: "flex", gap: "2rem" }}>
              <span>Pre-screening Questions : <strong>2/3</strong></span>
              <span>Required Resume Information : <strong>3/5</strong></span>
              <span>Last Updated at 12 December 2026</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <span>Qualification : <strong>{candidate.score}%</strong></span>
              {["Age", "Degree", "GPA Minimum", "University", "Major"].map(t => (
                <span key={t} style={{ background: "#22c55e", color: "#ffffff", padding: "0.125rem 0.5rem", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 600 }}>{t}</span>
              ))}
              <span style={{ background: "#f3f4f6", padding: "0.125rem 0.5rem", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 600 }}>Work Exp</span>
            </div>
            <div>Reference: <strong>Website Career ACC, Instagram ACC</strong></div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button style={{ background: "#22c55e", color: "#fff", border: "none", padding: "0.625rem 1.25rem", borderRadius: "0.25rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <span>✔</span> Approve
            </button>
            <button style={{ background: "#ef4444", color: "#fff", border: "none", padding: "0.625rem 1.25rem", borderRadius: "0.25rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <span>×</span> Reject
            </button>
            <button style={{ background: "#0ea5e9", color: "#fff", border: "none", padding: "0.625rem 1.25rem", borderRadius: "0.25rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg> Divert
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", background: "#f3f4f6", borderRadius: "0.375rem", marginTop: "1.5rem", padding: "0.25rem" }}>
            <button style={{ flex: 1, padding: "0.75rem", background: "#ffffff", color: "#005BAA", fontWeight: 700, border: "none", borderRadius: "0.25rem", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>Summary AI</button>
            <button disabled style={{ flex: 1, padding: "0.75rem", background: "transparent", color: "#9ca3af", fontWeight: 600, border: "none", cursor: "not-allowed" }}>Summary Resume</button>
            <button disabled style={{ flex: 1, padding: "0.75rem", background: "transparent", color: "#9ca3af", fontWeight: 600, border: "none", cursor: "not-allowed" }}>Event History</button>
            <button disabled style={{ flex: 1, padding: "0.75rem", background: "transparent", color: "#9ca3af", fontWeight: 600, border: "none", cursor: "not-allowed" }}>Recruitment Detail</button>
            <button disabled style={{ flex: 1, padding: "0.75rem", background: "transparent", color: "#9ca3af", fontWeight: 600, border: "none", cursor: "not-allowed" }}>Log History</button>
          </div>

          {/* AI Summary Content */}
          <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", border: "1px solid #005BAA", color: "#005BAA", background: "#fff", borderRadius: "0.25rem", fontWeight: 600, cursor: "pointer" }}>
                Download CV <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              </button>
            </div>

            <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}>
              <h4 style={{ margin: "0 0 0.5rem", color: "#111827", fontSize: "1rem" }}>AI Match Level</h4>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ fontSize: "2rem", fontWeight: 800, color: matchColor }}>{candidate.score}%</span>
                <span style={{ background: matchColor, color: "#fff", padding: "0.25rem 0.75rem", borderRadius: "99px", fontSize: "0.875rem", fontWeight: 700 }}>{candidate.match_level}</span>
              </div>
            </div>

            {candidate.summary && (
              <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}>
                <h4 style={{ margin: "0 0 0.5rem", color: "#111827", fontSize: "1rem" }}>Executive Summary</h4>
                <p style={{ margin: 0, fontSize: "0.9375rem", color: "#4b5563", lineHeight: 1.6 }}>{candidate.summary}</p>
              </div>
            )}

            {(candidate.matched_requirements?.length > 0 || candidate.missing_requirements?.length > 0) && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}>
                  <h4 style={{ margin: "0 0 0.75rem", color: "#166534", fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}><span>✔</span> Terpenuhi</h4>
                  <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "#4b5563", fontSize: "0.9375rem" }}>
                    {candidate.matched_requirements?.map((r, i) => <li key={i} style={{ marginBottom: "0.25rem" }}>{r}</li>)}
                  </ul>
                </div>
                <div style={{ background: "#fff", padding: "1.5rem", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}>
                  <h4 style={{ margin: "0 0 0.75rem", color: "#ba1a1a", fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}><span>×</span> Tidak Terpenuhi</h4>
                  <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "#4b5563", fontSize: "0.9375rem" }}>
                    {candidate.missing_requirements?.map((r, i) => <li key={i} style={{ marginBottom: "0.25rem" }}>{r}</li>)}
                  </ul>
                </div>
              </div>
            )}

            {candidate.reasoning && (
              <div style={{ background: "#f8fafc", padding: "1.5rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0" }}>
                <h4 style={{ margin: "0 0 0.5rem", color: "#005BAA", fontSize: "1rem" }}>AI Reasoning</h4>
                <p style={{ margin: 0, fontSize: "0.9375rem", color: "#475569", lineHeight: 1.6, fontStyle: "italic" }}>{candidate.reasoning}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page Component ──────────────────────────────────────────
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
      }
      for (let i = 0; i < analysisIds.length; i++) {
        await fetch("/api/process-cv", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ analysisId: analysisIds[i] }) });
        if (i < analysisIds.length - 1) await new Promise(r => setTimeout(r, 2000));
      }
      await fetchCandidates(id);
      setSelectedCVs([]);
      setShowUpload(false);
    } catch (err) { alert("Error: " + err.message); }
    finally { setIsProcessing(false); }
  };

  if (!job) return <div style={{ padding: "2rem" }}>Loading...</div>;

  const roles = job?.position_name?.split(",").map(s => s.trim()).filter(Boolean) || [];
  const filteredCandidates = activeRoleFilter
    ? candidates.filter((c) => c.role_name === activeRoleFilter)
    : candidates;
  const medals = ["1st", "2nd", "3rd"];

  return (
    <div style={{ background: "#f5f6fa", minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Source Sans 3', 'Source Sans Pro', system-ui, sans-serif" }}>
      <Navbar />

      {/* Candidate Modal */}
      <CandidateModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} />

      <PageHeader title="Application Tracking System" />

      <main style={{ flexGrow: 1, padding: "2rem 2.5rem", maxWidth: "1400px", margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        
        {/* Title Area */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ fontSize: "2.25rem", fontWeight: 700, color: "#005BAA", margin: 0 }}>{job.title}</h1>
          </div>
          <button onClick={() => setShowUpload(v => !v)} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#FE9835", color: "#fff", padding: "0.75rem 1.5rem", borderRadius: "0.25rem", fontWeight: 700, border: "none", cursor: "pointer" }}>
            <span className="material-symbols-outlined">upload_file</span> {showUpload ? "Tutup Upload" : "Upload CV"}
          </button>
        </div>

        {/* Tab Steps */}
        <div style={{ display: "flex", background: "#f8fafc", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", marginBottom: "2rem", width: "100vw", position: "relative", left: "50%", right: "50%", marginLeft: "-50vw", marginRight: "-50vw" }}>
          <div style={{ flex: 1, padding: "1.5rem 0", textAlign: "center", background: "#eff6ff", borderBottom: "3px solid #005BAA" }}>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "#005BAA", lineHeight: 1 }}>{candidates.length}</div>
            <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#005BAA", marginTop: "0.5rem" }}>Applications</div>
          </div>
          {["Shortlist", "On-going Recruitment", "Hired", "Archived"].map((step, i) => (
            <div key={step} style={{ flex: 1, padding: "1.5rem 0", textAlign: "center", borderLeft: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "2rem", fontWeight: 700, color: "#111827", lineHeight: 1 }}>0 {i === 2 && <span style={{ color: "#6b7280", fontSize: "1.5rem", fontWeight: 600 }}>(0 / 4)</span>}</div>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#4b5563", marginTop: "0.5rem" }}>{step}</div>
            </div>
          ))}
        </div>

        {/* Filter Area */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          {roles.length > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginRight: "0.5rem" }}>Filter Role:</span>
              {["", ...roles].map((r) => (
                <button
                  key={r || "all"}
                  onClick={() => setActiveRoleFilter(r)}
                  style={{
                    fontSize: "0.8125rem",
                    padding: "0.375rem 1rem",
                    borderRadius: "9999px",
                    fontWeight: 600,
                    border: `1px solid ${activeRoleFilter === r ? "#005BAA" : "#d1d5db"}`,
                    background: activeRoleFilter === r ? "#005BAA" : "#fff",
                    color: activeRoleFilter === r ? "#fff" : "#4b5563",
                    cursor: "pointer",
                    transition: "all 0.15s"
                  }}
                >
                  {r === "" ? "Semua Kandidat" : r}
                </button>
              ))}
            </div>
          ) : <div />}
          <button onClick={() => fetchCandidates(id)} style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8125rem", color: "#005BAA", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
            <span className={`material-symbols-outlined ${loadingCandidates ? 'animate-spin' : ''}`} style={{ fontSize: "1rem" }}>refresh</span> Refresh
          </button>
        </div>

        {/* Upload Box */}
        {showUpload && (
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "0.5rem", padding: "1.5rem", marginBottom: "2rem" }}>
            <h3 style={{ margin: "0 0 1rem", color: "#005BAA", fontSize: "1.125rem", fontWeight: 700 }}>Upload Applicant CVs</h3>
            <div {...getRootProps()} style={{ border: `2px dashed ${isDragActive ? "#005BAA" : "#d1d5db"}`, borderRadius: "0.5rem", padding: "2.5rem", textAlign: "center", cursor: "pointer", background: isDragActive ? "#eff6ff" : "#fafafa" }}>
              <input {...getInputProps()} />
              <span className="material-symbols-outlined" style={{ fontSize: "2.5rem", color: "#9ca3af" }}>cloud_upload</span>
              <p style={{ fontSize: "1rem", fontWeight: 600, color: "#6b7280", margin: "0.5rem 0 0" }}>Drag & drop CVs atau klik untuk pilih</p>
            </div>
            {selectedCVs.length > 0 && (
              <div style={{ marginTop: "1.5rem" }}>
                <ul style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", margin: "0 0 1.5rem", padding: 0, listStyle: "none" }}>
                  {selectedCVs.map((f, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #e5e7eb", padding: "0.75rem", borderRadius: "0.25rem", background: "white" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{f.name}</span>
                      <button onClick={() => setSelectedCVs(p => p.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: "1.25rem", fontWeight: 700, lineHeight: 1 }}>×</button>
                    </li>
                  ))}
                </ul>
                <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid #e5e7eb", paddingTop: "1.5rem" }}>
                  <button onClick={handleProcessCVs} disabled={isProcessing} style={{ padding: "0.75rem 2rem", background: "#005BAA", color: "#fff", fontWeight: 700, borderRadius: "0.25rem", border: "none", cursor: isProcessing ? "not-allowed" : "pointer", opacity: isProcessing ? 0.7 : 1 }}>
                    {isProcessing ? "Menganalisis..." : "Proses Analisis AI"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Table Area */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "0.25rem", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#005BAA", color: "#fff" }}>
                  {["Rank", "Nama Kandidat", "Kontak", ...(roles.length > 0 ? ["Role"] : []), "AI Matching Score", "Match Level"].map(h => (
                    <th key={h} style={{ padding: "1rem 1.5rem", fontSize: "0.8125rem", fontWeight: 700, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.length === 0 && !loadingCandidates && (
                  <tr>
                    <td colSpan={roles.length > 0 ? 6 : 5} style={{ padding: "6rem 2rem", textAlign: "center", background: "#f8fafc" }}>
                      <div style={{ width: "64px", height: "64px", background: "#fff", border: "1px solid #e2e8f0", margin: "0 auto 1rem", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "0.25rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      </div>
                      <p style={{ fontSize: "1rem", fontWeight: 700, color: "#111827", margin: 0 }}>Belum Ada Data Yang Ditambahkan</p>
                    </td>
                  </tr>
                )}
                {filteredCandidates.map((c, i) => {
                  const s = c.score ?? 0;
                  const col = s >= 75 ? "#166534" : s >= 50 ? "#854d0e" : "#ba1a1a";
                  const mBg = s >= 75 ? "#dcfce7" : s >= 50 ? "#fef9c3" : "#ffdad6";
                  const mBorder = s >= 75 ? "#86efac" : s >= 50 ? "#fde047" : "#fca5a5";
                  
                  return (
                    <tr key={c.id} onClick={() => setSelectedCandidate(c)} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#f9fafb", cursor: "pointer", borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "1rem 1.5rem", fontSize: "0.9375rem", fontWeight: 700, color: "#005BAA" }}>{i < 3 ? medals[i] : `#${i + 1}`}</td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#111827", margin: "0 0 0.25rem" }}>{c.candidate_name || "Nama tidak terdeteksi"}</p>
                        <p style={{ fontSize: "0.8125rem", color: "#6b7280", margin: 0 }}>{c.file_name}</p>
                      </td>
                      <td style={{ padding: "1rem 1.5rem", fontSize: "0.9375rem", color: "#4b5563" }}>{c.email || c.phone || "-"}</td>
                      {roles.length > 0 && (
                        <td style={{ padding: "1rem 1.5rem" }}>
                          {c.role_name ? <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "0.25rem 0.75rem", borderRadius: "99px", background: "#eff6ff", color: "#005BAA", border: "1px solid #bfdbfe" }}>{c.role_name}</span> : "-"}
                        </td>
                      )}
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{ flexGrow: 1, height: "0.5rem", borderRadius: "99px", background: "#f1f5f9", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${s}%`, backgroundColor: col }} />
                          </div>
                          <span style={{ fontSize: "0.9375rem", fontWeight: 800, color: col }}>{s}</span>
                        </div>
                      </td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <span style={{ fontSize: "0.8125rem", fontWeight: 700, padding: "0.25rem 0.75rem", borderRadius: "99px", background: mBg, border: `1px solid ${mBorder}`, color: col }}>{c.match_level || "-"}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
