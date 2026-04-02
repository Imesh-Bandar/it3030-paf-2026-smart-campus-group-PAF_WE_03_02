import { api } from '../../lib/axios';

export const facilityApi = {
  getAll: async () => (await api.get('/resources')).data,
};
