import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

export default function ResultsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('job_id');

  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!jobId) {
      setError("job_id tidak ditemukan");
      setLoading(false);
      return;
    }

    fetch(`/api/get-results?job_id=${jobId}`)
      .then(r => r.json())
      .then(json => {
        if (json.success) setCandidates(json.data || []);
        else setError(json.error || 'Terjadi kesalahan');
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [jobId]);

  const getScoreColor = (score) => {
    if (score >= 75) return { bg: '#dcfce7', text: '#166534', border: '#86efac' };
    if (score >= 50) return { bg: '#fef9c3', text: '#854d0e', border: '#fde047' };
    return { bg: '#ffdad6', text: '#ba1a1a', border: '#fca5a5' };
  };

  const highCount = candidates.filter(c => c.match_level === 'High').length;
  const mediumCount = candidates.filter(c => c.match_level === 'Medium').length;
  const avgScore = candidates.length > 0
    ? Math.round(candidates.reduce((s, c) => s + (c.score ?? 0), 0) / candidates.length) : 0;

  const medals = ['1st', '2nd', '3rd'];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex justify-between items-center w-full px-6 py-4" style={{ backgroundColor: '#003e6f' }}>
        <div className="flex items-center gap-10">
          <span className="text-white font-bold text-2xl">ACC Career</span>
          <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', textDecoration: 'none' }}>Job Posting</Link>
            <Link to="/job-listing" style={{ color: 'white', borderBottom: '2px solid #fe9835', paddingBottom: '0.25rem', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>Job Listing</Link>
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => navigate('/post-job')} style={{ backgroundColor: '#fe9835', color: '#693600', fontWeight: 600, fontSize: '0.875rem', padding: '0.5rem 1.5rem', borderRadius: '0.25rem', border: 'none', cursor: 'pointer' }}>Post a Job</button>
        </div>
      </header>

      <section className="px-6 py-12" style={{ backgroundColor: '#005696' }}>
        <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
          <button onClick={() => navigate('/job-listing')} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', marginBottom: '1rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_back</span> Kembali ke Daftar
          </button>
          <h1 className="text-white font-bold text-4xl mb-2">Hasil Ranking CV</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>
            {candidates.length > 0 ? candidates[0].job_title : 'Memuat...'}
            {!loading && candidates.length > 0 && <span style={{ marginLeft: '0.5rem' }}>· {candidates.length} kandidat dianalisis</span>}
          </p>
        </div>
      </section>

      <main style={{ flexGrow: 1, padding: '2rem 1.5rem', maxWidth: '64rem', margin: '0 auto', width: '100%' }}>
        {!loading && candidates.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total Kandidat', value: candidates.length, color: '#003e6f', bg: '#d2e4ff' },
              { label: 'High Match', value: highCount, color: '#166534', bg: '#dcfce7' },
              { label: 'Medium Match', value: mediumCount, color: '#854d0e', bg: '#fef9c3' },
              { label: 'Rata-rata Skor', value: avgScore, color: '#693600', bg: '#ffdcc2' },
            ].map(stat => (
              <div key={stat.label} className="bg-surface-container-lowest rounded-lg border border-outline-variant p-4" style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: stat.color }}>{stat.value}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', marginTop: '0.25rem' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant overflow-hidden">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#fe9835', color: '#693600' }}>
                {['Rank', 'Nama Kandidat', 'Kontak', 'Skor', 'Match Level'].map(h => (
                  <th key={h} style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && [1,2,3,4].map(i => (
                <tr key={i}>
                  {[40,160,120,80,80].map((w,j) => (
                    <td key={j} style={{ padding: '1rem' }}><div className="shimmer" style={{ height: '1rem', width: w, borderRadius: '0.25rem' }} /></td>
                  ))}
                </tr>
              ))}
              {error && (
                <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center' }}>
                  <p style={{ color: '#ba1a1a', fontSize: '0.875rem', fontWeight: 500 }}>Gagal memuat hasil</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', marginTop: '0.25rem' }}>{error}</p>
                </td></tr>
              )}
              {!loading && !error && candidates.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>Belum ada hasil untuk posisi ini</p>
                </td></tr>
              )}
              {!loading && !error && candidates.map((c, i) => {
                const score = c.score ?? 0;
                const s = getScoreColor(score);
                const mc = { High: { bg:'#dcfce7', border:'#86efac', text:'#166534' }, Medium: { bg:'#fef9c3', border:'#fde047', text:'#854d0e' }, Low: { bg:'#ffdad6', border:'#fca5a5', text:'#ba1a1a' } };
                const m = mc[c.match_level] || mc.Low;
                return (
                  <tr key={c.id} onClick={() => setSelected(c)} style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#f3f4f5', cursor: 'pointer' }}>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>{i < 3 ? medals[i] : `#${i+1}`}</td>
                    <td style={{ padding: '1rem' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#003e6f' }}>{c.candidate_name || 'Nama tidak terdeteksi'}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', marginTop: '0.125rem' }}>{c.file_name}</p>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-on-surface-variant)' }}>{c.email || c.phone || <span style={{ fontStyle: 'italic', color: 'var(--color-outline)' }}>—</span>}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '4rem', height: '0.375rem', borderRadius: '9999px', background: 'var(--color-surface-container-high)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: '9999px', width: `${score}%`, backgroundColor: s.text }} />
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: '0.25rem', backgroundColor: s.bg, color: s.text }}>{score}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.625rem', borderRadius: '9999px', background: m.bg, border: `1px solid ${m.border}`, color: m.text }}>{c.match_level}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal */}
      {selected && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setSelected(null)}>
          <div className="modal-content" style={{ width: '100%', maxWidth: '32rem', maxHeight: '85vh', overflowY: 'auto', borderRadius: '0.5rem', background: 'white', border: '1px solid var(--color-outline-variant)', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-outline-variant)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{selected.candidate_name || 'Tidak diketahui'}</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-on-surface-variant)', marginTop: '0.125rem' }}>{selected.email}{selected.email && selected.phone ? ' · ' : ''}{selected.phone}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', marginTop: '0.25rem' }}>Skor: <strong>{selected.score}</strong> · {selected.match_level}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {selected.summary && <div><p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Ringkasan Profil</p><p style={{ fontSize: '0.875rem', lineHeight: 1.625 }}>{selected.summary}</p></div>}
              {selected.matched_requirements?.length > 0 && <div><p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Terpenuhi</p><ul style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>{selected.matched_requirements.map((r,i) => <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem' }}><span style={{ color: '#166534', flexShrink: 0 }}>✓</span>{r}</li>)}</ul></div>}
              {selected.missing_requirements?.length > 0 && <div><p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ba1a1a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Tidak Terpenuhi</p><ul style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>{selected.missing_requirements.map((r,i) => <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem' }}><span style={{ color: '#ba1a1a', flexShrink: 0 }}>✗</span>{r}</li>)}</ul></div>}
              {selected.reasoning && <div style={{ borderRadius: '0.5rem', padding: '1rem', background: 'var(--color-surface-container)', border: '1px solid var(--color-outline-variant)' }}><p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#003e6f', marginBottom: '0.5rem' }}>AI Reasoning</p><p style={{ fontSize: '0.875rem', fontStyle: 'italic', lineHeight: 1.625 }}>{selected.reasoning}</p></div>}
              <p style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', paddingTop: '0.5rem', borderTop: '1px solid var(--color-outline-variant)' }}>File: {selected.file_name}</p>
            </div>
            <div style={{ padding: '1rem', borderTop: '1px solid var(--color-outline-variant)' }}>
              <button onClick={() => setSelected(null)} style={{ width: '100%', padding: '0.625rem', borderRadius: '0.25rem', fontSize: '0.875rem', fontWeight: 600, border: '1px solid var(--color-outline-variant)', background: 'none', cursor: 'pointer' }}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-surface-container-lowest border-t border-outline-variant px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--color-on-surface-variant)' }}>Powered By :</span>
            <span style={{ fontWeight: 700, color: '#003e6f' }}>ACC Red Berries</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)', marginTop: '0.25rem' }}>© 2024 Berijalan Recruitment Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
