import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';

export function useTickets() {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const response = await api.get('/tickets');
      return response.data;
    },
  });
}
