import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';

export function useTickets(options?: { status?: string; severity?: string; page?: number; size?: number }) {
  return useQuery({
    queryKey: ['tickets', options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.status) params.append('status', options.status);
      if (options?.severity) params.append('severity', options.severity);
      if (options?.page) params.append('page', options.page.toString());
      if (options?.size) params.append('size', options.size?.toString());

      const response = await api.get(`/tickets?${params.toString()}`);
      return response.data;
    },
  });
}

export function useTicketStats(userRole?: string) {
  const endpoint = userRole === 'ADMIN'
    ? '/dashboard/admin/stats'
    : userRole === 'TECHNICIAN'
      ? '/dashboard/technician/stats'
      : '/dashboard/user/stats';

  return useQuery({
    queryKey: ['ticket-stats', userRole],
    queryFn: async () => {
      const response = await api.get(endpoint);
      return response.data?.ticketStats || response.data?.ticketStatusStats;
    },
  });
}
