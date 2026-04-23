import type { FacilityFilters as FacilityFilterValues } from '../../services/types/facility';

type FacilityFiltersProps = {
  filters: FacilityFilterValues;
  onChange: (next: FacilityFilterValues) => void;
};

export function FacilityFilters({ filters, onChange }: FacilityFiltersProps) {
  return (
    <section className="dashboard-section facility-filters-panel">
      <div className="section-header booking-header-compact">
        <div>
          <p className="section-eyebrow">Find Space</p>
          <h2 className="booking-tight-title">Filters</h2>
        </div>
      </div>

      <div className="facility-filters-grid">
        <label>
          Search
          <input
            type="search"
            value={filters.q ?? ''}
            onChange={(event) => onChange({ ...filters, q: event.target.value })}
            placeholder="Search by name, location, or description"
          />
        </label>
        <label>
          Type
          <select
            value={filters.type ?? ''}
            onChange={(event) => onChange({ ...filters, type: event.target.value || undefined })}
          >
            <option value="">All types</option>
            <option value="LECTURE_HALL">Lecture Hall</option>
            <option value="LAB">Lab</option>
            <option value="MEETING_ROOM">Meeting Room</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>
        </label>
        <label>
          Status
          <select
            value={filters.status ?? ''}
            onChange={(event) => onChange({ ...filters, status: event.target.value || undefined })}
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
            <option value="OUT_OF_SERVICE">Out of Service</option>
          </select>
        </label>
        <label>
          Min Capacity
          <input
            type="number"
            min={1}
            value={filters.capacityMin ?? ''}
            onChange={(event) =>
              onChange({
                ...filters,
                capacityMin: event.target.value ? Number(event.target.value) : undefined,
              })
            }
          />
        </label>
        <label>
          Max Capacity
          <input
            type="number"
            min={1}
            value={filters.capacityMax ?? ''}
            onChange={(event) =>
              onChange({
                ...filters,
                capacityMax: event.target.value ? Number(event.target.value) : undefined,
              })
            }
          />
        </label>
      </div>
    </section>
  );
}
