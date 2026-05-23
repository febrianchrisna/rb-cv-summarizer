import { Link, useLocation } from 'react-router-dom';
import accCareerLogo from '../assets/acc_career.png';

export default function Navbar({ children }) {
  const location = useLocation();
  const path = location.pathname;

  // Define active conditions
  const isJobPostingActive = path === '/' || path.startsWith('/post-job');
  const isJobListingActive = path.startsWith('/job-listing') || path.startsWith('/job-detail') || path.startsWith('/results');

  const linkStyle = (isActive) => ({
    textDecoration: 'none',
    fontWeight: isActive ? 700 : 500,
    fontSize: '0.9375rem',
    color: isActive ? '#005BAA' : '#374151',
    borderBottom: isActive ? '2px solid #FE9835' : '2px solid transparent',
    paddingBottom: '0.25rem',
    transition: 'all 0.2s ease',
  });

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      padding: '0.75rem 1.5rem',
      backgroundColor: '#ffffff',
      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
        {/* Logo ACC Career */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img src={accCareerLogo} alt="ACC Career" style={{ height: '2.25rem', objectFit: 'contain' }} />
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link to="/" style={linkStyle(isJobPostingActive)}>
            Job Posting
          </Link>
          <Link to="/job-listing" style={linkStyle(isJobListingActive)}>
            Job Listing
          </Link>
        </nav>
      </div>
      {/* Right side actions passed as children */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {children}
      </div>
    </header>
  );
}
