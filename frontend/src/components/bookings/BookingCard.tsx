import { Link } from 'react-router-dom';
import type { Booking } from '../../services/types/booking';

type BookingCardProps = {
  booking: Booking;
  showOwner?: boolean;
  onApprove?: (bookingId: string) => Promise<void> | void;
  onReject?: (bookingId: string) => Promise<void> | void;
  onCancel?: (bookingId: string) => Promise<void> | void;
};

export function BookingCard({
  booking,
  showOwner = false,
  onApprove,
  onReject,
  onCancel,
}: BookingCardProps) {
  const schedule = `${booking.bookingDate} - ${booking.startTime} to ${booking.endTime}`;

  return (
    <article className="dashboard-info-card booking-card-gap">
      <div className="dashboard-info-card-body">
        <div className="notifications-toolbar booking-header-compact">
          <div>
            <h3 className="booking-tight-title">{booking.resourceName}</h3>
            <p>{schedule}</p>
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

        <p>{booking.purpose}</p>
        {showOwner && <p>Requester: {booking.bookerName}</p>}
        {booking.waitlisted && booking.waitlistPosition ? (
          <p>Waitlist position: #{booking.waitlistPosition}</p>
        ) : null}
        {booking.rejectedReason ? <p>Reason: {booking.rejectedReason}</p> : null}
        {booking.status === 'APPROVED' && booking.qrToken ? <p>QR code ready for check-in.</p> : null}

        <div className="booking-card-actions">
          <Link to={`/bookings/${booking.id}`} className="btn-ghost">
            View Details
          </Link>
          {onCancel && (booking.status === 'PENDING' || booking.status === 'APPROVED') ? (
            <button type="button" className="btn-ghost" onClick={() => void onCancel(booking.id)}>
              Cancel
            </button>
          ) : null}
          {onApprove && booking.status === 'PENDING' ? (
            <button
              type="button"
              className="btn-primary"
              onClick={() => void onApprove(booking.id)}
            >
              Approve
            </button>
          ) : null}
          {onReject && booking.status === 'PENDING' ? (
            <button type="button" className="btn-ghost" onClick={() => void onReject(booking.id)}>
              Reject
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
