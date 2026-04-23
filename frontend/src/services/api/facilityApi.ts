import { api } from '../../lib/axios';
import type {
  Facility,
  FacilityAvailability,
  FacilityFilters,
  FacilityRequestPayload,
  MaintenanceBlackout,
  MaintenanceBlackoutPayload,
} from '../types/facility';

export const facilityApi = {
  getAll: async (filters?: FacilityFilters): Promise<Facility[]> =>
    (await api.get('/resources', { params: filters })).data,
  getById: async (id: string): Promise<Facility> => (await api.get(`/resources/${id}`)).data,
  create: async (payload: FacilityRequestPayload): Promise<Facility> =>
    (await api.post('/resources', payload)).data,
  update: async (id: string, payload: FacilityRequestPayload): Promise<Facility> =>
    (await api.put(`/resources/${id}`, payload)).data,
  remove: async (id: string) => (await api.delete(`/resources/${id}`)).data,
  getAvailability: async (id: string, from: string, to: string): Promise<FacilityAvailability> =>
    (await api.get(`/resources/${id}/availability`, { params: { from, to } })).data,
  getBlackouts: async (id: string): Promise<MaintenanceBlackout[]> =>
    (await api.get(`/resources/${id}/maintenance-blackouts`)).data,
  createBlackout: async (id: string, payload: MaintenanceBlackoutPayload): Promise<MaintenanceBlackout> =>
    (await api.post(`/resources/${id}/maintenance-blackouts`, payload)).data,
};
