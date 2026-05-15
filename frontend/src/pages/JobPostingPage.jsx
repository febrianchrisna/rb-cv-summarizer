import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function JobPostingPage() {
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
    <div className="bg-background text-on-surface font-sans min-h-screen flex flex-col">
      <header className="bg-primary text-on-primary text-lg font-semibold flex justify-between items-center w-full px-6 py-4">
        <div className="flex items-center gap-12">
          <span className="text-2xl font-bold text-on-primary">ACC Career</span>
          <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <Link className="text-on-primary border-b-2 border-secondary-container pb-1 font-bold transition-all" to="/">Job Posting</Link>
            <Link className="text-on-primary" style={{ opacity: 0.8 }} to="/job-listing">Job Listing</Link>
          </nav>
        </div>
      </header>

      <section className="bg-primary-container text-on-primary-container px-6 py-12">
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h1 className="text-3xl font-bold mb-2 text-on-primary">Job Posting Management</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>Manage and monitor all recruitment requests and published job listings from a centralized dashboard.</p>
        </div>
      </section>

      <main style={{ flexGrow: 1, padding: '2rem 1.5rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <div className="flex justify-end items-center mb-6">
          <Link to="/post-job" className="bg-secondary-container text-on-secondary-container px-8 py-3 rounded shadow-sm text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-all">
            <span style={{ fontSize: '1.125rem', lineHeight: 1 }}>+</span>
            Post a Job
          </Link>
        </div>

        <div className="bg-surface-container-lowest rounded-lg overflow-hidden border border-outline-variant" style={{ color: 'black' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr className="bg-secondary-container text-on-secondary-container">
                <th className="text-sm font-semibold px-4 py-4 text-left uppercase tracking-wider">No. FPPK</th>
                <th className="text-sm font-semibold px-4 py-4 text-left uppercase tracking-wider">Job Post Title</th>
                <th className="text-sm font-semibold px-4 py-4 text-left uppercase tracking-wider">Job Category</th>
                <th className="text-sm font-semibold px-4 py-4 text-left uppercase tracking-wider">Job Field</th>
                <th className="text-sm font-semibold px-4 py-4 text-left uppercase tracking-wider">Posted Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="px-4 py-8 text-center text-sm">Loading jobs...</td></tr>
              ) : jobs.length > 0 ? jobs.map(job => (
                <tr key={job.id} className="bg-surface-container-lowest hover:bg-surface-container-low transition-colors cursor-pointer">
                  <td className="px-4 py-4 text-sm"><Link to={`/job-detail/${job.id}`} style={{ display: 'block' }}>{job.fppk || '-'}</Link></td>
                  <td className="px-4 py-4 text-sm font-semibold text-primary"><Link to={`/job-detail/${job.id}`} style={{ display: 'block' }}>{job.title || '-'}</Link></td>
                  <td className="px-4 py-4 text-sm text-on-surface-variant"><Link to={`/job-detail/${job.id}`} style={{ display: 'block' }}>{job.category || 'Permanent'}</Link></td>
                  <td className="px-4 py-4 text-sm text-on-surface-variant"><Link to={`/job-detail/${job.id}`} style={{ display: 'block' }}>{job.field || '-'}</Link></td>
                  <td className="px-4 py-4 text-sm text-on-surface-variant" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link to={`/job-detail/${job.id}`} style={{ display: 'block' }}>{job.created_at ? new Date(job.created_at).toLocaleDateString() : '-'}</Link>
                    <Link to={`/post-job?id=${job.id}`} style={{ color: 'var(--color-secondary)', padding: '0.25rem 0.75rem', border: '1px solid var(--color-secondary)', borderRadius: '0.25rem', fontSize: '0.75rem' }}>Edit</Link>
                  </td>
                </tr>
              )) : (
                <tr className="bg-surface-container-lowest">
                  <td colSpan="5" className="px-4 py-8 text-center text-sm text-on-surface-variant">No jobs found. Click "Post a Job" to post one.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      <footer className="bg-surface-container-lowest text-on-surface-variant text-xs border-t border-outline-variant flex flex-col md:flex-row justify-between items-center w-full px-6 py-8 mt-auto" style={{ color: 'black' }}>
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-on-surface-variant">Powered By :</span>
            <span className="text-sm font-bold text-primary">ACC Red Berries</span>
          </div>
          <p>© 2024 Berijalan Recruitment Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
