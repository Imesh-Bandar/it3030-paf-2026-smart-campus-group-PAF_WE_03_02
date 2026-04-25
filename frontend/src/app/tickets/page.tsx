import { useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { TicketBoard } from '../../components/tickets/TicketBoard';
import { TicketForm } from '../../components/tickets/TicketForm';
import { useRole } from '../../hooks/useRole';
import { useTickets } from '../../hooks/useTickets';
import { ticketApi } from '../../services/api/ticketApi';
import { getApiErrorMessage } from '../../components/tickets/ticketUi';

export function TicketsPage() {
  const { isAdmin } = useRole();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: tickets = [], isLoading, isError, error } = useTickets();

  const loadingCards = ['a', 'b', 'c'];

  return (
    <main className="page-shell animate-fade-up" id="tickets-page">
      <div className="section-header">
        <div>
          <p className="section-eyebrow">Support & Maintenance</p>
          <h1>Tickets</h1>
          <p className="section-summary">
            Submit an incident, then track progress across the support workflow in one place.
          </p>
        </div>
        {isAdmin() && (
          <Link className="btn-primary" to="/admin/tickets">
            Admin board
          </Link>
        )}
      </div>

      <section className="ticket-layout ticket-layout-enhanced">
        <div className="ticket-create-panel ticket-panel-enter">
          <div className="mb-4">
            <h2>Report an Issue</h2>
            <p className="muted">
              Keep the title short and include location details so the right team can respond
              faster.
            </p>
          </div>
          <TicketForm
            onSubmit={async (payload) => {
              try {
                const ticket = await ticketApi.create(payload);
                toast.success('Ticket submitted');
                await queryClient.invalidateQueries({ queryKey: ['tickets'] });
                navigate(`/tickets/${ticket.id}`);
              } catch (submitError) {
                toast.error(getApiErrorMessage(submitError, 'Could not submit ticket'));
                throw submitError;
              }
            }}
          />
        </div>

        <div className="ticket-list-panel">
          <div className="section-header compact">
            <h2>My Ticket Queue</h2>
            <p className="muted">Your latest requests and updates appear here in status order.</p>
          </div>
          {isError && (
            <div className="ticket-error-banner mb-4">
              {getApiErrorMessage(error, 'Could not load tickets.')}
            </div>
          )}
          {isLoading ? (
            <div className="ticket-loading-grid" aria-label="Loading tickets">
              {loadingCards.map((_, index) => (
                <div className="ticket-loading-card" key={index} />
              ))}
            </div>
          ) : (
            <TicketBoard tickets={tickets} />
          )}
        </div>
      </section>
    </main>
  );
}
