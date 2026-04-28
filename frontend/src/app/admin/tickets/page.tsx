import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { TicketBoard } from '../../../components/tickets/TicketBoard';
import { TicketPriorityBadge, TicketStatusBadge } from '../../../components/tickets/TicketBadges';
import { ticketApi } from '../../../services/api/ticketApi';
import { getApiErrorMessage } from '../../../components/tickets/ticketUi';

export function AdminTicketsPage() {
  const queryClient = useQueryClient();
  const { data: tickets = [] } = useQuery({
    queryKey: ['tickets', 'admin'],
    queryFn: () => ticketApi.getAll(),
  });
  const { data: metrics } = useQuery({
    queryKey: ['ticket-sla-metrics'],
    queryFn: ticketApi.slaMetrics,
  });
  const { data: workloads = [] } = useQuery({
    queryKey: ['technician-workload'],
    queryFn: ticketApi.technicianWorkload,
  });
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const { data: suggestion } = useQuery({
    queryKey: ['assignment-suggestion', selectedTicketId],
    queryFn: () => ticketApi.assignmentSuggestion(selectedTicketId),
    enabled: Boolean(selectedTicketId),
  });

  const availableTechnicians = useMemo(
    () => workloads.filter((workload) => workload.available),
    [workloads],
  );
  const unavailableTechnicians = useMemo(
    () => workloads.filter((workload) => !workload.available),
    [workloads],
  );
  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId);

  const assign = async (technicianId: string) => {
    if (!selectedTicketId) return;
    const workload = workloads.find((item) => item.technicianId === technicianId);
    if (workload && !workload.available) {
      toast.error('This technician is currently unavailable');
      return;
    }
    try {
      await ticketApi.assign(selectedTicketId, technicianId);
      toast.success('Technician assigned');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tickets'] }),
        queryClient.invalidateQueries({ queryKey: ['technician-workload'] }),
        queryClient.invalidateQueries({ queryKey: ['assignment-suggestion'] }),
      ]);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not assign technician'));
    }
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
          <article>
            <span>Open</span>
            <strong>{metrics.openTickets}</strong>
          </article>
          <article>
            <span>In progress</span>
            <strong>{metrics.inProgressTickets}</strong>
          </article>
          <article>
            <span>SLA risks</span>
            <strong>{metrics.slaBreachedTickets}</strong>
          </article>
          <article>
            <span>Avg response</span>
            <strong>{Math.round(metrics.averageFirstResponseMinutes)}m</strong>
          </article>
        </section>
      )}

      <section className="ticket-admin-grid">
        <div>
          <div className="section-header compact">
            <h2>All tickets</h2>
          </div>
          <TicketBoard tickets={tickets} />
        </div>

        <aside className="ticket-assignment-panel">
          <h2>Assignment</h2>
          <p className="muted">
            Only currently available technicians can be assigned. Availability is managed by
            technicians from their ticket screen.
          </p>
          <select
            value={selectedTicketId}
            onChange={(event) => setSelectedTicketId(event.target.value)}
          >
            <option value="">Select ticket</option>
            {tickets
              .filter((ticket) => ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED')
              .map((ticket) => (
                <option value={ticket.id} key={ticket.id}>
                  {ticket.ticketNumber} - {ticket.title}
                </option>
              ))}
          </select>
          {selectedTicket && (
            <div className="ticket-assignment-current">
              <TicketStatusBadge status={selectedTicket.status} />
              <TicketPriorityBadge priority={selectedTicket.priority} />
              <p>
                {selectedTicket.assigneeName
                  ? `Assigned to ${selectedTicket.assigneeName}`
                  : 'No technician assigned'}
              </p>
            </div>
          )}
          {suggestion && (
            <div className="suggestion-box">
              <strong>{suggestion.suggestedTechnicianName ?? 'No available suggestion'}</strong>
              <p>{suggestion.reason}</p>
              {suggestion.suggestedTechnicianId && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => assign(suggestion.suggestedTechnicianId!)}
                >
                  Use suggestion
                </button>
              )}
            </div>
          )}
          {workloads.length > 0 ? (
            <div className="technician-list">
              {availableTechnicians.map((load) => {
                return (
                  <button
                    type="button"
                    key={load.technicianId}
                    onClick={() => assign(load.technicianId)}
                    disabled={!selectedTicketId}
                  >
                    <span>{load.technicianName}</span>
                    <small>{`${load.activeTickets} active / ${load.loadStatus}`}</small>
                    {load.availabilityNote && <small>{load.availabilityNote}</small>}
                  </button>
                );
              })}
              {availableTechnicians.length === 0 && (
                <div className="ticket-empty-column">No technicians are currently available.</div>
              )}
              {unavailableTechnicians.length > 0 && (
                <div className="ticket-empty-column">
                  {unavailableTechnicians.length} unavailable technician
                  {unavailableTechnicians.length === 1 ? '' : 's'} hidden from assignment.
                </div>
              )}
            </div>
          ) : (
            <div className="ticket-empty-state">
              <strong>No technicians available</strong>
              <p>
                Create a technician account or change an existing user's role to Technician before
                assigning tickets.
              </p>
              <Link to="/admin/users" className="btn-primary">
                Manage users
              </Link>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
