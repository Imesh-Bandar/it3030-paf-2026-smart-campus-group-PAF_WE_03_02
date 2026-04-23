import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { TicketBoard } from '../../../components/tickets/TicketBoard';
import { TicketPriorityBadge, TicketStatusBadge } from '../../../components/tickets/TicketBadges';
import { ticketApi } from '../../../services/api/ticketApi';
import { authApi } from '../../../services/api/authApi';

export function AdminTicketsPage() {
  const queryClient = useQueryClient();
  const { data: tickets = [] } = useQuery({ queryKey: ['tickets', 'admin'], queryFn: () => ticketApi.getAll() });
  const { data: metrics } = useQuery({ queryKey: ['ticket-sla-metrics'], queryFn: ticketApi.slaMetrics });
  const { data: workloads = [] } = useQuery({ queryKey: ['technician-workload'], queryFn: ticketApi.technicianWorkload });
  const { data: users = [] } = useQuery({ queryKey: ['admin-users'], queryFn: authApi.listUsers });
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const { data: suggestion } = useQuery({
    queryKey: ['assignment-suggestion', selectedTicketId],
    queryFn: () => ticketApi.assignmentSuggestion(selectedTicketId),
    enabled: Boolean(selectedTicketId),
  });

  const technicians = useMemo(() => users.filter((user) => user.role === 'TECHNICIAN'), [users]);
  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId);

  const assign = async (technicianId: string) => {
    if (!selectedTicketId) return;
    await ticketApi.assign(selectedTicketId, technicianId);
    toast.success('Technician assigned');
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['tickets'] }),
      queryClient.invalidateQueries({ queryKey: ['technician-workload'] }),
      queryClient.invalidateQueries({ queryKey: ['assignment-suggestion'] }),
    ]);
  };

  return (
    <main className="page-shell animate-fade-up" id="admin-tickets-page">
      <div className="section-header">
        <div>
          <p className="section-eyebrow">Maintenance Operations</p>
          <h1>Ticket Command Board</h1>
        </div>
      </div>

      {metrics && (
        <section className="ticket-metric-grid">
          <article><span>Open</span><strong>{metrics.openTickets}</strong></article>
          <article><span>In progress</span><strong>{metrics.inProgressTickets}</strong></article>
          <article><span>SLA risks</span><strong>{metrics.slaBreachedTickets}</strong></article>
          <article><span>Avg response</span><strong>{Math.round(metrics.averageFirstResponseMinutes)}m</strong></article>
        </section>
      )}

      <section className="ticket-admin-grid">
        <div>
          <div className="section-header compact"><h2>All tickets</h2></div>
          <TicketBoard tickets={tickets} />
        </div>

        <aside className="ticket-assignment-panel">
          <h2>Assignment</h2>
          <select value={selectedTicketId} onChange={(event) => setSelectedTicketId(event.target.value)}>
            <option value="">Select ticket</option>
            {tickets.filter((ticket) => ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED').map((ticket) => (
              <option value={ticket.id} key={ticket.id}>{ticket.ticketNumber} - {ticket.title}</option>
            ))}
          </select>
          {selectedTicket && (
            <div className="ticket-assignment-current">
              <TicketStatusBadge status={selectedTicket.status} />
              <TicketPriorityBadge priority={selectedTicket.priority} />
              <p>{selectedTicket.assigneeName ? `Assigned to ${selectedTicket.assigneeName}` : 'No technician assigned'}</p>
            </div>
          )}
          {suggestion && (
            <div className="suggestion-box">
              <strong>{suggestion.suggestedTechnicianName ?? 'No suggestion'}</strong>
              <p>{suggestion.reason}</p>
              {suggestion.suggestedTechnicianId && (
                <button type="button" className="btn-primary" onClick={() => assign(suggestion.suggestedTechnicianId!)}>
                  Use suggestion
                </button>
              )}
            </div>
          )}
          <div className="technician-list">
            {technicians.map((tech) => {
              const load = workloads.find((item) => item.technicianId === tech.id);
              return (
                <button type="button" key={tech.id} onClick={() => assign(tech.id)} disabled={!selectedTicketId}>
                  <span>{tech.fullName}</span>
                  <small>{load ? `${load.activeTickets} active / ${load.loadStatus}` : 'No load data'}</small>
                </button>
              );
            })}
          </div>
        </aside>
      </section>
    </main>
  );
}
