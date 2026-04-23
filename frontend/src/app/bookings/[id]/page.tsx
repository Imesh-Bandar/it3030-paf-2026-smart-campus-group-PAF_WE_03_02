import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { bookingApi } from '../../../services/api/bookingApi';
import { useRole } from '../../../hooks/useRole';
import type { Booking } from '../../../services/types/booking';

export function BookingDetailsPage() {
  const { id } = useParams();
  const { isAdmin, isStaff } = useRole();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await bookingApi.getById(id);
        setBooking(data);
      } catch {
        toast.error('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  const canVerify = isAdmin() || isStaff();

  const handleCheckIn = async () => {
    if (!id || !token) {
      toast.error('Enter QR token to verify');
      return;
    }
    try {
      const updated = await bookingApi.checkIn(id, { qrToken: token });
      setBooking(updated);
      toast.success('Check-in verified');
    } catch {
      toast.error('Check-in failed');
    }
  };

  return (
    <main className="page-shell" id="booking-details-page">
      <h1>Booking Details</h1>
      <p className="muted">Booking id: {id}</p>

      {loading ? <p>Loading...</p> : null}
      {!loading && !booking ? <p>Booking not found.</p> : null}

      {booking ? (
        <section className="dashboard-section booking-section-gap">
          <h2>{booking.resourceName}</h2>
          <p>Status: {booking.status}</p>
          <p>
            Slot: {booking.bookingDate} {booking.startTime} - {booking.endTime}
          </p>
          <p>Purpose: {booking.purpose}</p>
          {booking.waitlisted && booking.waitlistPosition ? (
            <p>Waitlisted at position #{booking.waitlistPosition}</p>
          ) : null}
          {booking.qrToken ? (
            <div className="booking-qr-panel">
              <p className="booking-qr-label">QR check-in token</p>
              <code className="booking-qr-token">{booking.qrToken}</code>
            </div>
          ) : null}
          {booking.rejectedReason ? <p>Reason: {booking.rejectedReason}</p> : null}

          {canVerify && booking.status === 'APPROVED' ? (
            <div className="booking-checkin-grid booking-checkin-grid-sm">
              <label htmlFor="check-in-token">Verify check-in token</label>
              <input
                id="check-in-token"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Paste QR token"
              />
              <button type="button" className="btn-primary" onClick={() => void handleCheckIn()}>
                Verify Check-in
              </button>
            </div>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
