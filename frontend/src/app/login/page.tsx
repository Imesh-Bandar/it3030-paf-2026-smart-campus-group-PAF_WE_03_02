import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../stores/authStore';

export function LoginPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login, getUser } = useAuth();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setAuth = useAuthStore((state) => state.setAuth);
  const handledTokenLoginRef = useRef(false);

  useEffect(() => {
    if (handledTokenLoginRef.current) {
      return;
    }

    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken) {
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

      getUser()
        .then(() => navigate('/facilities', { replace: true }))
        .catch(() => {
          useAuthStore.getState().clearAuth();
          handledTokenLoginRef.current = false;
        });
      return;
    }

    if (isAuthenticated) {
      navigate('/facilities', { replace: true });
    }
  }, [params, isAuthenticated, setAuth, getUser, navigate]);

  return (
    <main className="page-shell">
      <div className="card">
        <h1>Login</h1>
        <p className="muted">Sign in using your Smart Campus Google account.</p>
        <button type="button" onClick={login}>
          Sign in with Google
        </button>
      </div>
    </main>
  );
}
