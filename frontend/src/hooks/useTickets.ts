import { useQuery } from '@tanstack/react-query';
import { ticketApi } from '../services/api/ticketApi';
import type { TicketStatus } from '../services/types/ticket';

export function useTickets(filters?: { status?: TicketStatus; assigneeId?: string; reporterId?: string }) {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => ticketApi.getAll(filters),
  });
}
