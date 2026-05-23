import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PageHeader from '../components/PageHeader';

const STEPS = [
  { step: 1, label: 'Job Information' },
  { step: 2, label: 'Application & Screening Process' },
  { step: null, label: 'Recruitment Process' },
  { step: null, label: 'SEO Configuration' },
  { step: null, label: 'Review & Publish' },
];

/* ── Shared input styles matching Figma ─────────────────────────── */
const fieldStyle = {
  width: '100%',
  border: '1px solid #d1d5db',
  borderRadius: '0.375rem',
  padding: '0.625rem 0.875rem',
  fontSize: '0.9375rem',
  fontFamily: 'inherit',
  color: '#111827',
  backgroundColor: '#ffffff',
  outline: 'none',
  boxSizing: 'border-box',
};
const labelStyle = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '0.375rem',
};

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
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (json.success) navigate('/');
      else alert(json.error || 'Gagal menyimpan draft');
    } catch (err) { alert(err.message); }
  };

  const handleCreatePost = async () => {
    try {
      const payload = { ...form, status: 'published' };
      const url = id ? `/api/jobs/${id}` : '/api/jobs';
      const method = id ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (json.success) navigate('/');
      else alert(json.error || 'Gagal mempublish lowongan');
    } catch (err) { alert(err.message); }
  };

  const addRequirement = () => setForm(prev => ({ ...prev, requirements: [...prev.requirements, { field: 'New Field', mandatory: false, value: '' }] }));
  const updateRequirement = (index, key, val) => setForm(prev => { const reqs = [...prev.requirements]; reqs[index] = { ...reqs[index], [key]: val }; return { ...prev, requirements: reqs }; });
  const removeRequirement = (index) => setForm(prev => ({ ...prev, requirements: prev.requirements.filter((_, i) => i !== index) }));

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading job data...</div>;

  return (
    <div style={{ backgroundColor: '#f5f6fa', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Source Sans 3', 'Source Sans Pro', system-ui, sans-serif" }}>
      <Navbar>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <button style={{ backgroundColor: 'transparent', border: '1px solid #005BAA', color: '#005BAA', padding: '0.5rem 1.25rem', fontWeight: 700, fontSize: '0.9375rem', borderRadius: '0.375rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            Back to List
          </button>
        </Link>
      </Navbar>

      <PageHeader title={id ? 'Edit Job Posting' : 'Post a Job'} tabs={[{ label: 'Job Posting', active: true }]} />

      {/* Breadcrumb + Back link */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '1rem 2.5rem 0', boxSizing: 'border-box' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: '#005BAA', fontSize: '0.9375rem', fontWeight: 600, textDecoration: 'none' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Kembali
        </Link>
      </div>

      <main style={{ flexGrow: 1, maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '1.25rem 2.5rem 3rem', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>

          {/* ── Sidebar Wizard ── */}
          <aside style={{ width: '240px', flexShrink: 0 }}>
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              position: 'sticky',
              top: '5rem',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              {STEPS.map(({ step, label }, i) => {
                const isActive = currentStep === step;
                const isClickable = !!step;
                return (
                  <button
                    key={label}
                    onClick={() => step && setCurrentStep(step)}
                    disabled={!isClickable}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.875rem',
                      width: '100%', padding: '0.875rem 1.125rem',
                      border: 'none',
                      borderLeft: `3px solid ${isActive ? '#005BAA' : 'transparent'}`,
                      borderBottom: i < STEPS.length - 1 ? '1px solid #f3f4f6' : 'none',
                      backgroundColor: isActive ? '#eff6ff' : 'transparent',
                      textAlign: 'left',
                      cursor: isClickable ? 'pointer' : 'not-allowed',
                      opacity: !isClickable ? 0.45 : 1,
                      fontFamily: 'inherit',
                    }}
                  >
                    <span style={{
                      width: '1.625rem', height: '1.625rem',
                      borderRadius: '50%',
                      backgroundColor: isActive ? '#005BAA' : '#e5e7eb',
                      color: isActive ? '#ffffff' : '#6b7280',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.8125rem', fontWeight: 700, flexShrink: 0,
                    }}>
                      {i + 1}
                    </span>
                    <span style={{ fontSize: '0.9375rem', fontWeight: isActive ? 700 : 500, color: isActive ? '#005BAA' : '#374151' }}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* ── Main Form Area ── */}
          <div style={{ flexGrow: 1, minWidth: 0 }}>

            {/* Step 1: Job Information */}
            {currentStep === 1 && (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid #f3f4f6' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0 }}>Job Information</h2>
                </div>

                <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                  {/* No. FPPK */}
                  <div>
                    <label style={labelStyle}>No. FPPK</label>
                    <input
                      value={form.fppk}
                      onChange={e => setForm({ ...form, fppk: e.target.value })}
                      style={fieldStyle}
                      placeholder="e.g. 001/AC/FPPK/XI/2020"
                      type="text"
                    />
                  </div>

                  {/* Job Specification row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
                    <div>
                      <label style={labelStyle}>Job Category <span style={{ color: '#ef4444' }}>*</span></label>
                      <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={fieldStyle}>
                        <option value="Experienced">Experienced</option>
                        <option value="Fresh Graduate">Fresh Graduate</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Job Field <span style={{ color: '#ef4444' }}>*</span></label>
                      <input value={form.field} onChange={e => setForm({ ...form, field: e.target.value })} style={fieldStyle} placeholder="e.g. Information Technology" />
                    </div>
                    <div>
                      <label style={labelStyle}>Job Position (internal)</label>
                      <input value={form.position_name} onChange={e => setForm({ ...form, position_name: e.target.value })} style={fieldStyle} placeholder="e.g. Senior Fullstack Developer" />
                    </div>
                  </div>

                  {/* Job Post Info */}
                  <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>Job Post Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                      <div>
                        <label style={labelStyle}>Job Post Title <span style={{ color: '#ef4444' }}>*</span></label>
                        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} style={fieldStyle} placeholder="e.g. UI/UX Designer" />
                      </div>
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div>
                    <label style={labelStyle}>Job Post Description <span style={{ color: '#ef4444' }}>*</span></label>
                    <textarea
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      style={{ ...fieldStyle, resize: 'vertical', minHeight: '140px' }}
                      placeholder="Enter detailed job responsibilities..."
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Qualification Description</label>
                    <textarea
                      value={form.qualification}
                      onChange={e => setForm({ ...form, qualification: e.target.value })}
                      style={{ ...fieldStyle, resize: 'vertical', minHeight: '140px' }}
                      placeholder="List required skills and education..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Application & Screening */}
            {currentStep === 2 && (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0 }}>Application &amp; Screening Process</h2>
                  <button onClick={addRequirement} style={{ backgroundColor: '#005BAA', color: '#ffffff', border: 'none', borderRadius: '0.375rem', padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    + Add Requirement
                  </button>
                </div>
                <div style={{ padding: '1.75rem', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#FE9835' }}>
                        {['Requirement Field', 'Mandatory', 'Value / Constraint', ''].map(h => (
                          <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 700, color: '#693600', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {form.requirements?.map((req, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <input value={req.field} onChange={e => updateRequirement(i, 'field', e.target.value)} style={{ ...fieldStyle, padding: '0.4rem 0.625rem', fontSize: '0.875rem' }} />
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <input type="checkbox" checked={req.mandatory} onChange={e => updateRequirement(i, 'mandatory', e.target.checked)} style={{ width: '1rem', height: '1rem', cursor: 'pointer', accentColor: '#005BAA' }} />
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <input value={req.value} onChange={e => updateRequirement(i, 'value', e.target.value)} style={{ ...fieldStyle, padding: '0.4rem 0.625rem', fontSize: '0.875rem' }} />
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                            <button onClick={() => removeRequirement(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '1.125rem', fontWeight: 700, lineHeight: 1, fontFamily: 'inherit' }}>×</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Action Buttons (matches Figma: bottom-right, Save as Draft + Create New Post) ── */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.875rem', marginTop: '1.5rem' }}>
              {currentStep === 1 && (
                <>
                  <button
                    onClick={handleSaveDraft}
                    style={{ padding: '0.6875rem 1.5rem', border: '1px solid #005BAA', borderRadius: '0.375rem', backgroundColor: '#ffffff', color: '#005BAA', fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer', fontFamily: 'inherit' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#eff6ff'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
                  >
                    Save as Draft
                  </button>
                  <button
                    onClick={() => setCurrentStep(2)}
                    style={{ padding: '0.6875rem 1.5rem', border: 'none', borderRadius: '0.375rem', backgroundColor: '#005BAA', color: '#ffffff', fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer', fontFamily: 'inherit' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0047a3'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#005BAA'}
                  >
                    Next →
                  </button>
                </>
              )}
              {currentStep === 2 && (
                <>
                  <button
                    onClick={() => setCurrentStep(1)}
                    style={{ padding: '0.6875rem 1.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', backgroundColor: '#ffffff', color: '#374151', fontWeight: 600, fontSize: '0.9375rem', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleSaveDraft}
                    style={{ padding: '0.6875rem 1.5rem', border: '1px solid #005BAA', borderRadius: '0.375rem', backgroundColor: '#ffffff', color: '#005BAA', fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer', fontFamily: 'inherit' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#eff6ff'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
                  >
                    Save as Draft
                  </button>
                  <button
                    onClick={handleCreatePost}
                    style={{ padding: '0.6875rem 1.5rem', border: 'none', borderRadius: '0.375rem', backgroundColor: '#005BAA', color: '#ffffff', fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer', fontFamily: 'inherit' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0047a3'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#005BAA'}
                  >
                    {id ? 'Save Changes' : 'Create New Post'}
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
