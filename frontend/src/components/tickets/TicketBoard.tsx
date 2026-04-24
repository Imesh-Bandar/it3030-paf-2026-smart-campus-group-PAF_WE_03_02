import type { Ticket, TicketStatus } from '../../services/types/ticket';
import { TicketCard } from './TicketCard';
import { formatStatusLabel } from './ticketUi';

const columns: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];

export function TicketBoard({ tickets }: { tickets: Ticket[] }) {
  return (
    <section className="ticket-board">
      {columns.map((status) => {
        const items = tickets.filter((ticket) => ticket.status === status);
        return (
          <div className="ticket-column ticket-column-enter" key={status}>
            <div className="ticket-column-header">
              <h2>{formatStatusLabel(status)}</h2>
              <span className="ticket-badge" aria-label={`${items.length} tickets`}>
                {items.length}
              </span>
            </div>
            <div className="ticket-column-list">
              {items.length === 0 ? (
                <div className="ticket-empty-state">
                  <p>No tickets in this stage.</p>
                </div>
              ) : (
                items.map((ticket) => <TicketCard ticket={ticket} key={ticket.id} />)
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
