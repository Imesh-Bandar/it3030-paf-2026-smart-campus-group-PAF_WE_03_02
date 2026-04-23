import { api } from '../../lib/axios';
import type { ResourceOption } from '../types/facility';

export const facilityApi = {
  getAll: async (): Promise<ResourceOption[]> => (await api.get('/resources')).data,
};
