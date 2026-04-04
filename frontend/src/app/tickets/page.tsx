import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { TicketCard } from '../../components/tickets/TicketCard';
import { TicketForm } from '../../components/tickets/TicketForm';
import { useRole } from '../../hooks/useRole';
import { useTickets } from '../../hooks/useTickets';
import type { TicketCategory, TicketSeverity, TicketStatus } from '../../services/types/ticket';

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

export function TicketsPage() {
  const navigate = useNavigate();
  const { isAdmin, isTechnician } = useRole();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<TicketStatus | 'ALL'>('ALL');
  const [severity, setSeverity] = useState<TicketSeverity | 'ALL'>('ALL');
  const [category, setCategory] = useState<TicketCategory | 'ALL'>('ALL');
  const [page, setPage] = useState(0);

  const ticketsQuery = useTickets({
    q: query,
    status,
    severity,
    category,
    page,
    size: 10,
    sort: 'createdAt,desc',
  });

  const tickets = useMemo(() => ticketsQuery.data?.content ?? [], [ticketsQuery.data]);
  const pageCount = ticketsQuery.data?.totalPages ?? 0;
  const currentPage = ticketsQuery.data?.number ?? page;
  const ticketStats = useMemo(() => {
    const counts = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0 };
    for (const ticket of tickets) {
      if (ticket.status === 'OPEN') counts.OPEN += 1;
      if (ticket.status === 'IN_PROGRESS') counts.IN_PROGRESS += 1;
      if (ticket.status === 'RESOLVED') counts.RESOLVED += 1;
    }
    return counts;
  }, [tickets]);

  return (
    <main className="page-shell ticket-page animate-fade-up" id="tickets-page">
      <div className="section-header">
        <div>
          <p className="section-eyebrow">Support & Maintenance</p>
          <h1>Tickets</h1>
          <p className="section-subtitle">
            Report issues, follow progress, and keep maintenance work visible from one place.
          </p>
        </div>
        {(isAdmin() || isTechnician()) && (
          <Link className="btn-primary" to="/admin/tickets" id="btn-admin-ticket-board">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Open Ticket Board
          </Link>
        )}
      </div>

      <section className="ticket-grid">
        <div className="ticket-panel ticket-panel-hero">
          <div className="ticket-panel-copy">
            <h2>Report a campus issue</h2>
            <p>
              Choose the affected resource, describe the problem, and submit your report. You can
              follow comments, evidence, and status updates right here.
            </p>
          </div>
          <TicketForm
            onCreated={(ticket) => {
              toast.success(`Ticket ${ticket.ticketNumber} created`);
              navigate(`/tickets/${ticket.id}`);
            }}
          />

          <div className="ticket-kpi-grid" role="status" aria-label="Ticket summary">
            <article className="ticket-kpi-card">
              <span>Open</span>
              <strong>{ticketStats.OPEN}</strong>
            </article>
            <article className="ticket-kpi-card">
              <span>In Progress</span>
              <strong>{ticketStats.IN_PROGRESS}</strong>
            </article>
            <article className="ticket-kpi-card">
              <span>Resolved</span>
              <strong>{ticketStats.RESOLVED}</strong>
            </article>
          </div>
        </div>

        <div className="ticket-panel">
          <div className="ticket-toolbar">
            <div>
              <h2>My tickets</h2>
              <p className="muted">
                {isAdmin()
                  ? 'All reported tickets are visible to admins.'
                  : isTechnician()
                    ? 'Tickets currently assigned to you.'
                    : 'Tickets you reported and their current status.'}
              </p>
            </div>
            <div className="ticket-search-row">
              <input
                className="ticket-input"
                type="search"
                placeholder="Search by ticket, title, resource, or reporter"
                value={query}
                onChange={(event) => {
                  setPage(0);
                  setQuery(event.target.value);
                }}
              />
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setQuery('');
                  setStatus('ALL');
                  setSeverity('ALL');
                  setCategory('ALL');
                  setPage(0);
                }}
              >
                Reset
              </button>
            </div>
          </div>

          <div className="ticket-results-row">
            <span>
              Showing {tickets.length} ticket{tickets.length === 1 ? '' : 's'} on this page
            </span>
            <span>Total: {ticketsQuery.data?.totalElements ?? 0}</span>
          </div>

          <div className="ticket-filter-row">
            <select
              className="ticket-input"
              value={status}
              onChange={(event) => {
                setPage(0);
                setStatus(event.target.value as TicketStatus | 'ALL');
              }}
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
              onChange={(event) => {
                setPage(0);
                setSeverity(event.target.value as TicketSeverity | 'ALL');
              }}
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
              onChange={(event) => {
                setPage(0);
                setCategory(event.target.value as TicketCategory | 'ALL');
              }}
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'ALL' ? 'All categories' : option}
                </option>
              ))}
            </select>
          </div>

          <div className="ticket-list">
            {ticketsQuery.isLoading && <div className="ticket-empty-state">Loading tickets...</div>}
            {ticketsQuery.isError && (
              <div className="ticket-empty-state error">
                Unable to load tickets. Please try again.
              </div>
            )}
            {!ticketsQuery.isLoading && tickets.length === 0 && (
              <div className="ticket-empty-state">No tickets match the current filters.</div>
            )}
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} to={`/tickets/${ticket.id}`} />
            ))}
          </div>

          {pageCount > 1 && (
            <div className="ticket-pagination">
              <button
                type="button"
                className="btn-ghost"
                disabled={currentPage <= 0}
                onClick={() => setPage((value) => Math.max(value - 1, 0))}
              >
                Previous
              </button>
              <span>
                Page {currentPage + 1} of {pageCount}
              </span>
              <button
                type="button"
                className="btn-ghost"
                disabled={currentPage >= pageCount - 1}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
