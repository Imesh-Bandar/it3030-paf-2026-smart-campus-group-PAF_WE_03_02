export type UserRole = 'STUDENT' | 'STAFF' | 'TECHNICIAN' | 'ADMIN' | 'USER';

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
