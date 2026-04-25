import { Link } from 'react-router-dom';
import { Building2, MapPin, Users } from 'lucide-react';
import type { Facility } from '../../services/types/facility';

const statusLabel: Record<string, string> = {
  ACTIVE: 'Available',
  UNDER_MAINTENANCE: 'Maintenance',
  OUT_OF_SERVICE: 'Out of service',
};

const statusTone: Record<string, string> = {
  ACTIVE: 'approved',
  UNDER_MAINTENANCE: 'pending',
  OUT_OF_SERVICE: 'rejected',
};

type FacilityCardProps = {
  facility: Facility;
  adminHref?: string;
};

export function FacilityCard({ facility, adminHref }: FacilityCardProps) {
  return (
    <article className="dashboard-info-card facility-card">
      <div className="facility-card-media" aria-hidden="true">
        {facility.thumbnailUrl ? (
          <img src={facility.thumbnailUrl} alt="" />
        ) : (
          <div className="facility-card-media-fallback">
            <Building2 size={30} />
            <span>{facility.type.replaceAll('_', ' ')}</span>
          </div>
        )}
      </div>
      <div className="dashboard-info-card-body">
        <div className="facility-card-top">
          <div>
            <p className="section-eyebrow">{facility.type.replaceAll('_', ' ')}</p>
            <h3 className="facility-title">{facility.name}</h3>
          </div>
          <span className={`status-badge ${statusTone[facility.status] ?? 'approved'}`}>
            {statusLabel[facility.status] ?? facility.status.replaceAll('_', ' ')}
          </span>
        </div>

        <p className="facility-copy">{facility.description ?? 'No description provided yet.'}</p>
        <div className="facility-meta-grid" aria-label="Facility summary">
          <span className="facility-meta-item">
            <MapPin size={14} />
            {facility.location}
          </span>
          <span className="facility-meta-item">
            <Users size={14} />
            Capacity {facility.capacity}
          </span>
          <span className="facility-meta-item">
            <Building2 size={14} />
            {facility.resourceCode}
          </span>
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
