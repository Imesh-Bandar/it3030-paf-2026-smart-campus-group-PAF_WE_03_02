import { useRole } from '../../hooks/useRole';

export function TicketsPage() {
  const { isAdmin } = useRole();

  return (
    <main className="page-shell">
      <h1>Tickets</h1>
      <p className="muted">Ticket workflows start in Phase 4.</p>
      {isAdmin() && <button type="button">Assign Technician</button>}
    </main>
  );
}
