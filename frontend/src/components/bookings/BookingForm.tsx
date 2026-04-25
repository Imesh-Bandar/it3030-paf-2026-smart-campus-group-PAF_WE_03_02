import { useEffect, useState } from 'react';
import { bookingApi } from '../../services/api/bookingApi';
import { facilityApi } from '../../services/api/facilityApi';
import type {
  Booking,
  BookingConflictPreview,
  BookingRequestPayload,
} from '../../services/types/booking';
import type { AvailabilitySlot, Facility } from '../../services/types/facility';

type BookingFormProps = {
  loading?: boolean;
  onSubmit: (payload: BookingRequestPayload) => Promise<void> | void;
};

function getTodayDateInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function BookingForm({ loading = false, onSubmit }: BookingFormProps) {
  const [form, setForm] = useState<BookingRequestPayload>({
    resourceId: '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
  });
  const [resources, setResources] = useState<Facility[]>([]);
  const [preview, setPreview] = useState<BookingConflictPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [dayBookings, setDayBookings] = useState<Booking[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    facilityApi
      .getAll()
      .then(setResources)
      .catch(() => setResources([]));
  }, []);

  const selectedResource = resources.find((resource) => resource.id === form.resourceId);
  const selectedDateDay =
    form.bookingDate.length > 0 ? new Date(`${form.bookingDate}T00:00:00`).getDay() : null;
  const selectedDayWindows =
    selectedResource && selectedDateDay !== null
      ? selectedResource.availabilityWindows.filter(
          (window) => window.dayOfWeek === selectedDateDay,
        )
      : [];
  const normalizedStartTime = form.startTime.slice(0, 5);
  const normalizedEndTime = form.endTime.slice(0, 5);
  const todayDate = getTodayDateInputValue();
  const dateError =
    form.bookingDate && form.bookingDate < todayDate
      ? 'Booking date must be today or a future date.'
      : null;
  const availabilityError =
    selectedResource &&
    form.bookingDate &&
    form.startTime &&
    form.endTime &&
    selectedDayWindows.length === 0
      ? 'This resource has no availability window for the selected date.'
      : selectedResource &&
          form.bookingDate &&
          form.startTime &&
          form.endTime &&
          !selectedDayWindows.some(
            (window) =>
              normalizedStartTime >= window.startTime.slice(0, 5) &&
              normalizedEndTime <= window.endTime.slice(0, 5),
          )
        ? 'Selected slot is outside the configured availability window.'
        : selectedResource &&
            form.bookingDate &&
            form.startTime &&
            form.endTime &&
            availabilitySlots.some(
              (slot) =>
                normalizedStartTime < slot.endTime.slice(0, 5) &&
                normalizedEndTime > slot.startTime.slice(0, 5) &&
                (slot.status === 'BLOCKED' || slot.status === 'UNAVAILABLE'),
            )
          ? 'Selected slot is blocked by maintenance or unavailable time.'
          : null;

  useEffect(() => {
    const hasRequiredFields =
      form.resourceId && form.bookingDate && form.startTime && form.endTime && form.purpose.trim();
    if (!hasRequiredFields) {
      setPreview(null);
      return;
    }
    if (form.endTime <= form.startTime) {
      setPreview(null);
      return;
    }
    if (dateError) {
      setPreview(null);
      return;
    }
    if (availabilityError) {
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
  }, [availabilityError, dateError, form]);

  useEffect(() => {
    if (!form.resourceId || !form.bookingDate) {
      setDayBookings([]);
      setAvailabilitySlots([]);
      return;
    }

    let active = true;
    setCalendarLoading(true);
    Promise.all([
      bookingApi.getResourceBookings(form.resourceId, form.bookingDate),
      facilityApi.getAvailability(form.resourceId, form.bookingDate, form.bookingDate),
    ])
      .then(([bookings, availability]) => {
        if (active) {
          setDayBookings(bookings);
          setAvailabilitySlots(availability.availability[0]?.slots ?? []);
        }
      })
      .catch(() => {
        if (active) {
          setDayBookings([]);
          setAvailabilitySlots([]);
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
        if (form.endTime <= form.startTime) {
          setFormError('End time must be after start time.');
          return;
        }
        if (dateError) {
          setFormError(dateError);
          return;
        }
        if (availabilityError) {
          setFormError(availabilityError);
          return;
        }
        if (!form.purpose.trim()) {
          setFormError('Purpose is required.');
          return;
        }
        setFormError(null);
        await onSubmit({ ...form, purpose: form.purpose.trim() });
        setForm((prev) => ({ ...prev, purpose: '', startTime: '', endTime: '' }));
      }}
    >
      <div className="section-header booking-form-header-gap">
        <div>
          <p className="section-eyebrow">New Request</p>
          <h2 className="booking-tight-title">Create Booking</h2>
        </div>
      </div>

      <div
        style={{
          background: 'var(--bg-card)',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            background: 'var(--grad-brand)',
          }}
        />
        <div className="booking-form-grid">
          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                ></path>
              </svg>
              Resource
            </span>
            <select
              required
              value={form.resourceId}
              onChange={(event) => {
                setFormError(null);
                setForm((prev) => ({ ...prev, resourceId: event.target.value }));
              }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--input-bg)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="">Select a resource</option>
              {resources.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.name}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
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
              Booking Date
            </span>
            <input
              required
              type="date"
              min={todayDate}
              value={form.bookingDate}
              onChange={(event) => {
                setFormError(null);
                setForm((prev) => ({ ...prev, bookingDate: event.target.value }));
              }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--input-bg)',
                color: 'var(--text-primary)',
              }}
            />
          </label>
          <div className="booking-form-time-grid">
            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}
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
                Start Time
              </span>
              <input
                required
                type="time"
                value={form.startTime}
                onChange={(event) => {
                  setFormError(null);
                  setForm((prev) => ({ ...prev, startTime: event.target.value }));
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}
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
                End Time
              </span>
              <input
                required
                type="time"
                value={form.endTime}
                onChange={(event) => {
                  setFormError(null);
                  setForm((prev) => ({ ...prev, endTime: event.target.value }));
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                }}
              />
            </label>
          </div>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                ></path>
              </svg>
              Purpose
            </span>
            <textarea
              required
              value={form.purpose}
              onChange={(event) => {
                setFormError(null);
                setForm((prev) => ({ ...prev, purpose: event.target.value }));
              }}
              placeholder="Class, event, meeting, or other use"
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--input-bg)',
                color: 'var(--text-primary)',
                resize: 'vertical',
              }}
            />
          </label>
        </div>
      </div>

      {form.startTime && form.endTime && form.endTime <= form.startTime ? (
        <p className="booking-form-error">End time must be after start time.</p>
      ) : null}
      {dateError ? <p className="booking-form-error">{dateError}</p> : null}
      {availabilityError ? <p className="booking-form-error">{availabilityError}</p> : null}
      {formError ? <p className="booking-form-error">{formError}</p> : null}
      {selectedResource && form.bookingDate ? (
        <div className="booking-window-list">
          <span>Available windows</span>
          {selectedDayWindows.length > 0 ? (
            selectedDayWindows.map((window) => (
              <strong key={`${window.dayOfWeek}-${window.startTime}-${window.endTime}`}>
                {window.startTime.slice(0, 5)} - {window.endTime.slice(0, 5)}
              </strong>
            ))
          ) : (
            <strong>Closed for this day</strong>
          )}
        </div>
      ) : null}

      <div className="booking-form-submit-wrap">
        <button
          type="submit"
          className="btn-primary"
          disabled={
            loading ||
            Boolean(dateError) ||
            Boolean(form.startTime && form.endTime && form.endTime <= form.startTime) ||
            Boolean(availabilityError)
          }
          onClick={() => {
            if (!form.purpose.trim()) {
              setFormError('Purpose is required.');
            }
          }}
        >
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
                  <span>{booking.status}</span> <span>{booking.purpose}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
