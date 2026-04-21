import { useMemo } from 'react';
import { useAuthStore } from '../stores/authStore';
import type { UserRole } from '../services/types/user';

export function getRoleHomePath(role?: UserRole | null): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'TECHNICIAN':
      return '/dashboard/technician';
    case 'STAFF':
      return '/dashboard/staff';
    case 'STUDENT':
    case 'USER':
    default:
      return '/dashboard/student';
  }
}

export function useRole() {
  const role = useAuthStore((state) => state.user?.role ?? 'STUDENT');

  return useMemo(
    () => ({
      role,
      isAdmin: () => role === 'ADMIN',
      isTechnician: () => role === 'TECHNICIAN',
      isStaff: () => role === 'STAFF',
      isStudent: () => role === 'STUDENT' || role === 'USER',
    }),
    [role],
  );
}
