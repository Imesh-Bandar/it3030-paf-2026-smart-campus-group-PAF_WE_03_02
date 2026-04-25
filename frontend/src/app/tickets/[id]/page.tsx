import { useParams } from 'react-router-dom';

export function TicketDetailsPage() {
  const { id } = useParams();

  return (
    <main className="page-shell">
      <h1>Ticket Details</h1>
      <p className="muted">Ticket id: {id}</p>
    </main>
  );
}
