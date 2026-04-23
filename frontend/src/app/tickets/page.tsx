import { useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { TicketBoard } from '../../components/tickets/TicketBoard';
import { TicketForm } from '../../components/tickets/TicketForm';
import { useRole } from '../../hooks/useRole';
import { useTickets } from '../../hooks/useTickets';
import { ticketApi } from '../../services/api/ticketApi';

export function TicketsPage() {
  const { isAdmin } = useRole();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: tickets = [], isLoading } = useTickets();

  return (
    <main className="page-shell animate-fade-up" id="tickets-page">
      <div className="section-header">
        <div>
          <p className="section-eyebrow">Support & Maintenance</p>
          <h1>Tickets</h1>
        </div>
        {isAdmin() && <Link className="btn-primary" to="/admin/tickets">Admin board</Link>}
      </div>

      <section className="ticket-layout">
        <div className="ticket-create-panel">
          <div className="section-header compact">
            <h2>Report an Issue</h2>
          </div>
          <TicketForm
            onSubmit={async (payload) => {
              const ticket = await ticketApi.create(payload);
              toast.success('Ticket submitted');
              await queryClient.invalidateQueries({ queryKey: ['tickets'] });
              navigate(`/tickets/${ticket.id}`);
            }}
          />
        </div>

        <div className="ticket-list-panel">
          <div className="section-header compact">
            <h2>My Ticket Queue</h2>
          </div>
          {isLoading ? <p className="muted">Loading tickets...</p> : <TicketBoard tickets={tickets} />}
        </div>
      </section>
    </main>
  );
}
