import { api } from '../../lib/axios';
import type {
  AssignmentSuggestion,
  TechnicianAvailability,
  TechnicianWorkload,
  Ticket,
  TicketAttachment,
  TicketCategory,
  TicketComment,
  TicketPriority,
  TicketSlaMetrics,
  TicketStatus,
} from '../types/ticket';

export type CreateTicketPayload = {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  location?: string;
  files?: File[];
};

export const ticketApi = {
  getAll: async (filters?: {
    status?: TicketStatus;
    assigneeId?: string;
    reporterId?: string;
  }): Promise<Ticket[]> => (await api.get('/tickets', { params: filters })).data,

  getById: async (id: string): Promise<Ticket> => (await api.get(`/tickets/${id}`)).data,

  create: async (payload: CreateTicketPayload): Promise<Ticket> => {
    const form = new FormData();
    form.append('title', payload.title);
    form.append('description', payload.description);
    form.append('category', payload.category);
    form.append('priority', payload.priority);
    if (payload.location) form.append('location', payload.location);
    payload.files?.forEach((file) => form.append('files', file));
    return (
      await api.post('/tickets', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    ).data;
  },

  updateStatus: async (id: string, status: TicketStatus, reason?: string): Promise<Ticket> =>
    (await api.put(`/tickets/${id}/status`, { status, reason })).data,

  assign: async (id: string, technicianId: string): Promise<Ticket> =>
    (await api.put(`/tickets/${id}/assign`, { technicianId })).data,

  delete: async (id: string) => api.delete(`/tickets/${id}`),

  addComment: async (id: string, content: string, internal = false): Promise<TicketComment> =>
    (await api.post(`/tickets/${id}/comments`, { content, internal })).data,

  updateComment: async (
    ticketId: string,
    commentId: string,
    content: string,
    internal?: boolean,
  ): Promise<TicketComment> =>
    (await api.put(`/tickets/${ticketId}/comments/${commentId}`, { content, internal })).data,

  deleteComment: async (ticketId: string, commentId: string) =>
    api.delete(`/tickets/${ticketId}/comments/${commentId}`),

  attachments: async (id: string): Promise<TicketAttachment[]> =>
    (await api.get(`/tickets/${id}/attachments`)).data,

  slaMetrics: async (): Promise<TicketSlaMetrics> =>
    (await api.get('/admin/tickets/sla-metrics')).data,

  technicianWorkload: async (): Promise<TechnicianWorkload[]> =>
    (await api.get('/admin/technician-workload')).data,

  assignmentSuggestion: async (id: string): Promise<AssignmentSuggestion> =>
    (await api.get(`/admin/tickets/${id}/assignment-suggestion`)).data,

  getMyAvailability: async (): Promise<TechnicianAvailability> =>
    (await api.get('/tickets/technician/availability')).data,

  updateMyAvailability: async (payload: {
    available: boolean;
    note?: string;
  }): Promise<TechnicianAvailability> =>
    (await api.put('/tickets/technician/availability', payload)).data,
};
