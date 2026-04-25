import type { Ticket, TicketStatus } from '../../services/types/ticket';
import { TicketCard } from './TicketCard';
import { formatStatusLabel } from './ticketUi';

const columns: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];

const columnLabels: Record<TicketStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REJECTED: 'Rejected',
};

export function TicketBoard({ tickets }: { tickets: Ticket[] }) {
  return (
    <section className="ticket-board">
      {columns.map((status) => {
        const items = tickets.filter((ticket) => ticket.status === status);
        return (
          <section
            className="ticket-column"
            key={status}
            aria-labelledby={`ticket-column-${status.toLowerCase()}`}
          >
            <div className="ticket-column-header">
              <h2 id={`ticket-column-${status.toLowerCase()}`}>{columnLabels[status]}</h2>
              <span>{items.length}</span>
            </div>
            <div className="ticket-column-list">
              {items.length > 0 ? (
                items.map((ticket) => <TicketCard ticket={ticket} key={ticket.id} />)
              ) : (
                <div className="ticket-empty-column">No tickets in this state.</div>
              )}
            </div>
          </section>
        );
      })}
    </section>
  );
}
