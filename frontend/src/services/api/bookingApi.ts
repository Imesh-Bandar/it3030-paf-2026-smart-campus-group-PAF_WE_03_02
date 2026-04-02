import { api } from '../../lib/axios';

export const bookingApi = {
  getAll: async () => (await api.get('/bookings')).data,
};
