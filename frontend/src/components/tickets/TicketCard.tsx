import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { TicketSummary } from '../../services/types/ticket';

type TicketCardProps = {
  ticket: TicketSummary;
  to?: string;
  compact?: boolean;
  actions?: ReactNode;
};

function statusClass(status: TicketSummary['status']) {
  switch (status) {
    case 'OPEN':
      return 'ticket-chip open';
    case 'IN_PROGRESS':
      return 'ticket-chip progress';
    case 'RESOLVED':
      return 'ticket-chip resolved';
    default:
      return 'ticket-chip';
  }
}

function severityClass(severity: TicketSummary['severity']) {
  switch (severity) {
    case 'LOW':
      return 'ticket-chip low';
    case 'MEDIUM':
      return 'ticket-chip medium';
    case 'HIGH':
      return 'ticket-chip high';
    case 'CRITICAL':
      return 'ticket-chip critical';
    default:
      return 'ticket-chip';
  }
}

export function TicketCard({ ticket, to, compact, actions }: TicketCardProps) {
  return (
    <article className={`ticket-card${compact ? ' compact' : ''}`}>
      <div className="ticket-card-head">
        <div>
          <p className="ticket-number">{ticket.ticketNumber}</p>
          <h3>{ticket.title}</h3>
        </div>
        <div className={statusClass(ticket.status)}>{ticket.status.replace('_', ' ')}</div>
      </div>

      <p className="ticket-description">{ticket.description}</p>

      <div className="ticket-card-meta">
        <span>{ticket.resourceName}</span>
        <span>{ticket.category}</span>
        <span className={severityClass(ticket.severity)}>{ticket.severity}</span>
      </div>

      <div className="ticket-card-footer">
        <div>
          <span className="meta-label">Reporter</span>
          <strong>{ticket.reporterName}</strong>
        </div>
        <div>
          <span className="meta-label">Updated</span>
          <strong>{formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}</strong>
        </div>
      </div>

      <div className="ticket-card-stats">
        <span>{ticket.commentCount} comments</span>
        <span>{ticket.evidenceCount} evidence items</span>
        {ticket.assignedToName && <span>Assigned to {ticket.assignedToName}</span>}
      </div>

      <div className="ticket-card-actions">
        {to && (
          <Link to={to} className="btn-ghost ticket-card-link-action">
            View details
          </Link>
        )}
        {actions}
      </div>
    </article>
  );
}
