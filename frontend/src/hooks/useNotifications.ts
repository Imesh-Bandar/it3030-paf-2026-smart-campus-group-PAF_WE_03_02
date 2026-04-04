import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../services/api/notificationApi';
import { useNotificationStore } from '../stores/notificationStore';

export const useNotifications = (params?: { page?: number; size?: number; read?: boolean }) => {
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);

  return useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const data = await notificationApi.getNotifications(params);
      setUnreadCount(data.unreadCount);
      return data;
    },
    refetchInterval: 30000, // Sync polling every 30s
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
