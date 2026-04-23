import type { FacilityAvailability } from '../../services/types/facility';

type AvailabilityCalendarProps = {
  availability: FacilityAvailability | null;
};

export function AvailabilityCalendar({ availability }: AvailabilityCalendarProps) {
  if (!availability) {
    return <p className="muted">Choose a date range to view availability.</p>;
  }

  return (
    <div className="facility-availability-list">
      {availability.availability.map((day) => (
        <article key={day.date} className="dashboard-info-card facility-day-card">
          <div className="dashboard-info-card-body">
            <div className="facility-card-top">
              <h3 className="facility-title">{day.date}</h3>
              <span>{day.slots.length} slots</span>
            </div>

            <div className="facility-slot-list">
              {day.slots.map((slot) => (
                <div key={`${day.date}-${slot.startTime}-${slot.endTime}`} className="facility-slot">
                  <div>
                    <strong>
                      {slot.startTime} - {slot.endTime}
                    </strong>
                    {slot.reason ? <p>{slot.reason}</p> : null}
                    {slot.bookedBy ? <p>Booked by {slot.bookedBy}</p> : null}
                  </div>
                  <span
                    className={`status-badge ${
                      slot.status === 'AVAILABLE'
                        ? 'approved'
                        : slot.status === 'BLOCKED'
                          ? 'pending'
                          : 'rejected'
                    }`}
                  >
                    {slot.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
