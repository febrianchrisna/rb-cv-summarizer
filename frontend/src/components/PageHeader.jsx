/**
 * PageHeader — matches the Figma "Header" section (node 10489-149551)
 * Blue banner with title + decorative circles + optional sub-tabs row
 *
 * Props:
 *  - title: string (page title)
 *  - tabs: array of { label, active } objects (optional)
 */
export default function PageHeader({ title = 'Job Posting Management', tabs = [] }) {
  return (
    <div style={{
      backgroundColor: '#005BAA',
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative circles — top right */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '80px',
        width: '140px',
        height: '140px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.12)',
        zIndex: 0,
      }} />
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '30px',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.08)',
        zIndex: 0,
      }} />
      <div style={{
        position: 'absolute',
        top: '-10px',
        right: '160px',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: 'rgba(254,152,53,0.35)',
        zIndex: 0,
      }} />

      {/* Title row */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: tabs.length > 0 ? '2rem 2.5rem 0.75rem' : '2rem 2.5rem 3.25rem',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        <h1 style={{
          color: '#ffffff',
          fontSize: '1.875rem',
          fontWeight: 800,
          margin: 0,
          lineHeight: 1.2,
        }}>
          {title}
        </h1>
      </div>

      {/* Sub-tabs row */}
      {tabs.length > 0 && (
        <div style={{
          position: 'relative',
          zIndex: 1,
          padding: '0.5rem 2.5rem 0',
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '0.25rem',
        }}>
          {tabs.map((tab, i) => (
            <div
              key={i}
              style={{
                padding: '0.5rem 1.25rem',
                fontSize: '0.8125rem',
                fontWeight: tab.active ? 700 : 400,
                color: tab.active ? '#ffffff' : 'rgba(255,255,255,0.65)',
                borderBottom: tab.active ? '2px solid #FE9835' : '2px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
