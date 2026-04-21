import { api } from '../../lib/axios';
import type { User } from '../types/user';

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

type UpdateUserRolePayload = {
  role: 'STUDENT' | 'STAFF' | 'TECHNICIAN' | 'ADMIN';
};

type UpdateUserStatusPayload = {
  status: 'ACTIVE' | 'LOCKED' | 'ARCHIVED';
};

export const authApi = {
  login: async (payload: LoginPayload) => (await api.post('/auth/login', payload)).data,
  register: async (payload: RegisterPayload) => (await api.post('/auth/register', payload)).data,
  me: async () => (await api.get('/auth/me')).data,
  listUsers: async (): Promise<User[]> => (await api.get('/admin/users')).data,
  updateUserRole: async (id: string, payload: UpdateUserRolePayload): Promise<User> =>
    (await api.patch(`/admin/users/${id}/role`, payload)).data,
  updateUserStatus: async (id: string, payload: UpdateUserStatusPayload): Promise<User> =>
    (await api.patch(`/admin/users/${id}/status`, payload)).data,
  refresh: async (refreshToken?: string | null) =>
    (await api.post('/auth/refresh', refreshToken ? { refreshToken } : {})).data,
  logout: async (refreshToken?: string | null) =>
    api.post('/auth/logout', refreshToken ? { refreshToken } : {}),
};
