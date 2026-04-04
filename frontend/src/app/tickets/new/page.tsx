import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { TicketForm } from '../../../components/tickets/TicketForm';

export function NewTicketPage() {
  const navigate = useNavigate();

  return (
    <main className="page-shell ticket-page animate-fade-up" id="new-ticket-page">
      <div className="section-header">
        <div>
          <p className="section-eyebrow">Support & Maintenance</p>
          <h1>Report a Ticket</h1>
          <p className="section-subtitle">
            Submit an incident report with the affected resource, severity, and category.
          </p>
        </div>
      </div>

      <div className="ticket-panel ticket-panel-hero">
        <TicketForm
          onCreated={(ticket) => {
            toast.success(`Ticket ${ticket.ticketNumber} created`);
            navigate(`/tickets/${ticket.id}`);
          }}
        />
      </div>
    </main>
  );
}
