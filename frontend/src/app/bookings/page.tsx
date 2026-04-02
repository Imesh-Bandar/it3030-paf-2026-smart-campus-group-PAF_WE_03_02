import { useRole } from '../../hooks/useRole';

export function BookingsPage() {
  const { isAdmin } = useRole();

  return (
    <main className="page-shell animate-fade-up" id="bookings-page">
      <div className="section-header">
        <div>
          <p className="section-eyebrow">Reservations</p>
          <h1>Bookings</h1>
        </div>
        {isAdmin() && (
          <button type="button" className="btn-primary" id="btn-approve-booking">
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
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Approve Booking
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
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
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
          Phase 3
        </span>
        <h2>Booking Screens are Coming</h2>
        <p>
          Plan and manage reservations with fast approvals, clear status tracking, and calendar
          views. Full booking workflows launch in Phase 3.
        </p>
      </div>
    </main>
  );
}
