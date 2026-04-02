import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/axios';
import { useAuthStore } from '../stores/authStore';

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
    import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') ?? 'http://localhost:8080';

  const login = useCallback(() => {
    window.location.href = `${backendBase}/auth/google`;
  }, [backendBase]);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout', refreshToken ? { refreshToken } : {});
    } finally {
      clearAuth();
      navigate('/login');
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
    logout,
    refreshAccessToken,
    getUser,
  };
}
