import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { AvailabilityCalendar } from '../../../components/facilities/AvailabilityCalendar';
import { facilityApi } from '../../../services/api/facilityApi';
import { useRole } from '../../../hooks/useRole';
import type {
  Facility,
  FacilityAvailability,
  MaintenanceBlackout,
} from '../../../services/types/facility';

function plusDays(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function FacilityDetailsPage() {
  const { id } = useParams();
  const { isAdmin } = useRole();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [availability, setAvailability] = useState<FacilityAvailability | null>(null);
  const [blackouts, setBlackouts] = useState<MaintenanceBlackout[]>([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(plusDays(0));
  const [to, setTo] = useState(plusDays(6));
  const [blackoutStart, setBlackoutStart] = useState(`${plusDays(1)}T09:00`);
  const [blackoutEnd, setBlackoutEnd] = useState(`${plusDays(1)}T12:00`);
  const [blackoutReason, setBlackoutReason] = useState('Scheduled maintenance');

  useEffect(() => {
    if (!id) return;

    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [resource, availabilityResponse, blackoutResponse] = await Promise.all([
          facilityApi.getById(id),
          facilityApi.getAvailability(id, from, to),
          facilityApi.getBlackouts(id),
        ]);
        if (!active) return;
        setFacility(resource);
        setAvailability(availabilityResponse);
        setBlackouts(blackoutResponse);
      } catch {
        if (active) {
          toast.error('Failed to load facility details');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [id, from, to]);

  const createBlackout = async () => {
    if (!id) return;
    if (!blackoutStart || !blackoutEnd || !blackoutReason.trim()) {
      toast.error('Start, end, and reason are required');
      return;
    }
    if (new Date(blackoutEnd) <= new Date(blackoutStart)) {
      toast.error('Blackout end must be after the start');
      return;
    }
    try {
      await facilityApi.createBlackout(id, {
        startDate: new Date(blackoutStart).toISOString(),
        endDate: new Date(blackoutEnd).toISOString(),
        reason: blackoutReason.trim(),
      });
      toast.success('Maintenance blackout added');
      await refreshSchedule();
    } catch {
      toast.error('Failed to add maintenance blackout');
    }
  };

  const refreshSchedule = async () => {
    if (!id) return;
    const [availabilityResponse, blackoutResponse] = await Promise.all([
      facilityApi.getAvailability(id, from, to),
      facilityApi.getBlackouts(id),
    ]);
    setAvailability(availabilityResponse);
    setBlackouts(blackoutResponse);
  };

  const removeBlackout = async (blackoutId: string) => {
    if (!id) return;
    try {
      await facilityApi.removeBlackout(id, blackoutId);
      toast.success('Maintenance blackout removed');
      await refreshSchedule();
    } catch {
      toast.error('Failed to remove maintenance blackout');
    }
  };

  return (
    <main className="page-shell" id="facility-details-page">
      {loading ? <p>Loading facility details...</p> : null}
      {!loading && !facility ? <p>Facility not found.</p> : null}

      {facility ? (
        <>
          <header className="section-header">
            <div>
              <p className="section-eyebrow">{facility.type.replaceAll('_', ' ')}</p>
              <h1>{facility.name}</h1>
              <p>{facility.location}</p>
            </div>
            <span
              className={`status-badge ${
                facility.status === 'ACTIVE'
                  ? 'approved'
                  : facility.status === 'UNDER_MAINTENANCE'
                    ? 'pending'
                    : 'rejected'
              }`}
            >
              {facility.status.replaceAll('_', ' ')}
            </span>
          </header>

          <section className="dashboard-section facility-detail-hero">
            <div className="facility-detail-copy">
              <p>{facility.description ?? 'No description has been added for this resource yet.'}</p>
              <div className="facility-meta-grid">
                <span>Capacity: {facility.capacity}</span>
                <span>Code: {facility.resourceCode}</span>
                <span>{facility.availabilityWindows.length} weekly windows</span>
              </div>
            </div>
            <div className="facility-tag-row">
              {facility.amenities.map((amenity) => (
                <span key={amenity} className="facility-tag">
                  {amenity}
                </span>
              ))}
            </div>
          </section>

          <section className="dashboard-section booking-section-gap">
            <div className="section-header booking-header-compact">
              <div>
                <p className="section-eyebrow">Schedule</p>
                <h2 className="booking-tight-title">Availability</h2>
              </div>
              <div className="booking-card-actions">
                <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
                <input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
              </div>
            </div>
            <AvailabilityCalendar availability={availability} />
          </section>

          <section className="dashboard-section booking-section-gap">
            <div className="section-header booking-header-compact">
              <div>
                <p className="section-eyebrow">Maintenance</p>
                <h2 className="booking-tight-title">Blackouts</h2>
              </div>
            </div>

            {blackouts.length === 0 ? <p>No maintenance blackouts scheduled.</p> : null}
            {blackouts.length > 0 ? (
              <div className="facility-blackout-list">
                {blackouts.map((blackout) => (
                  <article key={blackout.id} className="dashboard-info-card">
                    <div className="dashboard-info-card-body">
                      <div className="facility-card-top">
                        <div>
                          <strong>{blackout.reason}</strong>
                          <p>
                            {new Date(blackout.startDate).toLocaleString()} -{' '}
                            {new Date(blackout.endDate).toLocaleString()}
                          </p>
                          <p>Created by {blackout.createdByName}</p>
                        </div>
                        {isAdmin() ? (
                          <button
                            type="button"
                            className="btn-ghost"
                            onClick={() => void removeBlackout(blackout.id)}
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}

            {isAdmin() ? (
              <div className="facility-blackout-form">
                <h3>Add blackout</h3>
                <div className="booking-checkin-grid">
                  <input
                    type="datetime-local"
                    value={blackoutStart}
                    onChange={(event) => setBlackoutStart(event.target.value)}
                  />
                  <input
                    type="datetime-local"
                    value={blackoutEnd}
                    onChange={(event) => setBlackoutEnd(event.target.value)}
                  />
                  <input
                    value={blackoutReason}
                    onChange={(event) => setBlackoutReason(event.target.value)}
                    placeholder="Reason"
                  />
                  <button type="button" className="btn-primary" onClick={() => void createBlackout()}>
                    Save Blackout
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        </>
      ) : null}
    </main>
  );
}
