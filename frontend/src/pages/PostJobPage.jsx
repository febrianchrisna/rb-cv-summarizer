import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

export default function PostJobPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fppk: '',
    position_name: '',
    title: '',
    description: '',
    qualification: '',
    category: 'Experienced',
    field: 'Information Technology',
    requirements: [
      { field: 'Age', mandatory: true, value: 'Max 35 Years' },
      { field: 'Minimum Degree', mandatory: true, value: 'Bachelor (S1)' },
      { field: 'GPA Minimum', mandatory: true, value: '3.00' },
      { field: 'Major', mandatory: true, value: 'IT, Business, Engineering' }
    ]
  });

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetch(`/api/jobs/${id}`)
        .then(r => r.json())
        .then(json => {
          if (json.success) setForm(json.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id]);

  const handleSaveDraft = async () => {
    try {
      const payload = { ...form, status: 'draft' };
      const url = id ? `/api/jobs/${id}` : '/api/jobs';
      const method = id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const json = await res.json();
      if (json.success) navigate('/job-listing');
      else alert(json.error || 'Gagal menyimpan draft');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreatePost = async () => {
    try {
      const payload = { ...form, status: 'published' };
      const url = id ? `/api/jobs/${id}` : '/api/jobs';
      const method = id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const json = await res.json();
      if (json.success) navigate('/job-listing');
      else alert(json.error || 'Gagal mempublish lowongan');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm('Hapus lowongan ini?')) return;
    
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) navigate('/job-listing');
      else alert(json.error || 'Gagal menghapus');
    } catch (err) {
      alert(err.message);
    }
  };

  const addRequirement = () => {
    setForm(prev => ({
      ...prev,
      requirements: [...prev.requirements, { field: 'New Field', mandatory: false, value: '' }]
    }));
  };
  const updateRequirement = (index, key, val) => {
    setForm(prev => {
      const reqs = [...prev.requirements];
      reqs[index] = { ...reqs[index], [key]: val };
      return { ...prev, requirements: reqs };
    });
  };
  const removeRequirement = (index) => {
    setForm(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const inputStyle = { width: '100%', border: '1px solid var(--color-outline)', padding: '0.75rem 1rem', outline: 'none', background: 'white', borderRadius: '0.25rem', fontFamily: 'inherit', fontSize: '0.875rem' };

  if (loading) return <div className="p-10">Loading job data...</div>;

  return (
    <div className="bg-background text-on-surface font-sans min-h-screen flex flex-col">
      {/* Top Nav */}
      <nav className="flex justify-between items-center w-full px-6 py-4 bg-primary sticky top-0 z-50">
        <div className="flex items-center gap-12">
          <span className="text-2xl font-bold text-on-primary">ACC Career</span>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <Link className="text-on-primary border-b-2 border-secondary-container pb-1 font-bold" to="/">Job Posting</Link>
            <Link style={{ color: 'rgba(255,255,255,0.8)' }} to="/job-listing">Job Listing</Link>
          </div>
        </div>
        <Link to="/job-listing">
          <button className="bg-secondary-container text-on-secondary-container px-6 py-2 font-bold text-sm rounded">Back to List</button>
        </Link>
      </nav>

      {/* Hero Banner */}
      <header className="bg-primary-container text-on-primary-container px-6 py-10">
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <h1 className="text-3xl font-bold mb-2">{id ? 'Edit Job Posting' : 'Create New Job Posting'}</h1>
          <p className="text-base" style={{ opacity: 0.8 }}>Design and publish your recruitment requirements with precision.</p>
        </div>
      </header>

      <main style={{ flexGrow: 1, maxWidth: '80rem', margin: '0 auto', width: '100%', padding: '1.5rem 1.5rem 3rem' }}>
        <div className="flex flex-col gap-6" style={{ flexDirection: 'row', alignItems: 'flex-start' }}>

          {/* Sidebar Wizard */}
          <aside style={{ width: '20rem', flexShrink: 0 }}>
            <div className="bg-surface-container-lowest border border-outline-variant rounded shadow-sm" style={{ position: 'sticky', top: '5rem', paddingBottom: '1rem' }}>
              <div className="p-4 border-b border-outline-variant">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Wizard Progress</h3>
              </div>
              <nav style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { step: 1, label: 'Job Information' },
                  { step: 2, label: 'Application & Screening' },
                  { step: null, label: 'Recruitment Process' },
                  { step: null, label: 'SEO Configuration' },
                  { step: null, label: 'Preview & Publish' },
                ].map(({ step, label }) => (
                  <button
                    key={label}
                    onClick={() => step && setCurrentStep(step)}
                    disabled={!step}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '1rem',
                      borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                      borderLeft: `4px solid ${currentStep === step ? 'var(--color-secondary-container)' : 'transparent'}`,
                      textAlign: 'left', background: currentStep === step ? 'rgba(0,62,111,0.05)' : 'transparent',
                      color: currentStep === step ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                      opacity: !step ? 0.5 : 1, cursor: !step ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <span className="font-semibold text-sm">{label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <div style={{ flexGrow: 1 }}>
            {/* Step 1: Job Information */}
            {currentStep === 1 && (
              <section className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded">
                <div className="bg-secondary-container px-6 py-3">
                  <h2 className="text-base font-bold text-on-secondary-container uppercase">1. Job Information</h2>
                </div>
                <div className="p-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label className="text-sm font-semibold text-on-surface-variant">No. FPPK</label>
                      <input value={form.fppk} onChange={e => setForm({ ...form, fppk: e.target.value })} style={inputStyle} placeholder="Enter FPPK Number..." type="text" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label className="text-sm font-semibold text-on-surface-variant">Job Position (internal name)</label>
                      <input value={form.position_name} onChange={e => setForm({ ...form, position_name: e.target.value })} style={inputStyle} placeholder="Contoh: Senior Fullstack Developer" type="text" />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label className="text-sm font-semibold text-on-surface-variant">Job Post Title (display name)</label>
                      <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={inputStyle} type="text" />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label className="text-sm font-semibold text-on-surface-variant">Job Category</label>
                      <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                        <option value="Experienced">Experienced</option>
                        <option value="Fresh Graduate">Fresh Graduate</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label className="text-sm font-semibold text-on-surface-variant">Field</label>
                      <input value={form.field} onChange={e => setForm({ ...form, field: e.target.value })} placeholder="e.g., IT" style={inputStyle} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="text-sm font-semibold text-on-surface-variant">Job Post Description</label>
                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, resize: 'none' }} placeholder="Enter detailed job responsibilities..." rows="4" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="text-sm font-semibold text-on-surface-variant">Qualification Description</label>
                    <textarea value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} style={{ ...inputStyle, resize: 'none' }} placeholder="List required skills and education..." rows="4" />
                  </div>
                </div>
              </section>
            )}

            {/* Step 2: Application & Screening */}
            {currentStep === 2 && (
              <section className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded">
                <div className="bg-primary-container px-6 py-3">
                  <h2 className="text-base font-bold text-on-primary-container uppercase">2. Application & Screening Process</h2>
                </div>
                <div className="p-6">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h3 className="text-base font-bold text-primary">Preferred Qualifications</h3>
                    <button onClick={addRequirement} className="text-primary text-sm font-bold" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>+ Add Requirement</button>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead className="bg-secondary-container text-on-secondary-container text-sm">
                        <tr>
                          <th className="px-4 py-3 text-left uppercase">Requirement Field</th>
                          <th className="px-4 py-3 text-left uppercase">Mandatory</th>
                          <th className="px-4 py-3 text-left uppercase">Value/Constraint</th>
                          <th className="px-4 py-3 text-right uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {form.requirements?.map((req, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
                            <td className="px-4 py-3">
                              <input value={req.field} onChange={e => updateRequirement(i, 'field', e.target.value)} style={{ border: '1px solid var(--color-outline)', padding: '0.25rem 0.5rem', width: '100%', borderRadius: '0.25rem' }} type="text" />
                            </td>
                            <td className="px-4 py-3">
                              <input type="checkbox" checked={req.mandatory} onChange={e => updateRequirement(i, 'mandatory', e.target.checked)} />
                            </td>
                            <td className="px-4 py-3">
                              <input value={req.value} onChange={e => updateRequirement(i, 'value', e.target.value)} style={{ border: '1px solid var(--color-outline)', padding: '0.25rem 0.5rem', width: '100%', borderRadius: '0.25rem' }} type="text" />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button onClick={() => removeRequirement(i)} className="text-error font-bold text-lg leading-none" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>x</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '1.5rem 0', borderTop: '1px solid var(--color-outline-variant)', marginTop: '1.5rem' }}>
              <div>
                {currentStep === 2 && id && (
                  <button onClick={handleDelete} style={{ padding: '0.75rem 1.5rem', border: '1px solid var(--color-error)', color: 'var(--color-error)', fontWeight: 700, borderRadius: '0.25rem', background: 'none', cursor: 'pointer' }}>Delete Post</button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {currentStep === 1 && (
                  <>
                    <button onClick={handleSaveDraft} style={{ padding: '0.75rem 1.5rem', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', fontWeight: 700, borderRadius: '0.25rem', background: 'none', cursor: 'pointer' }}>Save Draft</button>
                    <button onClick={() => setCurrentStep(2)} style={{ padding: '0.75rem 1.5rem', background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)', fontWeight: 700, borderRadius: '0.25rem', border: 'none', cursor: 'pointer' }}>Next →</button>
                  </>
                )}
                {currentStep === 2 && (
                  <>
                    <button onClick={() => setCurrentStep(1)} style={{ padding: '0.75rem 1.5rem', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', fontWeight: 700, borderRadius: '0.25rem', background: 'none', cursor: 'pointer' }}>← Back</button>
                    <button onClick={handleSaveDraft} style={{ padding: '0.75rem 1.5rem', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', fontWeight: 700, borderRadius: '0.25rem', background: 'none', cursor: 'pointer' }}>Save Draft</button>
                    <button onClick={handleCreatePost} style={{ padding: '0.75rem 1.5rem', background: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)', fontWeight: 700, borderRadius: '0.25rem', border: 'none', cursor: 'pointer' }}>{id ? 'Save Changes' : 'Create New Post'}</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
