import { Link } from 'react-router-dom';
import type { Facility } from '../../services/types/facility';

type FacilityCardProps = {
  facility: Facility;
  adminHref?: string;
};

export function FacilityCard({ facility, adminHref }: FacilityCardProps) {
  return (
    <article className="dashboard-info-card facility-card">
      <div className="dashboard-info-card-body">
        <div className="facility-card-top">
          <div>
            <p className="section-eyebrow">{facility.type.replaceAll('_', ' ')}</p>
            <h3 className="facility-title">{facility.name}</h3>
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
        </div>

        <p className="facility-copy">{facility.description ?? 'No description provided yet.'}</p>
        <div className="facility-meta-grid">
          <span>{facility.location}</span>
          <span>Capacity: {facility.capacity}</span>
          <span>Code: {facility.resourceCode}</span>
        </div>

        {facility.amenities.length > 0 ? (
          <div className="facility-tag-row">
            {facility.amenities.slice(0, 4).map((amenity) => (
              <span key={amenity} className="facility-tag">
                {amenity}
              </span>
            ))}
          </div>
        ) : null}

        <div className="booking-card-actions">
          <Link to={`/facilities/${facility.id}`} className="btn-primary">
            View Details
          </Link>
          {adminHref ? (
            <Link to={adminHref} className="btn-ghost">
              Manage
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
