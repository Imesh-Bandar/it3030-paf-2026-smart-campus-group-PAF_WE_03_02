import { api } from '../../lib/axios';

export const authApi = {
  me: async () => (await api.get('/auth/me')).data,
  refresh: async (refreshToken?: string | null) =>
    (await api.post('/auth/refresh', refreshToken ? { refreshToken } : {})).data,
  logout: async (refreshToken?: string | null) =>
    api.post('/auth/logout', refreshToken ? { refreshToken } : {}),
};
