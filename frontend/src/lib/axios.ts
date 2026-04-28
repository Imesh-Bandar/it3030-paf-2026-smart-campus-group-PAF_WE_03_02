import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8008/api/v1';

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isRefreshing = false;
let pendingRequests: Array<(token: string | null) => void> = [];

const flushPendingRequests = (token: string | null) => {
  pendingRequests.forEach((callback) => callback(token));
  pendingRequests = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push((token) => {
          if (!token) {
            reject(error);
            return;
          }

          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const state = useAuthStore.getState();
      const response = await axios.post(
        `${baseURL}/auth/refresh`,
        state.refreshToken ? { refreshToken: state.refreshToken } : {},
        { withCredentials: true },
      );
      const token = response.data?.accessToken ?? null;
      const refreshToken = response.data?.refreshToken ?? state.refreshToken;
      const user = response.data?.user ?? state.user;

      if (token && user) {
        state.setAuth({ user, accessToken: token, refreshToken });
      }

      flushPendingRequests(token);

      if (token) {
        originalRequest.headers.Authorization = `Bearer ${token}`;
      }

      return api(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().clearAuth();
      flushPendingRequests(null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
