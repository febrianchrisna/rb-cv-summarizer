import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PageHeader from '../components/PageHeader';

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
    <div style={{ backgroundColor: '#f5f6fa', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Navbar>
        <Link to="/post-job" style={{ backgroundColor: '#FE9835', color: '#693600', fontWeight: 700, fontSize: '0.875rem', padding: '0.625rem 1.5rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap' }}>+ Post a Job</Link>
      </Navbar>

      <PageHeader title="Application Tracking System" tabs={[{ label: 'Job Listing', active: true }]} />

      <main style={{ flexGrow: 1, width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '1.75rem 2.5rem', boxSizing: 'border-box' }}>

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

      <Footer />
    </div>
  );
}
