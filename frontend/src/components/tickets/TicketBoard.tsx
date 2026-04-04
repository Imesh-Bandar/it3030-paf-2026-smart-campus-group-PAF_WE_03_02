import { TicketCard } from './TicketCard';
import type { TicketStatus, TicketSummary } from '../../services/types/ticket';

type TicketBoardProps = {
  tickets: TicketSummary[];
  onStatusChange?: (ticketId: string, status: TicketStatus) => void;
};

const columns: Array<{ status: TicketStatus; title: string; tone: string }> = [
  { status: 'OPEN', title: 'Open', tone: 'open' },
  { status: 'IN_PROGRESS', title: 'In Progress', tone: 'progress' },
  { status: 'RESOLVED', title: 'Resolved', tone: 'resolved' },
];

const nextStatusMap: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ['IN_PROGRESS', 'RESOLVED'],
  IN_PROGRESS: ['RESOLVED', 'OPEN'],
  RESOLVED: ['IN_PROGRESS'],
};

export function TicketBoard({ tickets, onStatusChange }: TicketBoardProps) {
  return (
    <div className="ticket-board">
      {columns.map((column) => {
        const items = tickets.filter((ticket) => ticket.status === column.status);

        return (
          <section key={column.status} className={`ticket-board-column ${column.tone}`}>
            <div className="ticket-board-header">
              <div>
                <h3>{column.title}</h3>
                <span>{items.length}</span>
              </div>
            </div>

            <div className="ticket-board-list">
              {items.length === 0 ? (
                <div className="ticket-empty-state small">No tickets in this column.</div>
              ) : (
                items.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    to={`/tickets/${ticket.id}`}
                    actions={
                      onStatusChange && (
                        <div className="ticket-inline-actions">
                          {nextStatusMap[ticket.status].map((nextStatus) => (
                            <button
                              key={nextStatus}
                              type="button"
                              className="btn-ghost"
                              onClick={() => onStatusChange(ticket.id, nextStatus)}
                            >
                              Move to {nextStatus.replace('_', ' ')}
                            </button>
                          ))}
                        </div>
                      )
                    }
                  />
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
