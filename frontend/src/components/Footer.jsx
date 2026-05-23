import accLogo from '../assets/acc_logo.png';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#005BAA',
      padding: '1.25rem 2rem',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginTop: 'auto',
      flexWrap: 'wrap',
      gap: '0.75rem',
    }}>
      {/* Left: ACC Logo + Text */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        <img
          src={accLogo}
          alt="ACC memberi kemudahan"
          style={{ height: '3.5rem', objectFit: 'contain' }}
        />
        <div>
          <p style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.125rem' }}>
            Powered By : ACC Red Berries
          </p>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.75rem' }}>
            Recruitment Data Driven and Web Enhancement Series
          </p>
        </div>
      </div>

      {/* Right: Copyright */}
      <div>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.75rem' }}>
          © 2026 Astra Credit Companies
        </p>
      </div>
    </footer>
  );
}
