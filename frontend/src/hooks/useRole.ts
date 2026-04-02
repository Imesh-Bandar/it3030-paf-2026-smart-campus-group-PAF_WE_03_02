import { useMemo } from 'react';
import { useAuthStore } from '../stores/authStore';

export function useRole() {
  const role = useAuthStore((state) => state.user?.role ?? 'USER');

  return useMemo(
    () => ({
      role,
      isAdmin: () => role === 'ADMIN',
      isTechnician: () => role === 'TECHNICIAN',
      isUser: () => role === 'USER',
    }),
    [role],
  );
}
