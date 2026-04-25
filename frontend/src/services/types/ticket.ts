export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketCategory =
  | 'ELECTRICAL'
  | 'PLUMBING'
  | 'IT_EQUIPMENT'
  | 'HVAC'
  | 'STRUCTURAL'
  | 'OTHER';

export type TicketAttachment = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType?: string;
  uploadedById?: string;
  uploadedByName?: string;
  createdAt: string;
};

export type TicketComment = {
  id: string;
  authorId?: string;
  authorName: string;
  authorRole?: string;
  content: string;
  internal: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Ticket = {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  location?: string;
  reporterId?: string;
  reporterName?: string;
  assigneeId?: string;
  assigneeName?: string;
  firstResponseAt?: string;
  resolvedAt?: string;
  slaBreached: boolean;
  elapsedMinutes: number;
  resolutionMinutes: number;
  createdAt: string;
  updatedAt: string;
  attachments: TicketAttachment[];
  comments: TicketComment[];
};

export type TicketSlaMetrics = {
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  slaBreachedTickets: number;
  averageFirstResponseMinutes: number;
  averageResolutionMinutes: number;
  priorityMix: Record<TicketPriority, number>;
};

export type TechnicianWorkload = {
  technicianId: string;
  technicianName: string;
  available: boolean;
  availabilityNote?: string;
  availabilityUpdatedAt?: string;
  activeTickets: number;
  overdueTickets: number;
  loadStatus: 'LOW' | 'MEDIUM' | 'HIGH';
  priorityMix: Record<TicketPriority, number>;
};

export type TechnicianAvailability = {
  technicianId: string;
  technicianName: string;
  available: boolean;
  note?: string;
  updatedAt?: string;
};

export type AssignmentSuggestion = {
  ticketId: string;
  suggestedTechnicianId?: string;
  suggestedTechnicianName?: string;
  reason: string;
  workloads: TechnicianWorkload[];
};
