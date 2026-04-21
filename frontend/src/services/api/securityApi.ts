import { api } from '../../lib/axios';

export interface SecurityActivityLog {
  id: string;
  eventType: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  suspicious: boolean;
  acknowledgedAt?: string;
  details?: string;
  createdAt: string;
}

export interface SecurityActivityPage {
  content: SecurityActivityLog[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const securityApi = {
  getActivity: async (page = 0, size = 20): Promise<SecurityActivityPage> =>
    (await api.get(`/auth/security-activity?page=${page}&size=${size}`)).data,

  getSuspiciousActivity: async (): Promise<SecurityActivityLog[]> =>
    (await api.get('/auth/security-activity/suspicious')).data,

  acknowledgeSuspicious: async (): Promise<void> => {
    await api.put('/auth/security-activity/suspicious/acknowledge');
  },

  getBootstrap: async () => (await api.get('/auth/bootstrap')).data,
};
