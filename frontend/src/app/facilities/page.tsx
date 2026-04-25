import { useRole } from '../../hooks/useRole';

export function FacilitiesPage() {
  const { isAdmin } = useRole();

  return (
    <main className="page-shell animate-fade-up" id="facilities-page">
      <div className="section-header">
        <div>
          <p className="section-eyebrow">Campus Resources</p>
          <h1>Facilities</h1>
        </div>
        {isAdmin() && (
          <button type="button" className="btn-primary" id="btn-create-facility">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Resource
          </button>
        )}
      </div>

      <div className="coming-soon-card">
        <div className="coming-soon-icon" aria-hidden="true">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        </div>
        <span className="phase-badge">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Phase 2
        </span>
        <h2>Facility Catalogue is Coming</h2>
        <p>
          Discover labs, classrooms, halls, and campus equipment with real-time availability. The
          full facility catalogue UI launches in Phase 2.
        </p>
      </div>
    </main>
  );
}
