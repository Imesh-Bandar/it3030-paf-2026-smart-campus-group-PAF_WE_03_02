import { Link } from 'react-router-dom';
import { useRole } from '../hooks/useRole';
import { useAuthStore } from '../stores/authStore';

export function HomePage() {
  const { isAdmin, isTechnician } = useRole();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const modules = [
    {
      id: 'facilities',
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
      colorClass: 'blue',
      badge: 'Browse',
      title: 'Facilities',
      description:
        'Discover labs, classrooms, halls, and campus equipment — view real-time availability at a glance.',
      href: '/facilities',
      linkLabel: 'Explore Facilities',
    },
    {
      id: 'bookings',
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      colorClass: 'teal',
      badge: 'Manage',
      title: 'Bookings',
      description:
        'Organize and oversee reservations with quick approvals, status updates, and clear calendar views.',
      href: '/bookings',
      linkLabel: 'View Bookings',
    },
    {
      id: 'tickets',
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      ),
      colorClass: 'purple',
      badge: 'Report',
      title: 'Tickets',
      description:
        'Report campus issues and monitor maintenance progress with transparent, real-time updates.',
      href: '/tickets',
      linkLabel: 'Open Tickets',
    },
  ];

  return (
    <main className="home-shell">
      {/* ── Hero Section ── */}
      <section className="home-hero animate-fade-up" aria-labelledby="hero-heading">
        <div className="home-hero-content">
          <div className="home-tag">
            <span className="home-tag-dot" aria-hidden="true" />
            Smart Campus Operations Hub
          </div>

          <h1 className="home-title" id="hero-heading">
            {isAuthenticated ? (
              <>
                Welcome back,{' '}
                <span className="highlight">{user?.fullName?.split(' ')[0] ?? 'there'}</span>.
              </>
            ) : (
              <>
                One workspace for <span className="highlight">campus life</span> and operations.
              </>
            )}
          </h1>

          <p className="home-subtitle">
            {isAuthenticated
              ? 'You are signed in. Jump into your operational modules below and manage your campus workflows.'
              : 'Guest view enabled. Sign in to access bookings, tickets, and admin tools — or browse facilities freely.'}
          </p>

          <div className="home-actions">
            {isAuthenticated ? (
              <Link to="/facilities" className="home-cta-primary">
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
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                Open Facilities
              </Link>
            ) : (
              <>
                <Link to="/login" className="home-cta-primary" id="hero-login-btn">
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
                    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Go to Login or Register
                </Link>
                <Link to="/facilities" className="home-cta-secondary" id="hero-browse-btn">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  Browse Facilities
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Modules Grid ── */}
      <section
        className="module-grid animate-fade-up animation-delay-2"
        aria-label="Platform modules"
      >
        {modules.map((mod) => (
          <article key={mod.id} className="module-card" id={`module-${mod.id}`}>
            <div className={`module-card-icon ${mod.colorClass}`} aria-hidden="true">
              {mod.icon}
            </div>
            <span className="module-card-badge">{mod.badge}</span>
            <h2>{mod.title}</h2>
            <p>{mod.description}</p>
            <Link to={mod.href} className="module-card-link" id={`link-${mod.id}`}>
              {mod.linkLabel}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </article>
        ))}

        {/* Technician card */}
        {isTechnician() && (
          <article className="module-card" id="module-assigned-tickets">
            <div className="module-card-icon amber" aria-hidden="true">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <span className="module-card-badge">Assigned</span>
            <h2>Assigned Tickets</h2>
            <p>
              View and update technical incidents currently assigned to you with full workflow
              control.
            </p>
            <Link to="/tickets" className="module-card-link" id="link-assigned-tickets">
              Open Assigned Tickets
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </article>
        )}

        {/* Admin Console card */}
        {isAdmin() && (
          <article className="module-card" id="module-admin">
            <div className="module-card-icon rose" aria-hidden="true">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="module-card-badge">Admin</span>
            <h2>Admin Console</h2>
            <p>
              Manage users, facilities, bookings, and ticket operations from one unified control
              panel.
            </p>
            <div className="admin-links">
              <Link to="/admin/facilities" id="admin-link-facilities">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                Facilities
              </Link>
              <Link to="/admin/bookings" id="admin-link-bookings">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Bookings
              </Link>
              <Link to="/admin/tickets" id="admin-link-tickets">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Tickets
              </Link>
              <Link to="/admin/users" id="admin-link-users">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
                Users
              </Link>
            </div>
          </article>
        )}
      </section>

      {/* ── Status Bar ── */}
      <div
        className="home-status animate-fade-up animation-delay-4"
        role="status"
        aria-live="polite"
      >
        <span className={`status-dot${isAuthenticated ? '' : ' grey'}`} aria-hidden="true" />
        <span>
          {isAuthenticated
            ? `Signed in as ${user?.role ?? 'USER'} · Full feature access based on your role.`
            : 'Guest mode · Read-only overview. Sign in to unlock full access.'}
        </span>
      </div>
    </main>
  );
}
