import { api } from '../../lib/axios';
import type { NotificationPageResponse, Notification } from '../types/notification';

export const notificationApi = {
  getNotifications: async (params?: { page?: number; size?: number; read?: boolean }): Promise<NotificationPageResponse> => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },
  markAsRead: async (id: string): Promise<Notification> => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  }
};
