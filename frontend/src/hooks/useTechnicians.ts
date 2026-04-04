import { useQuery } from '@tanstack/react-query';
import { userApi } from '../services/api/userApi';

export function useTechnicians(enabled = true) {
  return useQuery({
    queryKey: ['users', 'technicians'],
    queryFn: async () => userApi.getAll('TECHNICIAN'),
    enabled,
    staleTime: 60_000,
  });
}
