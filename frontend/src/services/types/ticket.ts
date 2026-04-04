export type TicketSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketCategory = 'ELECTRICAL' | 'PLUMBING' | 'EQUIPMENT' | 'CLEANING' | 'OTHER';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export type TicketComment = {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
};

export type TicketEvidence = {
  id: string;
  url: string;
  uploadedById: string;
  uploadedByName: string;
  uploadedAt: string;
};

export type TicketStatusHistory = {
  id: string;
  oldStatus: TicketStatus | null;
  newStatus: TicketStatus;
  changedById: string;
  changedByName: string;
  notes: string | null;
  createdAt: string;
};

export type TicketSummary = {
  id: string;
  ticketNumber: string;
  resourceId: string;
  resourceName: string;
  reporterId: string;
  reporterName: string;
  assignedToId: string | null;
  assignedToName: string | null;
  assignedById: string | null;
  assignedByName: string | null;
  title: string;
  description: string;
  severity: TicketSeverity;
  category: TicketCategory;
  status: TicketStatus;
  assignedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  commentCount: number;
  evidenceCount: number;
};

export type TicketDetail = TicketSummary & {
  comments: TicketComment[];
  evidence: TicketEvidence[];
  statusHistory: TicketStatusHistory[];
};

export type TicketPage<T> = {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export type TicketFilters = {
  q?: string;
  status?: TicketStatus | 'ALL';
  severity?: TicketSeverity | 'ALL';
  category?: TicketCategory | 'ALL';
  resourceId?: string;
  assignedTo?: string;
  page?: number;
  size?: number;
  sort?: string;
};

export type CreateTicketPayload = {
  resourceId: string;
  title: string;
  description: string;
  severity: TicketSeverity;
  category: TicketCategory;
};

export type UpdateTicketStatusPayload = {
  status: TicketStatus;
  notes?: string;
};

export type AssignTicketPayload = {
  assignedToId: string;
  notes?: string;
};

export type CreateTicketCommentPayload = {
  text: string;
};
