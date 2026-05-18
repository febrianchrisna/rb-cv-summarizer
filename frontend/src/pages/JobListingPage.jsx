import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function JobListingPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="bg-background text-on-surface flex flex-col min-h-screen">
      <header className="bg-primary flex justify-between items-center w-full px-6 py-4 top-0 z-50">
        <div className="flex items-center gap-12">
          <span className="text-2xl font-bold text-on-primary">ACC Career</span>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link className="text-on-primary font-bold transition-all" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }} to="/">Job Posting</Link>
            <Link className="text-on-primary font-bold transition-all" style={{ textDecoration: 'none' }} to="/job-listing">Job Listing</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="bg-secondary-container text-on-secondary-container px-6 py-2 rounded text-sm font-bold" style={{ textDecoration: 'none' }}>Post a Job</Link>
        </div>
      </header>

      <main style={{ flexGrow: 1, width: '100%', maxWidth: '80rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '2rem', paddingLeft: '1rem', borderLeft: '4px solid var(--color-secondary-container)' }}>
          <h1 className="text-3xl text-primary mb-2 font-bold">Application Tracking System</h1>
          <p className="text-sm text-on-surface-variant">Manage and track active recruitment cycles across all departments.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          {loading ? (
             <p className="p-6 text-center">Loading active cycles...</p>
          ) : jobs.length > 0 ? jobs.map(job => (
            <div key={job.id} className="bg-surface-container-lowest border border-outline-variant rounded transition-all overflow-hidden hover:shadow-md">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ flexGrow: 1, padding: '1.5rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <span className="text-sm font-semibold text-secondary uppercase tracking-wider mb-1 block">{job.field || 'General'}</span>
                      <h3 className="text-2xl font-bold text-primary">{job.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', color: 'var(--color-on-surface-variant)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          <span className="text-sm">Jakarta, Indonesia</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          <span className="text-sm">{job.category || 'Full-time'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid var(--color-outline-variant)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <Link to={`/job-detail/${job.id}`} style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)', padding: '0.5rem 1.5rem', borderRadius: '0.25rem', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>Manage Candidates</Link>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="p-12 text-center border border-dashed rounded border-outline-variant bg-surface-container-lowest">
               <span className="material-symbols-outlined text-4xl text-outline mb-2">work_off</span>
               <p className="text-on-surface-variant">Belum ada job post yang aktif di database.</p>
               <Link to="/" className="text-primary font-bold mt-2 inline-block">Buat Job Post Pertama →</Link>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-surface-container-lowest border-t border-outline-variant flex flex-col md:flex-row justify-between items-center w-full px-6 py-8 mt-auto">
        <div className="mb-4">
          <span className="text-sm font-bold text-primary">ACC Red Berries</span>
          <p className="text-xs text-on-surface-variant mt-1">© 2024 Berijalan Recruitment Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
