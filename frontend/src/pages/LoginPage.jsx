import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('acc_career_auth') === 'true') {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email.trim() || !form.password.trim()) {
      setError('Email dan password wajib diisi');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    sessionStorage.setItem('acc_career_auth', 'true');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center w-full px-6 py-4" style={{ backgroundColor: '#003e6f' }}>
        <span className="text-white font-bold text-2xl">ACC Career</span>
      </header>

      {/* Hero */}
      <section className="px-6 py-12" style={{ backgroundColor: '#005696' }}>
        <div className="max-w-md mx-auto" style={{ textAlign: 'center' }}>
          <h1 className="text-white font-bold text-3xl mb-2">Recruitment Management System</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Berijalan — Powered by AI CV Scanning
          </p>
        </div>
      </section>

      {/* Login Card */}
      <main className="grow flex items-start justify-center px-4 pt-10 pb-12">
        <div className="w-full max-w-sm">
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant shadow-md p-8">
            <h2 className="text-xl font-bold text-on-surface mb-1">Sign In</h2>
            <p className="text-sm text-on-surface-variant mb-6">
              Masuk ke akun Anda untuk melanjutkan
            </p>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Email</label>
                <input
                  type="email"
                  placeholder="nama@acc.co.id"
                  autoComplete="email"
                  style={{ width: '100%', padding: '0.625rem 1rem', borderRadius: '0.25rem', border: '1px solid var(--color-outline-variant)', background: 'var(--color-background)', color: 'var(--color-on-surface)', fontSize: '0.875rem' }}
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ width: '100%', padding: '0.625rem 1rem', borderRadius: '0.25rem', border: '1px solid var(--color-outline-variant)', background: 'var(--color-background)', color: 'var(--color-on-surface)', fontSize: '0.875rem' }}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                />
              </div>

              {error && (
                <div className="text-sm rounded px-3 py-2" style={{ backgroundColor: '#ffdad6', color: '#ba1a1a' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2\.5 rounded font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#fe9835', color: '#693600', padding: '0.625rem', width: '100%' }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-on-surface-variant mt-6">
            © 2024 Berijalan Recruitment Management System
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-on-surface-variant">Powered By :</span>
          <span className="font-bold" style={{ color: '#003e6f' }}>ACC Red Berries</span>
        </div>
        <p className="text-xs text-on-surface-variant">
          © 2024 Berijalan Recruitment Management System. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
