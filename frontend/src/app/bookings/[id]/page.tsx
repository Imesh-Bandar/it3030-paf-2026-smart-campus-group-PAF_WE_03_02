import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarDays, Clock3, ClipboardList } from 'lucide-react';
import { bookingApi } from '../../../services/api/bookingApi';
import { useRole } from '../../../hooks/useRole';
import { BookingQrCode } from '../../../components/bookings/BookingQrCode';
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
    const qrToken = token.trim();
    if (!id || !qrToken) {
      toast.error('Enter QR token to verify');
      return;
    }
    try {
      const updated = await bookingApi.checkIn(id, { qrToken });
      setBooking(updated);
      setToken('');
      toast.success('Check-in verified');
    } catch {
      toast.error('Check-in failed');
    }
  };

  return (
    <main className="page-shell animate-fade-up" id="booking-details-page">
      <header className="booking-details-hero">
        <div>
          <p className="section-eyebrow">Reservation Detail</p>
          <h1>Booking Details</h1>
          <p className="muted">Booking id: {id}</p>
        </div>
      </header>

      {loading ? <p className="booking-empty-state">Loading...</p> : null}
      {!loading && !booking ? <p className="booking-empty-state">Booking not found.</p> : null}

      {booking ? (
        <section className="dashboard-section booking-section-gap booking-details-panel">
          <div className="booking-details-header">
            <div>
              <p className="section-eyebrow">Resource</p>
              <h2>{booking.resourceName}</h2>
            </div>
            <span
              className={`status-badge ${
                booking.status === 'APPROVED' || booking.status === 'COMPLETED'
                  ? 'approved'
                  : booking.status === 'PENDING'
                    ? 'pending'
                    : 'rejected'
              }`}
            >
              {booking.status}
            </span>
          </div>

          <div className="booking-detail-facts">
            <span>
              <CalendarDays size={16} />
              {booking.bookingDate}
            </span>
            <span>
              <Clock3 size={16} />
              {booking.startTime} - {booking.endTime}
            </span>
            <span>
              <ClipboardList size={16} />
              {booking.purpose}
            </span>
          </div>
          {booking.waitlisted && booking.waitlistPosition ? (
            <p>Waitlisted at position #{booking.waitlistPosition}</p>
          ) : null}
          {booking.status === 'APPROVED' && booking.qrToken ? (
            <BookingQrCode
              token={booking.qrToken}
              bookingId={booking.id}
              resourceName={booking.resourceName}
            />
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
