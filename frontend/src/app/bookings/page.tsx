import { useState } from 'react';
import toast from 'react-hot-toast';
import { useBookings } from '../../hooks/useBookings';
import { BookingCard } from '../../components/bookings/BookingCard';
import { BookingForm } from '../../components/bookings/BookingForm';
import { bookingApi } from '../../services/api/bookingApi';
import type { Booking, BookingFilterStatus } from '../../services/types/booking';
import { useRole } from '../../hooks/useRole';

function getApiErrorMessage(error: unknown, fallback: string) {
  const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
  return message || fallback;
}

export function BookingsPage() {
  const { isAdmin } = useRole();
  const { data, isLoading, refetch } = useBookings();
  const [creating, setCreating] = useState(false);
  const [activeStatus, setActiveStatus] = useState<BookingFilterStatus>('ALL');

  const handleCreate = async (payload: {
    resourceId: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    purpose: string;
  }) => {
    setCreating(true);
    try {
      const created = await bookingApi.create(payload);
      if (created.waitlisted) {
        toast.success(`Booking added to waitlist (position #${created.waitlistPosition ?? '-'})`);
      } else {
        toast.success('Booking request submitted');
      }
      await refetch();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, 'Failed to create booking. Check resource ID and time range.'),
      );
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    try {
      await bookingApi.cancel(bookingId, { reason: 'Cancelled by user' });
      toast.success('Booking cancelled');
      await refetch();
    } catch {
      toast.error('Failed to cancel booking');
    }
  };

  const bookings: Booking[] = data ?? [];
  const statusTabs: BookingFilterStatus[] = [
    'ALL',
    'PENDING',
    'APPROVED',
    'COMPLETED',
    'REJECTED',
    'CANCELLED',
  ];
  const filteredBookings =
    activeStatus === 'ALL'
      ? bookings
      : bookings.filter((booking) => booking.status === activeStatus);

  return (
    <main className="page-shell animate-fade-up" id="bookings-page">
      <div className="section-header" style={{ marginBottom: '32px' }}>
        <div>
          <p
            className="section-eyebrow"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              ></path>
            </svg>
            Reservations
          </p>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: '800',
              background: 'var(--grad-brand)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Bookings
          </h1>
        </div>
        {isAdmin() ? (
          <a
            href="/admin/bookings"
            className="btn-primary"
            style={{ boxShadow: '0 4px 14px rgba(26, 110, 245, 0.4)' }}
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              ></path>
            </svg>
            Approval Queue
          </a>
        ) : null}
      </div>

      <BookingForm loading={creating} onSubmit={handleCreate} />

      <section className="dashboard-section booking-section-gap">
        <div className="section-header booking-header-compact">
          <div>
            <p
              className="section-eyebrow"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              History
            </p>
            <h2 className="booking-tight-title">My Bookings</h2>
          </div>
          <button
            type="button"
            className="btn-outline"
            onClick={() => void refetch()}
            style={{ padding: '6px 12px', fontSize: '13px' }}
          >
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              ></path>
            </svg>
            Refresh
          </button>
        </div>

        <div className="booking-tab-row" role="tablist" aria-label="Booking status filters">
          {statusTabs.map((status) => (
            <button
              key={status}
              type="button"
              role="tab"
              aria-selected={activeStatus === status}
              className={`booking-tab-chip ${activeStatus === status ? 'is-active' : ''}`}
              onClick={() => setActiveStatus(status)}
            >
              {status === 'ALL'
                ? `All (${bookings.length})`
                : `${status} (${bookings.filter((booking) => booking.status === status).length})`}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <svg
              className="animate-spin"
              style={{ margin: '0 auto', marginBottom: '12px' }}
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              ></path>
            </svg>
            <p>Loading bookings...</p>
          </div>
        ) : null}

        {!isLoading && bookings.length === 0 ? (
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px dashed var(--border)',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <svg
              width="48"
              height="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              viewBox="0 0 24 24"
              style={{ margin: '0 auto 16px', opacity: 0.5 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              ></path>
            </svg>
            <p style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)' }}>
              No bookings yet.
            </p>
            <p>Submit your first request above to get started.</p>
          </div>
        ) : null}

        {!isLoading && bookings.length > 0 && filteredBookings.length === 0 ? (
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <p style={{ fontSize: '15px' }}>
              No bookings in the{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{activeStatus.toLowerCase()}</strong>{' '}
              state.
            </p>
          </div>
        ) : null}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {filteredBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} onCancel={handleCancel} />
          ))}
        </div>
      </section>
    </main>
  );
}
