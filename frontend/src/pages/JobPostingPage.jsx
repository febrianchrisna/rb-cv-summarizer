import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PageHeader from '../components/PageHeader';

/* ── Icons ───────────────────────────────────────────────────────── */
const IconEdit = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconTrash = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

/* ── Delete Confirmation Modal ───────────────────────────────────── */
function DeleteModal({ onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        padding: '2.5rem 2rem 2rem',
        width: '100%',
        maxWidth: '420px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        animation: 'modalSlideIn 0.22s ease forwards',
      }}>
        {/* Trash icon circle */}
        <div style={{
          width: '4rem', height: '4rem',
          borderRadius: '50%',
          backgroundColor: '#fee2e2',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </div>

        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827', marginBottom: '0.625rem' }}>
          Hapus Job Post?
        </h3>
        <p style={{ fontSize: '0.9375rem', color: '#6b7280', lineHeight: 1.6, marginBottom: '2rem' }}>
          Kamu yakin ingin menghapus job post ini? Data yang dihapus tidak dapat dikembalikan.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '0.75rem',
              border: '1px solid #d1d5db', borderRadius: '0.5rem',
              backgroundColor: '#ffffff', color: '#005BAA',
              fontWeight: 700, fontSize: '0.9375rem',
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '0.75rem',
              border: 'none', borderRadius: '0.5rem',
              backgroundColor: '#ef4444', color: '#ffffff',
              fontWeight: 700, fontSize: '0.9375rem',
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#dc2626'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ef4444'}
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Column definitions ──────────────────────────────────────────── */
const HEADER_COLS = ['No. FPPK', 'Job Post Title', 'Job Category', 'Job Field', 'Posted Date', 'Date Modified', 'Actions'];

export default function JobPostingPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null); // job id to delete

  useEffect(() => {
    fetch('/api/jobs')
      .then(r => r.json())
      .then(json => {
        if (json.success) setJobs(json.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetch(`/api/jobs/${deleteTarget}`, { method: 'DELETE' });
      setJobs(prev => prev.filter(j => j.id !== deleteTarget));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const tabs = [{ label: 'Job Posting', active: true }];

  return (
    <div style={{ backgroundColor: '#f5f6fa', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Source Sans 3', 'Source Sans Pro', system-ui, sans-serif" }}>
      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteModal
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <Navbar>
        <Link
          to="/post-job"
          style={{
            backgroundColor: '#FE9835', color: '#693600',
            fontWeight: 700, fontSize: '0.9375rem',
            padding: '0.625rem 1.5rem', borderRadius: '0.375rem',
            border: 'none', cursor: 'pointer',
            textDecoration: 'none', display: 'inline-flex',
            alignItems: 'center', gap: '0.375rem', whiteSpace: 'nowrap',
          }}
        >
          + Post a Job
        </Link>
      </Navbar>

      {/* Page Header Banner */}
      <PageHeader title="Job Post Management" tabs={tabs} />

      {/* Main Content */}
      <main style={{ flexGrow: 1, padding: '1.75rem 2.5rem', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '0.5rem',
          overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
            {/* Header */}
            <thead>
              <tr style={{ backgroundColor: '#FE9835' }}>
                {HEADER_COLS.map(col => (
                  <th key={col} style={{
                    padding: '0.875rem 1rem', textAlign: 'left',
                    fontSize: '0.9375rem', fontWeight: 700,
                    color: '#693600', whiteSpace: 'nowrap',
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={HEADER_COLS.length} style={{ padding: '3rem', textAlign: 'center', color: '#6b7280', fontSize: '0.9375rem' }}>
                    Loading jobs...
                  </td>
                </tr>
              ) : jobs.length > 0 ? (
                jobs.map((job, idx) => (
                  <tr
                    key={job.id}
                    style={{
                      backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb',
                      borderBottom: '1px solid #f0f0f0',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#eff6ff'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#f9fafb'}
                  >
                    {/* No. FPPK */}
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.9375rem' }}>
                      <Link to={`/job-detail/${job.id}`} style={{ color: '#005BAA', fontWeight: 600, textDecoration: 'none' }}>
                        {job.fppk || `001/AC/FPPK/XI/${job.id}`}
                      </Link>
                    </td>

                    {/* Job Post Title */}
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.9375rem', color: '#111827', fontWeight: 500 }}>
                      {job.title || '-'}
                    </td>

                    {/* Job Category */}
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.9375rem', color: '#374151' }}>
                      {job.category || 'Experienced'}
                    </td>

                    {/* Job Field */}
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.9375rem', color: '#374151' }}>
                      {job.field || '-'}
                    </td>

                    {/* Posted Date */}
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.9375rem', color: '#374151', whiteSpace: 'nowrap' }}>
                      {formatDate(job.created_at)}
                    </td>

                    {/* Date Modified */}
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.9375rem', color: '#374151', whiteSpace: 'nowrap' }}>
                      {formatDate(job.updated_at || job.created_at)}
                    </td>

                    {/* Actions — hanya 2: Edit & Delete */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {/* Edit */}
                        <button
                          title="Edit"
                          onClick={() => navigate(`/post-job?id=${job.id}`)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', borderRadius: '0.25rem', display: 'flex', alignItems: 'center' }}
                        >
                          <IconEdit />
                        </button>

                        {/* Delete */}
                        <button
                          title="Hapus"
                          onClick={() => setDeleteTarget(job.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', borderRadius: '0.25rem', display: 'flex', alignItems: 'center' }}
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={HEADER_COLS.length} style={{ padding: '4rem', textAlign: 'center', color: '#6b7280', fontSize: '0.9375rem' }}>
                    Belum ada lowongan. Klik <strong>"+ Post a Job"</strong> untuk menambahkan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Row count */}
          {!loading && jobs.length > 0 && (
            <div style={{ padding: '0.875rem 1rem', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9375rem', color: '#6b7280' }}>
                1 to {jobs.length} of {jobs.length} items
              </span>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
