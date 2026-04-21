import { api } from '../../lib/axios';

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'STAFF' | 'TECHNICIAN';
};

export const authApi = {
  login: async (payload: LoginPayload) => (await api.post('/auth/login', payload)).data,
  register: async (payload: RegisterPayload) => (await api.post('/auth/register', payload)).data,
  me: async () => (await api.get('/auth/me')).data,
  refresh: async (refreshToken?: string | null) =>
    (await api.post('/auth/refresh', refreshToken ? { refreshToken } : {})).data,
  logout: async (refreshToken?: string | null) =>
    api.post('/auth/logout', refreshToken ? { refreshToken } : {}),
};
