import { useQuery } from '@tanstack/react-query';
import { facilityApi } from '../services/api/facilityApi';
import type { Facility, FacilityFilters } from '../services/types/facility';

export function useFacilities(filters?: FacilityFilters) {
  return useQuery<Facility[]>({
    queryKey: ['facilities', filters ?? {}],
    queryFn: () => facilityApi.getAll(filters),
  });
}
