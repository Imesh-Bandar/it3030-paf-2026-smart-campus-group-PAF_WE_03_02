import { api } from '../../lib/axios';
import type { User } from '../types/user';

export const userApi = {
  getAll: async (role?: string): Promise<User[]> => {
    const query = role ? `?role=${encodeURIComponent(role)}` : '';
    return (await api.get(`/users${query}`)).data;
  },
};
