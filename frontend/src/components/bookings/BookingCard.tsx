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
  const dateObj = new Date(booking.bookingDate);
  const dateFormatted = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const timeFormatted = `${booking.startTime.slice(0, 5)} - ${booking.endTime.slice(0, 5)}`;

  return (
    <article className="booking-card-gap">
      <div style={{ padding: '24px' }}>
        <div className="booking-header-compact">
          <div>
            <h3 className="booking-tight-title">{booking.resourceName}</h3>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                marginTop: '8px',
                color: 'var(--text-secondary)',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
                {dateFormatted}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                {timeFormatted}
              </span>
            </div>
          </div>
          <span
            className={`status-badge ${
              booking.status === 'APPROVED' || booking.status === 'COMPLETED'
                ? 'approved'
                : booking.status === 'PENDING'
                  ? 'pending'
                  : 'rejected'
            }`}
            style={{ boxShadow: '0 0 12px rgba(0,0,0,0.1)' }}
          >
            {booking.status}
          </span>
        </div>

        <div
          style={{
            background: 'rgba(0,0,0,0.1)',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '1px solid var(--border)',
          }}
        >
          <p style={{ margin: 0, color: 'var(--text-primary)' }}>{booking.purpose}</p>
        </div>

        {showOwner && (
          <p
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: 'var(--text-secondary)',
            }}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              ></path>
            </svg>
            Requester:{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{booking.bookerName}</strong>
          </p>
        )}
        {booking.waitlisted && booking.waitlistPosition ? (
          <p style={{ color: '#fbbf24', fontSize: '14px', marginTop: '8px', fontWeight: '500' }}>
            Waitlist position: #{booking.waitlistPosition}
          </p>
        ) : null}
        {booking.rejectedReason ? (
          <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>
            Reason: {booking.rejectedReason}
          </p>
        ) : null}
        {booking.status === 'APPROVED' && booking.qrToken ? (
          <p
            style={{
              color: '#10b981',
              fontSize: '14px',
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            QR code ready for check-in.
          </p>
        ) : null}

        <div className="booking-card-actions">
          <Link to={`/bookings/${booking.id}`} className="btn-outline">
            View Details
          </Link>
          {onCancel && (booking.status === 'PENDING' || booking.status === 'APPROVED') ? (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => void onCancel(booking.id)}
              style={{ color: '#ef4444' }}
            >
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
