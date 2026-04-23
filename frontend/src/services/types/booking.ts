export type Booking = {
  id: string;
  resourceId: string;
  resourceName: string;
  bookerId: string;
  bookerName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  rejectedReason?: string | null;
  qrToken?: string | null;
  approvedAt?: string | null;
  checkedInAt?: string | null;
  checkedInBy?: string | null;
  waitlisted: boolean;
  waitlistPosition?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type BookingRequestPayload = {
  resourceId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
};

export type BookingActionPayload = {
  reason?: string;
};

export type BookingCheckInPayload = {
  qrToken: string;
};

export type BookingAlternativeSlot = {
  startTime: string;
  endTime: string;
};

export type BookingConflictPreview = {
  conflictDetected: boolean;
  message: string;
  alternatives: BookingAlternativeSlot[];
};

export type BookingFilterStatus = 'ALL' | Booking['status'];
