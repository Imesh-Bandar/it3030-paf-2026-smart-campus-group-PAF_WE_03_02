import { api } from '../../lib/axios';

export const notificationApi = {
  getAll: async () => (await api.get('/notifications')).data,
};
