import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/axios';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../services/api/authApi';

export function useAuth() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const updateUser = useAuthStore((state) => state.updateUser);
  const backendBase =
    import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') ?? 'http://localhost:8008';

  const login = useCallback(() => {
    window.location.href = `${backendBase}/auth/google`;
  }, [backendBase]);

  const loginWithEmailPassword = useCallback(
    async (email: string, password: string) => {
      const response = await authApi.login({ email, password });
      const nextUser = response?.user;
      const nextAccessToken = response?.accessToken;
      const nextRefreshToken = response?.refreshToken;

      if (!nextUser || !nextAccessToken) {
        throw new Error('Invalid login response');
      }

      setAuth({
        user: nextUser,
        accessToken: nextAccessToken,
        refreshToken: nextRefreshToken,
      });
      navigate('/', { replace: true });
      return nextUser;
    },
    [navigate, setAuth],
  );

  const registerWithEmailPassword = useCallback(
    async (fullName: string, email: string, password: string) => {
      const response = await authApi.register({ fullName, email, password });
      const nextUser = response?.user;
      const nextAccessToken = response?.accessToken;
      const nextRefreshToken = response?.refreshToken;

      if (!nextUser || !nextAccessToken) {
        throw new Error('Invalid registration response');
      }

      setAuth({
        user: nextUser,
        accessToken: nextAccessToken,
        refreshToken: nextRefreshToken,
      });
      navigate('/', { replace: true });
      return nextUser;
    },
    [navigate, setAuth],
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout', refreshToken ? { refreshToken } : {});
    } finally {
      clearAuth();
      navigate('/');
    }
  }, [clearAuth, navigate, refreshToken]);

  const refreshAccessToken = useCallback(async () => {
    const response = await api.post('/auth/refresh', refreshToken ? { refreshToken } : {});
    const accessToken = response.data?.accessToken;
    const nextRefreshToken = response.data?.refreshToken ?? refreshToken;
    const nextUser = response.data?.user ?? user;

    if (accessToken && nextUser) {
      setAuth({ user: nextUser, accessToken, refreshToken: nextRefreshToken });
    }

    return accessToken;
  }, [refreshToken, setAuth, user]);

  const getUser = useCallback(async () => {
    const response = await api.get('/auth/me');
    updateUser(response.data);
    return response.data;
  }, [updateUser]);

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    login,
    loginWithEmailPassword,
    registerWithEmailPassword,
    logout,
    refreshAccessToken,
    getUser,
  };
}
