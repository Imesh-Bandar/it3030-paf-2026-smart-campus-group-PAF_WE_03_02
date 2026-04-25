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
      <div className="section-header">
        <div>
          <p className="section-eyebrow">Reservations</p>
          <h1>Bookings</h1>
        </div>
        {isAdmin() ? (
          <a href="/admin/bookings" className="btn-primary">
            Open Approval Queue
          </a>
        ) : null}
      </div>

      <BookingForm loading={creating} onSubmit={handleCreate} />

      <section className="dashboard-section booking-section-gap">
        <div className="section-header booking-header-compact">
          <div>
            <p className="section-eyebrow">History</p>
            <h2 className="booking-tight-title">My Bookings</h2>
          </div>
          <button type="button" className="btn-ghost" onClick={() => void refetch()}>
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

        {isLoading ? <p>Loading bookings...</p> : null}
        {!isLoading && bookings.length === 0 ? (
          <p>No bookings yet. Submit your first request.</p>
        ) : null}
        {!isLoading && bookings.length > 0 && filteredBookings.length === 0 ? (
          <p>No bookings in the {activeStatus.toLowerCase()} state.</p>
        ) : null}
        {filteredBookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking} onCancel={handleCancel} />
        ))}
      </section>
    </main>
  );
}
