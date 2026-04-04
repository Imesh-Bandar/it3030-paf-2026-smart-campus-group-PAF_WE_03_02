import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { TicketBoard } from '../../../components/tickets/TicketBoard';
import { TicketCard } from '../../../components/tickets/TicketCard';
import { useTickets, useUpdateTicketStatus } from '../../../hooks/useTickets';
import type { TicketCategory, TicketSeverity, TicketStatus } from '../../../services/types/ticket';

const statusOptions: Array<TicketStatus | 'ALL'> = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'];
const severityOptions: Array<TicketSeverity | 'ALL'> = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const categoryOptions: Array<TicketCategory | 'ALL'> = [
  'ALL',
  'ELECTRICAL',
  'PLUMBING',
  'EQUIPMENT',
  'CLEANING',
  'OTHER',
];

export function AdminTicketsPage() {
  const [view, setView] = useState<'board' | 'list'>('board');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<TicketStatus | 'ALL'>('ALL');
  const [severity, setSeverity] = useState<TicketSeverity | 'ALL'>('ALL');
  const [category, setCategory] = useState<TicketCategory | 'ALL'>('ALL');
  const ticketsQuery = useTickets({
    q: query,
    status,
    severity,
    category,
    page: 0,
    size: 200,
    sort: 'createdAt,desc',
  });
  const updateStatus = useUpdateTicketStatus();

  const tickets = useMemo(() => ticketsQuery.data?.content ?? [], [ticketsQuery.data]);
  const stats = useMemo(() => {
    const counts = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0 };
    for (const ticket of tickets) {
      if (ticket.status === 'OPEN') counts.OPEN += 1;
      if (ticket.status === 'IN_PROGRESS') counts.IN_PROGRESS += 1;
      if (ticket.status === 'RESOLVED') counts.RESOLVED += 1;
    }
    return counts;
  }, [tickets]);

  return (
    <main className="page-shell ticket-page animate-fade-up" id="admin-ticket-page">
      <div className="section-header">
        <div>
          <p className="section-eyebrow">Admin Ticket Operations</p>
          <h1>Ticket Board</h1>
          <p className="section-subtitle">
            Track open work, switch between kanban and list views, and keep maintenance moving.
          </p>
        </div>
        <div className="ticket-view-toggle">
          <button
            type="button"
            className={view === 'board' ? 'active' : ''}
            onClick={() => setView('board')}
          >
            Board
          </button>
          <button
            type="button"
            className={view === 'list' ? 'active' : ''}
            onClick={() => setView('list')}
          >
            List
          </button>
        </div>
      </div>

      <div className="ticket-panel">
        <div
          className="ticket-kpi-grid ticket-kpi-grid-admin"
          role="status"
          aria-label="Board summary"
        >
          <article className="ticket-kpi-card">
            <span>Total</span>
            <strong>{tickets.length}</strong>
          </article>
          <article className="ticket-kpi-card">
            <span>Open</span>
            <strong>{stats.OPEN}</strong>
          </article>
          <article className="ticket-kpi-card">
            <span>In Progress</span>
            <strong>{stats.IN_PROGRESS}</strong>
          </article>
          <article className="ticket-kpi-card">
            <span>Resolved</span>
            <strong>{stats.RESOLVED}</strong>
          </article>
        </div>

        <div className="ticket-toolbar">
          <div>
            <h2>All tickets</h2>
            <p className="muted">Filter by keyword, status, severity, or category.</p>
          </div>
          <div className="ticket-search-row">
            <input
              className="ticket-input"
              type="search"
              placeholder="Search tickets"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setQuery('');
                setStatus('ALL');
                setSeverity('ALL');
                setCategory('ALL');
              }}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="ticket-filter-row">
          <select
            className="ticket-input"
            value={status}
            onChange={(event) => setStatus(event.target.value as TicketStatus | 'ALL')}
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'ALL' ? 'All statuses' : option.replace('_', ' ')}
              </option>
            ))}
          </select>
          <select
            className="ticket-input"
            value={severity}
            onChange={(event) => setSeverity(event.target.value as TicketSeverity | 'ALL')}
          >
            {severityOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'ALL' ? 'All severities' : option}
              </option>
            ))}
          </select>
          <select
            className="ticket-input"
            value={category}
            onChange={(event) => setCategory(event.target.value as TicketCategory | 'ALL')}
          >
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'ALL' ? 'All categories' : option}
              </option>
            ))}
          </select>
        </div>

        {ticketsQuery.isLoading ? (
          <div className="ticket-empty-state">Loading tickets...</div>
        ) : ticketsQuery.isError ? (
          <div className="ticket-empty-state error">Unable to load tickets.</div>
        ) : view === 'board' ? (
          <TicketBoard
            tickets={tickets}
            onStatusChange={async (ticketId, nextStatus) => {
              try {
                await updateStatus.mutateAsync({ id: ticketId, payload: { status: nextStatus } });
                toast.success('Ticket updated');
              } catch {
                toast.error('Unable to update ticket');
              }
            }}
          />
        ) : tickets.length === 0 ? (
          <div className="ticket-empty-state">No tickets match the current filters.</div>
        ) : (
          <div className="ticket-list">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} to={`/tickets/${ticket.id}`} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
