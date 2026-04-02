import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';

export function useBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const response = await api.get('/bookings');
      return response.data;
    },
  });
}
