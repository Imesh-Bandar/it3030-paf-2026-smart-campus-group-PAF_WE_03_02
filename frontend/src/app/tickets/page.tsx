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

  const loadingCards = Array.from({ length: 5 });

  return (
    <main className="page-shell animate-fade-up" id="tickets-page">
      <div className="section-header">
        <div>
          <p className="section-eyebrow">Support & Maintenance</p>
          <h1>Tickets</h1>
          <p className="ticket-panel-description">
            Report incidents quickly, track progress by status, and collaborate with support teams.
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
            <p className="ticket-panel-description">
              Fill in the required details and upload up to 3 images if needed.
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

        <div className="ticket-list-panel ticket-panel-enter ticket-panel-enter-delay">
          <div className="ticket-toolbar">
            <div>
              <h2>My Ticket Queue</h2>
              <p className="ticket-panel-description">Current tickets grouped by workflow stage.</p>
            </div>
            <span className="ticket-total-pill" aria-live="polite">
              {tickets.length} total
            </span>
          </div>
          {isLoading && (
            <div className="ticket-loading-grid">
              {loadingCards.map((_, index) => (
                <div key={index} className="ticket-loading-card" />
              ))}
            </div>
          )}
          {isError && (
            <div className="ticket-error-banner">
              {getApiErrorMessage(error, 'Failed to load tickets.')}
            </div>
          )}
          {!isLoading && !isError && <TicketBoard tickets={tickets} />}
        </div>
      </section>
    </main>
  );
}
