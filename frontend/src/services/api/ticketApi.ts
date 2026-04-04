import { api } from '../../lib/axios';
import type {
  AssignTicketPayload,
  CreateTicketCommentPayload,
  CreateTicketPayload,
  TicketDetail,
  TicketFilters,
  TicketPage,
  TicketSummary,
  UpdateTicketStatusPayload,
} from '../types/ticket';

function buildQuery(params: TicketFilters = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === 'ALL') {
      return;
    }
    query.set(key, String(value));
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

export const ticketApi = {
  list: async (params: TicketFilters = {}): Promise<TicketPage<TicketSummary>> =>
    (await api.get(`/tickets${buildQuery(params)}`)).data,
  getById: async (id: string): Promise<TicketDetail> => (await api.get(`/tickets/${id}`)).data,
  create: async (payload: CreateTicketPayload): Promise<TicketDetail> =>
    (await api.post('/tickets', payload)).data,
  updateStatus: async (id: string, payload: UpdateTicketStatusPayload): Promise<TicketDetail> =>
    (await api.put(`/tickets/${id}/status`, payload)).data,
  assign: async (id: string, payload: AssignTicketPayload): Promise<TicketDetail> =>
    (await api.put(`/tickets/${id}/assign`, payload)).data,
  addComment: async (id: string, payload: CreateTicketCommentPayload) =>
    (await api.post(`/tickets/${id}/comments`, payload)).data,
  addEvidence: async (ticketId: string, file: File) => {
    const formData = new FormData();
    formData.append('ticketId', ticketId);
    formData.append('file', file);

    return (await api.post('/tickets/evidence', formData)).data;
  },
  getComments: async (id: string) => (await api.get(`/tickets/${id}/comments`)).data,
  getEvidence: async (id: string) => (await api.get(`/tickets/${id}/evidence`)).data,
  getAll: async (): Promise<TicketPage<TicketSummary>> => (await api.get('/tickets')).data,
};
