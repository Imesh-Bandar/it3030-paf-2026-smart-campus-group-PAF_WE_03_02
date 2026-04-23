import { useState } from 'react';
import type { AvailabilityWindow, Facility, FacilityRequestPayload } from '../../services/types/facility';

type ResourceFormProps = {
  initialValue?: Facility | null;
  loading?: boolean;
  submitLabel: string;
  onSubmit: (payload: FacilityRequestPayload) => Promise<void> | void;
};

const defaultWindows: AvailabilityWindow[] = [
  { dayOfWeek: 1, startTime: '08:00', endTime: '17:00' },
  { dayOfWeek: 2, startTime: '08:00', endTime: '17:00' },
  { dayOfWeek: 3, startTime: '08:00', endTime: '17:00' },
  { dayOfWeek: 4, startTime: '08:00', endTime: '17:00' },
  { dayOfWeek: 5, startTime: '08:00', endTime: '17:00' },
];

function toInitialValue(initialValue?: Facility | null): FacilityRequestPayload {
  return {
    resourceCode: initialValue?.resourceCode ?? '',
    name: initialValue?.name ?? '',
    type: initialValue?.type ?? 'LECTURE_HALL',
    status: initialValue?.status ?? 'ACTIVE',
    location: initialValue?.location ?? '',
    capacity: initialValue?.capacity ?? 1,
    description: initialValue?.description ?? '',
    thumbnailUrl: initialValue?.thumbnailUrl ?? '',
    amenities: initialValue?.amenities ?? [],
    specifications: initialValue?.specifications ?? {},
    availabilityWindows:
      initialValue?.availabilityWindows?.map((window) => ({
        dayOfWeek: window.dayOfWeek,
        startTime: window.startTime,
        endTime: window.endTime,
      })) ?? defaultWindows,
  };
}

export function ResourceForm({
  initialValue,
  loading = false,
  submitLabel,
  onSubmit,
}: ResourceFormProps) {
  const [form, setForm] = useState<FacilityRequestPayload>(() => toInitialValue(initialValue));
  const [amenitiesText, setAmenitiesText] = useState((initialValue?.amenities ?? []).join(', '));
  const [specificationsText, setSpecificationsText] = useState(
    Object.entries(initialValue?.specifications ?? {})
      .map(([key, value]) => `${key}:${value}`)
      .join('\n'),
  );

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <form
      className="dashboard-section facility-form-shell"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit({
          ...form,
          amenities: amenitiesText
            .split(',')
            .map((entry) => entry.trim())
            .filter(Boolean),
          specifications: Object.fromEntries(
            specificationsText
              .split('\n')
              .map((entry) => entry.trim())
              .filter(Boolean)
              .map((entry) => {
                const [key, ...rest] = entry.split(':');
                return [key.trim(), rest.join(':').trim()];
              })
              .filter(([key, value]) => key && value),
          ),
        });
      }}
    >
      <div className="section-header booking-header-compact">
        <div>
          <p className="section-eyebrow">Admin Editor</p>
          <h2 className="booking-tight-title">{submitLabel}</h2>
        </div>
      </div>

      <div className="facility-form-grid">
        <label>
          Resource Code
          <input
            required
            value={form.resourceCode}
            onChange={(event) => setForm((prev) => ({ ...prev, resourceCode: event.target.value }))}
          />
        </label>
        <label>
          Resource Name
          <input
            required
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
        </label>
        <label>
          Type
          <select
            value={form.type}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, type: event.target.value as Facility['type'] }))
            }
          >
            <option value="LECTURE_HALL">Lecture Hall</option>
            <option value="LAB">Lab</option>
            <option value="MEETING_ROOM">Meeting Room</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>
        </label>
        <label>
          Status
          <select
            value={form.status}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, status: event.target.value as Facility['status'] }))
            }
          >
            <option value="ACTIVE">Active</option>
            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
            <option value="OUT_OF_SERVICE">Out of Service</option>
          </select>
        </label>
        <label>
          Capacity
          <input
            required
            min={1}
            type="number"
            value={form.capacity}
            onChange={(event) => setForm((prev) => ({ ...prev, capacity: Number(event.target.value) }))}
          />
        </label>
        <label>
          Location
          <input
            required
            value={form.location}
            onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
          />
        </label>
        <label>
          Thumbnail URL
          <input
            value={form.thumbnailUrl}
            onChange={(event) => setForm((prev) => ({ ...prev, thumbnailUrl: event.target.value }))}
          />
        </label>
        <label className="facility-form-wide">
          Description
          <textarea
            rows={3}
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />
        </label>
        <label className="facility-form-wide">
          Amenities
          <input
            value={amenitiesText}
            onChange={(event) => setAmenitiesText(event.target.value)}
            placeholder="WiFi, Projector, Air Conditioning"
          />
        </label>
        <label className="facility-form-wide">
          Specifications
          <textarea
            rows={4}
            value={specificationsText}
            onChange={(event) => setSpecificationsText(event.target.value)}
            placeholder="hardware:40 PCs&#10;network:1 Gbps LAN"
          />
        </label>
      </div>

      <div className="facility-window-grid">
        {form.availabilityWindows.map((window, index) => (
          <div key={`${window.dayOfWeek}-${index}`} className="facility-window-row">
            <span>{weekdays[window.dayOfWeek]}</span>
            <input
              type="time"
              value={window.startTime}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  availabilityWindows: prev.availabilityWindows.map((entry, entryIndex) =>
                    entryIndex === index ? { ...entry, startTime: event.target.value } : entry,
                  ),
                }))
              }
            />
            <input
              type="time"
              value={window.endTime}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  availabilityWindows: prev.availabilityWindows.map((entry, entryIndex) =>
                    entryIndex === index ? { ...entry, endTime: event.target.value } : entry,
                  ),
                }))
              }
            />
          </div>
        ))}
      </div>

      <div className="booking-form-submit-wrap">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
