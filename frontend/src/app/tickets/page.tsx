import { useRole } from '../../hooks/useRole';

export function TicketsPage() {
  const { isAdmin } = useRole();

  return (
    <main className="page-shell animate-fade-up" id="tickets-page">
      <div className="section-header">
        <div>
          <p className="section-eyebrow">Support & Maintenance</p>
          <h1>Tickets</h1>
        </div>
        {isAdmin() && (
          <button type="button" className="btn-primary" id="btn-assign-technician">
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
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
            </svg>
            Assign Technician
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
            <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
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
          Phase 4
        </span>
        <h2>Ticket Workflows are Coming</h2>
        <p>
          Report campus issues and monitor maintenance progress with transparent, real-time ticket
          updates. Full ticket workflows launch in Phase 4.
        </p>
      </div>
    </main>
  );
}
