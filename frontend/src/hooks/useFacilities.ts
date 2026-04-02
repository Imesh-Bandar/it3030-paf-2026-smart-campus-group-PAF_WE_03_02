import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';

export function useFacilities() {
  return useQuery({
    queryKey: ['facilities'],
    queryFn: async () => {
      const response = await api.get('/resources');
      return response.data;
    },
  });
}
