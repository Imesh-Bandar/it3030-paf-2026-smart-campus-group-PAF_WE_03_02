export type UserRole = 'USER' | 'ADMIN' | 'TECHNICIAN';

export type User = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  status?: 'ACTIVE' | 'LOCKED' | 'ARCHIVED';
  emailVerified?: boolean;
  createdAt?: string;
};
