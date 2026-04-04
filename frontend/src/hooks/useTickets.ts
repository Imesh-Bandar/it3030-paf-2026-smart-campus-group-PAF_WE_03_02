import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ticketApi } from '../services/api/ticketApi';
import type {
  AssignTicketPayload,
  CreateTicketCommentPayload,
  CreateTicketPayload,
  TicketFilters,
  UpdateTicketStatusPayload,
} from '../services/types/ticket';

export function useTickets(params: TicketFilters = {}) {
  return useQuery({
    queryKey: ['tickets', params],
    queryFn: async () => ticketApi.list(params),
    staleTime: 60_000,
  });
}

export function useTicket(id?: string) {
  return useQuery({
    queryKey: ['ticket', id],
    enabled: Boolean(id),
    queryFn: async () => ticketApi.getById(id as string),
    staleTime: 30_000,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTicketPayload) => ticketApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTicketStatusPayload }) =>
      ticketApi.updateStatus(id, payload),
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket', ticket.id] });
    },
  });
}

export function useAssignTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AssignTicketPayload }) =>
      ticketApi.assign(id, payload),
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket', ticket.id] });
    },
  });
}

export function useAddTicketComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateTicketCommentPayload }) =>
      ticketApi.addComment(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.id] });
    },
  });
}

export function useAddTicketEvidence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => ticketApi.addEvidence(id, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket', variables.id] });
    },
  });
}
