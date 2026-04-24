import { Link } from 'react-router-dom';
import type { Ticket } from '../../services/types/ticket';
import { SlaBadge, TicketPriorityBadge, TicketStatusBadge } from './TicketBadges';

const formatMinutes = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;
  return `${hours}h ${minutes % 60}m`;
};

export function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <article className="ticket-card ticket-card-interactive">
      <div className="ticket-card-topline">
        <span className="ticket-number">{ticket.ticketNumber}</span>
        <TicketStatusBadge status={ticket.status} />
      </div>
      <h3 className="ticket-card-title">{ticket.title}</h3>
      <p className="ticket-card-copy">{ticket.description}</p>
      <div className="ticket-card-meta">
        <TicketPriorityBadge priority={ticket.priority} />
        <SlaBadge breached={ticket.slaBreached} />
        <span className="ticket-badge" title="Elapsed time">
          {formatMinutes(ticket.elapsedMinutes)}
        </span>
      </div>
      <div className="ticket-card-footer">
        <span className="ticket-assignee" title={ticket.assigneeName ?? 'Unassigned'}>
          {ticket.assigneeName ? `Tech: ${ticket.assigneeName}` : 'Unassigned'}
        </span>
        <Link to={`/tickets/${ticket.id}`} className="btn-outline ticket-open-link">
          Open
        </Link>
      </div>
    </article>
  );
}
