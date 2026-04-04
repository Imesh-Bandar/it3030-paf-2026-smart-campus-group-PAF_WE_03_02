import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';

export function useBookings(options?: { status?: string; page?: number; size?: number }) {
  return useQuery({
    queryKey: ['bookings', options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.status) params.append('status', options.status);
      if (options?.page) params.append('page', options.page.toString());
      if (options?.size) params.append('size', options.size?.toString());

      const response = await api.get(`/bookings?${params.toString()}`);
      return response.data;
    },
  });
}

export function useBookingStats() {
  return useQuery({
    queryKey: ['booking-stats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/admin/stats');
      return response.data?.bookingStats;
    },
  });
}
