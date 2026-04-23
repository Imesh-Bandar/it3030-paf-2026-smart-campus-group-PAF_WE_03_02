export type AvailabilityWindow = {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type Facility = {
  id: string;
  resourceCode: string;
  name: string;
  type: 'LECTURE_HALL' | 'LAB' | 'MEETING_ROOM' | 'EQUIPMENT';
  status: 'ACTIVE' | 'OUT_OF_SERVICE' | 'UNDER_MAINTENANCE';
  location: string;
  capacity: number;
  description?: string | null;
  thumbnailUrl?: string | null;
  amenities: string[];
  specifications: Record<string, string>;
  availabilityWindows: AvailabilityWindow[];
  createdAt?: string;
  updatedAt?: string;
};

export type FacilityFilters = {
  type?: string;
  status?: string;
  capacityMin?: number;
  capacityMax?: number;
  q?: string;
};

export type FacilityRequestPayload = {
  resourceCode: string;
  name: string;
  type: Facility['type'];
  status?: Facility['status'];
  location: string;
  capacity: number;
  description?: string;
  thumbnailUrl?: string;
  amenities: string[];
  specifications: Record<string, string>;
  availabilityWindows: AvailabilityWindow[];
};

export type AvailabilitySlot = {
  startTime: string;
  endTime: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'BLOCKED' | 'UNAVAILABLE';
  bookingId?: string | null;
  bookedBy?: string | null;
  reason?: string | null;
};

export type AvailabilityDay = {
  date: string;
  slots: AvailabilitySlot[];
};

export type FacilityAvailability = {
  resourceId: string;
  resourceName: string;
  from: string;
  to: string;
  availability: AvailabilityDay[];
};

export type MaintenanceBlackout = {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
};

export type MaintenanceBlackoutPayload = {
  startDate: string;
  endDate: string;
  reason: string;
};

export type ResourceOption = {
  id: string;
  name: string;
};
export type ResourceOption = Pick<Facility, 'id' | 'name'>;
