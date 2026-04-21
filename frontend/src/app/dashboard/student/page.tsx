import { Link } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { useNotificationStore } from '../../../stores/notificationStore';

export function StudentDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { unreadCount } = useNotificationStore();

  return (
    <main className="page-shell" id="student-dashboard">
      {/* Header */}
      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <div className="dashboard-role-badge student">👨‍🎓 Student</div>
          <h1 className="dashboard-title">
            Welcome back, <span className="highlight">{user?.fullName?.split(' ')[0] ?? 'Student'}</span>
          </h1>
          <p className="dashboard-subtitle">
            Manage your bookings, report issues, and track your campus activities from one place.
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="dashboard-alert info" role="status">
            <span>🔔</span>
            <span>You have <strong>{unreadCount}</strong> unread notification{unreadCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section className="dashboard-section" aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading">Quick Actions</h2>
        <div className="dashboard-quick-actions">
          <Link to="/facilities" className="quick-action-card blue" id="qa-browse-facilities">
            <span className="quick-action-icon">🏛️</span>
            <span className="quick-action-label">Browse Facilities</span>
            <span className="quick-action-arrow">→</span>
          </Link>
          <Link to="/bookings" className="quick-action-card teal" id="qa-new-booking">
            <span className="quick-action-icon">📅</span>
            <span className="quick-action-label">My Bookings</span>
            <span className="quick-action-arrow">→</span>
          </Link>
          <Link to="/tickets" className="quick-action-card purple" id="qa-report-issue">
            <span className="quick-action-icon">🎫</span>
            <span className="quick-action-label">Report Issue</span>
            <span className="quick-action-arrow">→</span>
          </Link>
          <Link to="/notifications" className="quick-action-card amber" id="qa-notifications">
            <span className="quick-action-icon">🔔</span>
            <span className="quick-action-label">Notifications</span>
            {unreadCount > 0 && <span className="quick-action-badge">{unreadCount}</span>}
          </Link>
        </div>
      </section>

      {/* Info Cards */}
      <section className="dashboard-section" aria-labelledby="overview-heading">
        <h2 id="overview-heading">Your Activity Overview</h2>
        <div className="dashboard-cards-grid">
          <article className="dashboard-info-card" id="card-bookings-overview">
            <div className="dashboard-info-card-icon blue">📅</div>
            <div className="dashboard-info-card-body">
              <h3>Bookings</h3>
              <p>View your upcoming, pending, and rejected bookings. Cancel anytime before approval.</p>
              <Link to="/bookings" className="dashboard-card-link">View My Bookings →</Link>
            </div>
          </article>
          <article className="dashboard-info-card" id="card-tickets-overview">
            <div className="dashboard-info-card-icon purple">🎫</div>
            <div className="dashboard-info-card-body">
              <h3>My Tickets</h3>
              <p>Track reported campus issues from open through to resolved with full comment history.</p>
              <Link to="/tickets" className="dashboard-card-link">View My Tickets →</Link>
            </div>
          </article>
          <article className="dashboard-info-card" id="card-facilities-overview">
            <div className="dashboard-info-card-icon teal">🏛️</div>
            <div className="dashboard-info-card-body">
              <h3>Campus Facilities</h3>
              <p>Browse available labs, lecture halls, meeting rooms, and equipment to book.</p>
              <Link to="/facilities" className="dashboard-card-link">Explore Facilities →</Link>
            </div>
          </article>
          <article className="dashboard-info-card" id="card-security-overview">
            <div className="dashboard-info-card-icon rose">🔐</div>
            <div className="dashboard-info-card-body">
              <h3>Account Security</h3>
              <p>Review your recent sign-in activity and manage notification preferences.</p>
              <Link to="/account/security" className="dashboard-card-link">Security Activity →</Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
