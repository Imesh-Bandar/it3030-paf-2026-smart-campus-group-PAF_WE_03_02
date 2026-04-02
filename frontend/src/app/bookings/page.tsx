import { useRole } from '../../hooks/useRole';

export function BookingsPage() {
  const { isAdmin } = useRole();

  return (
    <main className="page-shell">
      <h1>Bookings</h1>
      <p className="muted">Booking screens start in Phase 3.</p>
      {isAdmin() && <button type="button">Approve Booking</button>}
    </main>
  );
}
