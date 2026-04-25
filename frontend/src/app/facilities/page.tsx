import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FacilityCard } from '../../components/facilities/FacilityCard';
import { FacilityFilters } from '../../components/facilities/FacilityFilters';
import { useFacilities } from '../../hooks/useFacilities';
import { useRole } from '../../hooks/useRole';
import type { FacilityFilters as FacilityFilterValues } from '../../services/types/facility';

export function FacilitiesPage() {
  const { isAdmin } = useRole();
  const [filters, setFilters] = useState<FacilityFilterValues>({});
  const { data, isLoading, refetch } = useFacilities(filters);
  const facilities = data ?? [];

  return (
    <main className="page-shell animate-fade-up" id="facilities-page">
      <div className="section-header">
        <div>
          <p className="section-eyebrow">Campus Resources</p>
          <h1>Facilities</h1>
          <p>Browse halls, labs, meeting rooms, and shared equipment with live availability.</p>
          <p className="section-summary">
            {facilities.length} resources currently match your filter set.
          </p>
        </div>
        <div className="booking-card-actions facility-page-actions">
          <button type="button" className="btn-ghost" onClick={() => void refetch()}>
            Refresh
          </button>
          {isAdmin() ? (
            <Link to="/admin/facilities" className="btn-primary">
              Manage Resources
            </Link>
          ) : null}
        </div>
      </div>

      <FacilityFilters filters={filters} onChange={setFilters} />

      <section className="facility-grid">
        {isLoading ? <p className="facility-empty-state">Loading facilities...</p> : null}
        {!isLoading && facilities.length === 0 ? (
          <p className="facility-empty-state">
            No facilities match the current filters. Try clearing the search or expanding the
            capacity range.
          </p>
        ) : null}
        {facilities.map((facility) => (
          <FacilityCard
            key={facility.id}
            facility={facility}
            adminHref={isAdmin() ? '/admin/facilities' : undefined}
          />
        ))}
      </section>
    </main>
  );
}
