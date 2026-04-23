import { useEffect, useState } from 'react';
import { bookingApi } from '../../services/api/bookingApi';
import { facilityApi } from '../../services/api/facilityApi';
import type { Booking, BookingConflictPreview, BookingRequestPayload } from '../../services/types/booking';
import type { ResourceOption } from '../../services/types/facility';

type BookingFormProps = {
  loading?: boolean;
  onSubmit: (payload: BookingRequestPayload) => Promise<void> | void;
};

export function BookingForm({ loading = false, onSubmit }: BookingFormProps) {
  const [form, setForm] = useState<BookingRequestPayload>({
    resourceId: '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
  });
  const [resources, setResources] = useState<ResourceOption[]>([]);
  const [preview, setPreview] = useState<BookingConflictPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [dayBookings, setDayBookings] = useState<Booking[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);

  useEffect(() => {
    facilityApi
      .getAll()
      .then(setResources)
      .catch(() => setResources([]));
  }, []);

  useEffect(() => {
    const hasRequiredFields = form.resourceId && form.bookingDate && form.startTime && form.endTime;
    if (!hasRequiredFields) {
      setPreview(null);
      return;
    }

    const timeout = setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const conflictPreview = await bookingApi.previewConflict(form);
        setPreview(conflictPreview);
      } catch {
        setPreview(null);
      } finally {
        setPreviewLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [form]);

  useEffect(() => {
    if (!form.resourceId || !form.bookingDate) {
      setDayBookings([]);
      return;
    }

    let active = true;
    setCalendarLoading(true);
    bookingApi
      .getResourceBookings(form.resourceId, form.bookingDate)
      .then((bookings) => {
        if (active) {
          setDayBookings(bookings);
        }
      })
      .catch(() => {
        if (active) {
          setDayBookings([]);
        }
      })
      .finally(() => {
        if (active) {
          setCalendarLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [form.bookingDate, form.resourceId]);

  const submitLabel = preview?.conflictDetected ? 'Submit & Join Waitlist' : 'Submit Booking';

  return (
    <form
      className="dashboard-section"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit(form);
        setForm((prev) => ({ ...prev, purpose: '', startTime: '', endTime: '' }));
      }}
    >
      <div className="section-header booking-form-header-gap">
        <div>
          <p className="section-eyebrow">New Request</p>
          <h2 className="booking-tight-title">Create Booking</h2>
        </div>
      </div>

      <div className="booking-form-grid">
        <label>
          Resource
          <select
            required
            value={form.resourceId}
            onChange={(event) => setForm((prev) => ({ ...prev, resourceId: event.target.value }))}
          >
            <option value="">Select a resource</option>
            {resources.map((resource) => (
              <option key={resource.id} value={resource.id}>
                {resource.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Booking Date
          <input
            required
            type="date"
            value={form.bookingDate}
            onChange={(event) => setForm((prev) => ({ ...prev, bookingDate: event.target.value }))}
          />
        </label>
        <div className="booking-form-time-grid">
          <label>
            Start Time
            <input
              required
              type="time"
              value={form.startTime}
              onChange={(event) => setForm((prev) => ({ ...prev, startTime: event.target.value }))}
            />
          </label>
          <label>
            End Time
            <input
              required
              type="time"
              value={form.endTime}
              onChange={(event) => setForm((prev) => ({ ...prev, endTime: event.target.value }))}
            />
          </label>
        </div>
        <label>
          Purpose
          <textarea
            required
            value={form.purpose}
            onChange={(event) => setForm((prev) => ({ ...prev, purpose: event.target.value }))}
            placeholder="Class, event, meeting, or other use"
            rows={3}
          />
        </label>
      </div>

      <div className="booking-form-submit-wrap">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : submitLabel}
        </button>
      </div>

      {previewLoading ? (
        <p className="booking-preview-message">Checking slot availability...</p>
      ) : null}
      {preview && !previewLoading ? (
        <div
          className={`booking-preview-card ${preview.conflictDetected ? 'is-conflict' : 'is-free'}`}
        >
          <p className="booking-preview-message">{preview.message}</p>
          {preview.conflictDetected && preview.alternatives.length > 0 ? (
            <ul className="booking-alternative-list">
              {preview.alternatives.map((slot) => (
                <li key={`${slot.startTime}-${slot.endTime}`}>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                      }))
                    }
                  >
                    {slot.startTime} - {slot.endTime}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {form.resourceId && form.bookingDate ? (
        <div className="booking-preview-card">
          <p className="booking-preview-message">Existing bookings for {form.bookingDate}</p>
          {calendarLoading ? <p className="booking-calendar-item">Loading schedule...</p> : null}
          {!calendarLoading && dayBookings.length === 0 ? (
            <p className="booking-calendar-item">No bookings recorded for this resource yet.</p>
          ) : null}
          {!calendarLoading && dayBookings.length > 0 ? (
            <ul className="booking-calendar-list">
              {dayBookings.map((booking) => (
                <li key={booking.id} className="booking-calendar-item">
                  <strong>
                    {booking.startTime} - {booking.endTime}
                  </strong>{' '}
                  <span>{booking.status}</span>{' '}
                  <span>{booking.purpose}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
