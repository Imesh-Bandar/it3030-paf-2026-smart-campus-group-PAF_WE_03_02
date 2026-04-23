import { api } from '../../lib/axios';
import type {
  Booking,
  BookingActionPayload,
  BookingCheckInPayload,
  BookingConflictPreview,
  BookingRequestPayload,
} from '../types/booking';

export const bookingApi = {
  getAll: async (): Promise<Booking[]> => (await api.get('/bookings')).data,
  getById: async (id: string): Promise<Booking> => (await api.get(`/bookings/${id}`)).data,
  getPendingForAdmin: async (): Promise<Booking[]> => (await api.get('/bookings/admin/all')).data,
  getResourceBookings: async (resourceId: string, date: string): Promise<Booking[]> =>
    (await api.get(`/resources/${resourceId}/bookings`, { params: { date } })).data,
  create: async (payload: BookingRequestPayload): Promise<Booking> =>
    (await api.post('/bookings', payload)).data,
  previewConflict: async (payload: BookingRequestPayload): Promise<BookingConflictPreview> =>
    (await api.post('/bookings/conflicts/preview', payload)).data,
  approve: async (id: string): Promise<Booking> => (await api.put(`/bookings/${id}/approve`)).data,
  reject: async (id: string, payload?: BookingActionPayload): Promise<Booking> =>
    (await api.put(`/bookings/${id}/reject`, payload ?? {})).data,
  cancel: async (id: string, payload?: BookingActionPayload): Promise<Booking> =>
    (await api.put(`/bookings/${id}/cancel`, payload ?? {})).data,
  checkIn: async (id: string, payload: BookingCheckInPayload): Promise<Booking> =>
    (await api.post(`/bookings/${id}/check-in`, payload)).data,
};
