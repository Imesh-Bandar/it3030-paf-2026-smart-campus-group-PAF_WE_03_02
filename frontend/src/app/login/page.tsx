import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../stores/authStore';

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    const message = response?.data?.message;
    if (message && message.trim().length > 0) {
      return message;
    }
  }
  return fallback;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function LoginPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login, getUser, loginWithEmailPassword, registerWithEmailPassword } = useAuth();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setAuth = useAuthStore((state) => state.setAuth);
  const handledTokenLoginRef = useRef(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Handle OAuth redirect: only re-runs when the URL search params change
  useEffect(() => {
    if (handledTokenLoginRef.current) return;

    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (!accessToken) return;

    handledTokenLoginRef.current = true;
    setAuth({
      accessToken,
      refreshToken,
      user: {
        id: 'temp-id',
        email: 'user@smartcampus.edu',
        fullName: 'Smart Campus User',
        role: 'USER',
      },
    });

    // Try to hydrate the real user profile; navigate home regardless
    getUser()
      .then(() => navigate('/', { replace: true }))
      .catch(() => navigate('/', { replace: true })); // don't clear auth on /me failure
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]); // intentionally omit — only re-run on URL param changes

  // Redirect already-authenticated users away from login (mount only)
  useEffect(() => {
    if (isAuthenticated && !params.get('access_token')) {
      navigate('/', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount-only — avoids looping on isAuthenticated changes

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      await loginWithEmailPassword(loginEmail, loginPassword);
      toast.success('Welcome back!');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Unable to sign in with email/password'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (registerPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await registerWithEmailPassword(registerName, registerEmail, registerPassword);
      toast.success('Registration successful. Welcome to Smart Campus!');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Unable to create account'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="landing-grid" aria-label="Authentication">
        {/* ── Left Hero Panel ── */}
        <article className="landing-hero">
          <div className="landing-hero-content">
            <p className="auth-eyebrow">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Smart Campus Platform
            </p>

            <h1>Manage facilities, bookings, and support from one place.</h1>

            <p className="landing-copy">
              Modernize campus operations with a single portal for students, admins, and
              technicians. Sign in to continue or create your account in seconds.
            </p>

            <ul className="landing-points">
              {[
                { icon: '⚡', text: 'Real-time booking and availability tracking' },
                { icon: '🛡️', text: 'Role-based dashboards for admins and staff' },
                { icon: '🔗', text: 'Google and email registration in one flow' },
              ].map((item) => (
                <li key={item.text}>
                  <span className="landing-point-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </article>

        {/* ── Right Auth Card ── */}
        <div className="auth-card">
          <div className="auth-header">
            <p className="auth-eyebrow">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Smart Campus
            </p>
            <h2>{mode === 'login' ? 'Welcome Back' : 'Create Your Account'}</h2>
            <p className="muted">
              {mode === 'login'
                ? 'Sign in with email/password or continue using Google.'
                : 'Register with your details or sign up instantly using Google.'}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="auth-toggle" role="group" aria-label="Authentication mode">
            <button
              type="button"
              id="btn-login-mode"
              className={mode === 'login' ? 'active' : ''}
              onClick={() => setMode('login')}
            >
              Login
            </button>
            <button
              type="button"
              id="btn-register-mode"
              className={mode === 'register' ? 'active' : ''}
              onClick={() => setMode('register')}
            >
              Register
            </button>
          </div>

          {/* Forms */}
          {mode === 'login' ? (
            <form className="auth-form" onSubmit={handleLoginSubmit} id="login-form">
              <label htmlFor="login-email">
                Email
                <input
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  autoComplete="email"
                />
              </label>
              <label htmlFor="login-password">
                Password
                <input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  autoComplete="current-password"
                />
              </label>
              <button type="submit" id="btn-sign-in" disabled={loading}>
                {loading ? 'Signing In…' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleRegisterSubmit} id="register-form">
              <label htmlFor="register-name">
                Full Name
                <input
                  id="register-name"
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                  minLength={2}
                  placeholder="Your full name"
                  autoComplete="name"
                />
              </label>
              <label htmlFor="register-email">
                Email
                <input
                  id="register-email"
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  autoComplete="email"
                />
              </label>
              <label htmlFor="register-password">
                Password
                <input
                  id="register-password"
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
              </label>
              <label htmlFor="register-confirm">
                Confirm Password
                <input
                  id="register-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                />
              </label>
              <button type="submit" id="btn-create-account" disabled={loading}>
                {loading ? 'Creating Account…' : 'Create Account'}
              </button>
            </form>
          )}

          <div className="auth-divider" aria-hidden="true">
            <span>or</span>
          </div>

          <button
            type="button"
            id="btn-google-auth"
            className="google-button"
            onClick={login}
            disabled={loading}
          >
            <GoogleIcon />
            {mode === 'register' ? 'Register with Google' : 'Sign in with Google'}
          </button>

          <p className="auth-footnote">
            {mode === 'register'
              ? 'Google registration creates your account using your Google profile details.'
              : 'Use your Smart Campus credentials or your Google account.'}
          </p>
        </div>
      </section>
    </main>
  );
}
