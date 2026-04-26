import { api } from '../../lib/axios';
import type {
  Facility,
  FacilityAvailability,
  FacilityFilters,
  FacilityRequestPayload,
  MaintenanceBlackout,
  MaintenanceBlackoutPayload,
} from '../types/facility';

const normalizeFacilityPayload = (payload: FacilityRequestPayload): FacilityRequestPayload => ({
  ...payload,
  resourceCode: payload.resourceCode.trim(),
  name: payload.name.trim(),
  location: payload.location.trim(),
  status: payload.status?.trim() as FacilityRequestPayload['status'] | undefined,
  description: payload.description?.trim() || undefined,
  thumbnailUrl: payload.thumbnailUrl?.trim() || undefined,
  amenities: payload.amenities.map((amenity) => amenity.trim()).filter(Boolean),
  specifications: Object.fromEntries(
    Object.entries(payload.specifications)
      .map(([key, value]) => [key.trim(), value.trim()] as const)
      .filter(([key, value]) => key.length > 0 && value.length > 0),
  ),
  availabilityWindows: payload.availabilityWindows.map((window) => ({
    dayOfWeek: Number(window.dayOfWeek),
    startTime: window.startTime.length === 5 ? `${window.startTime}:00` : window.startTime,
    endTime: window.endTime.length === 5 ? `${window.endTime}:00` : window.endTime,
  })),
});

export const facilityApi = {
  getAll: async (filters?: FacilityFilters): Promise<Facility[]> =>
    (await api.get('/resources', { params: filters })).data,
  getById: async (id: string): Promise<Facility> => (await api.get(`/resources/${id}`)).data,
  create: async (payload: FacilityRequestPayload): Promise<Facility> =>
    (await api.post('/resources', normalizeFacilityPayload(payload))).data,
  update: async (id: string, payload: FacilityRequestPayload): Promise<Facility> =>
    (await api.put(`/resources/${id}`, normalizeFacilityPayload(payload))).data,
  remove: async (id: string) => (await api.delete(`/resources/${id}`)).data,
  getAvailability: async (id: string, from: string, to: string): Promise<FacilityAvailability> =>
    (await api.get(`/resources/${id}/availability`, { params: { from, to } })).data,
  getBlackouts: async (id: string): Promise<MaintenanceBlackout[]> =>
    (await api.get(`/resources/${id}/maintenance-blackouts`)).data,
  createBlackout: async (
    id: string,
    payload: MaintenanceBlackoutPayload,
  ): Promise<MaintenanceBlackout> =>
    (await api.post(`/resources/${id}/maintenance-blackouts`, payload)).data,
  removeBlackout: async (id: string, blackoutId: string) =>
    (await api.delete(`/resources/${id}/maintenance-blackouts/${blackoutId}`)).data,
};
