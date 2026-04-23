import { useQuery } from '@tanstack/react-query';
import { bookingApi } from '../services/api/bookingApi';
import type { Booking } from '../services/types/booking';

export function useBookings() {
  return useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: bookingApi.getAll,
  });
}
