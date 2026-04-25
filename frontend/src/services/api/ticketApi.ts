import { api } from '../../lib/axios';

export const ticketApi = {
  getAll: async () => (await api.get('/tickets')).data,
};
