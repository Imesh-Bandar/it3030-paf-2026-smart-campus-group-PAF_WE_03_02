import { useParams } from 'react-router-dom';

export function BookingDetailsPage() {
  const { id } = useParams();

  return (
    <main className="page-shell">
      <h1>Booking Details</h1>
      <p className="muted">Booking id: {id}</p>
    </main>
  );
}
