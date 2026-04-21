import { api } from '../../lib/axios';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  referenceId?: string;
  referenceType?: string;
  read: boolean;
  createdAt: string;
  readAt?: string;
}

export interface NotificationPage {
  content: Notification[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface NotificationPreferences {
  bookingNotifications: boolean;
  ticketNotifications: boolean;
  securityNotifications: boolean;
  reminderNotifications: boolean;
  generalNotifications: boolean;
}

export const notificationApi = {
  getAll: async (page = 0, size = 20): Promise<NotificationPage> =>
    (await api.get(`/notifications?page=${page}&size=${size}`)).data,

  getUnreadCount: async (): Promise<number> =>
    (await api.get('/notifications/unread-count')).data,

  markAsRead: async (id: string): Promise<Notification> =>
    (await api.put(`/notifications/${id}/read`)).data,

  markAllAsRead: async (): Promise<void> => {
    await api.put('/notifications/read-all');
  },

  deleteNotification: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },

  getPreferences: async (): Promise<NotificationPreferences> =>
    (await api.get('/notifications/preferences')).data,

  updatePreferences: async (prefs: NotificationPreferences): Promise<NotificationPreferences> =>
    (await api.put('/notifications/preferences', prefs)).data,
};
