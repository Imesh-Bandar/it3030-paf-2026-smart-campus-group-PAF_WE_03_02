import type { Ticket, TicketStatus } from '../../services/types/ticket';
import { TicketCard } from './TicketCard';

const columns: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];

export function TicketBoard({ tickets }: { tickets: Ticket[] }) {
  return (
    <section className="ticket-board">
      {columns.map((status) => {
        const items = tickets.filter((ticket) => ticket.status === status);
        return (
          <div className="ticket-column" key={status}>
            <div className="ticket-column-header">
              <h2>{status.replace('_', ' ')}</h2>
              <span>{items.length}</span>
            </div>
            <div className="ticket-column-list">
              {items.map((ticket) => (
                <TicketCard ticket={ticket} key={ticket.id} />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
