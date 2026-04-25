import type { Ticket, TicketStatus } from '../../services/types/ticket';
import { TicketCard } from './TicketCard';

const columns: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];

const columnLabels: Record<TicketStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REJECTED: 'Rejected',
};

export function TicketBoard({ tickets }: { tickets: Ticket[] }) {
  const total = tickets.length;

  return (
    <section className="ticket-board">
      <div className="ticket-board-summary" aria-label="Ticket queue summary">
        <div>
          <span>Total tickets</span>
          <strong>{total}</strong>
        </div>
        <p>
          Cards are grouped by workflow state so students, staff, and technicians can scan the queue
          quickly.
        </p>
      </div>

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
                <div className="ticket-empty-column">No tickets in this state yet.</div>
              )}
            </div>
          </section>
        );
      })}
    </section>
  );
}
