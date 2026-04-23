import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { BookingCard } from '../../../components/bookings/BookingCard';
import { bookingApi } from '../../../services/api/bookingApi';
import type { Booking } from '../../../services/types/booking';

export function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkInBookingId, setCheckInBookingId] = useState('');
  const [checkInToken, setCheckInToken] = useState('');

  const loadPending = async () => {
    setLoading(true);
    try {
      const data = await bookingApi.getPendingForAdmin();
      setBookings(data);
    } catch {
      toast.error('Failed to load pending bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPending();
  }, []);

  const approve = async (bookingId: string) => {
    try {
      await bookingApi.approve(bookingId);
      toast.success('Booking approved');
      await loadPending();
    } catch {
      toast.error('Failed to approve booking');
    }
  };

  const reject = async (bookingId: string) => {
    const reason =
      window.prompt('Reason for rejection', 'Rejected by admin') ?? 'Rejected by admin';
    try {
      await bookingApi.reject(bookingId, { reason });
      toast.success('Booking rejected');
      await loadPending();
    } catch {
      toast.error('Failed to reject booking');
    }
  };

  const checkIn = async () => {
    const bookingId = checkInBookingId.trim();
    const qrToken = checkInToken.trim();
    if (!bookingId || !qrToken) {
      toast.error('Booking ID and QR token are required');
      return;
    }
    try {
      await bookingApi.checkIn(bookingId, { qrToken });
      toast.success('Check-in verified');
      setCheckInBookingId('');
      setCheckInToken('');
      await loadPending();
    } catch {
      toast.error('Check-in failed. Verify booking ID and token.');
    }
  };

  return (
    <main className="page-shell" id="admin-bookings-page">
      <header className="page-header">
        <h1>Booking Approval Queue</h1>
        <p>Approve or reject requests, and validate QR check-ins for approved bookings.</p>
      </header>

      <section className="dashboard-section">
        <div className="notifications-toolbar booking-header-compact">
          <h2 className="booking-tight-title">Pending Requests</h2>
          <button type="button" className="btn-ghost" onClick={() => void loadPending()}>
            Refresh
          </button>
        </div>

        {loading ? <p>Loading...</p> : null}
        {!loading && bookings.length === 0 ? <p>No pending bookings right now.</p> : null}
        {bookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            showOwner
            onApprove={approve}
            onReject={reject}
          />
        ))}
      </section>

      <section className="dashboard-section booking-section-gap">
        <h2>QR Check-in Verification</h2>
        <p>Use booking ID and QR token from approved booking details.</p>
        <div className="booking-checkin-grid">
          <input
            value={checkInBookingId}
            onChange={(event) => setCheckInBookingId(event.target.value)}
            placeholder="Booking ID"
          />
          <input
            value={checkInToken}
            onChange={(event) => setCheckInToken(event.target.value)}
            placeholder="QR token"
          />
          <button type="button" className="btn-primary" onClick={() => void checkIn()}>
            Verify Check-in
          </button>
        </div>
      </section>
    </main>
  );
}
