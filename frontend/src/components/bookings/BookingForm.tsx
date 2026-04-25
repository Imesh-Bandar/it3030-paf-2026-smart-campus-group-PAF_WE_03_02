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
      className="dashboard-section booking-form-shell"
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
          <p className="muted">
            Choose a resource and time window. Conflicts are checked before submission.
          </p>
        </div>
      </div>

      <div className="booking-form-grid">
        <label>
          Resource
          <select
            required
            value={form.resourceId}
            onChange={(event) => {
              setFormError(null);
              setForm((prev) => ({ ...prev, resourceId: event.target.value }));
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
        <label>
          Booking Date
          <input
            required
            type="date"
            min={todayDate}
            value={form.bookingDate}
            onChange={(event) => {
              setFormError(null);
              setForm((prev) => ({ ...prev, bookingDate: event.target.value }));
            }}
          />
        </label>
        <div className="booking-form-time-grid">
          <label>
            Start Time
            <input
              required
              type="time"
              value={form.startTime}
              onChange={(event) => {
                setFormError(null);
                setForm((prev) => ({ ...prev, startTime: event.target.value }));
              }}
            />
          </label>
          <label>
            End Time
            <input
              required
              type="time"
              value={form.endTime}
              onChange={(event) => {
                setFormError(null);
                setForm((prev) => ({ ...prev, endTime: event.target.value }));
              }}
            />
          </label>
        </div>
        <label>
          Purpose
          <textarea
            required
            value={form.purpose}
            onChange={(event) => {
              setFormError(null);
              setForm((prev) => ({ ...prev, purpose: event.target.value }));
            }}
            placeholder="Class, event, meeting, or other use"
            rows={3}
          />
        </label>
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
