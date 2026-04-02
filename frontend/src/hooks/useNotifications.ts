import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get('/notifications');
      return response.data;
    },
  });
}
