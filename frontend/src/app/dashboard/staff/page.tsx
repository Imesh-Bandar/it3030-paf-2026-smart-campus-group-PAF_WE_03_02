import { Link } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { useNotificationStore } from '../../../stores/notificationStore';

export function StaffDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { unreadCount } = useNotificationStore();

  return (
    <main className="page-shell" id="staff-dashboard">
      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <div className="dashboard-role-badge staff">👔 Staff</div>
          <h1 className="dashboard-title">
            Welcome, <span className="highlight">{user?.fullName?.split(' ')[0] ?? 'Staff'}</span>
          </h1>
          <p className="dashboard-subtitle">
            Manage departmental bookings, raise service requests, and stay on top of operational updates.
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="dashboard-alert info" role="status">
            <span>🔔</span>
            <span>You have <strong>{unreadCount}</strong> unread notification{unreadCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </section>

      <section className="dashboard-section" aria-labelledby="staff-actions-heading">
        <h2 id="staff-actions-heading">Quick Actions</h2>
        <div className="dashboard-quick-actions">
          <Link to="/bookings" className="quick-action-card teal" id="qa-staff-bookings">
            <span className="quick-action-icon">📅</span>
            <span className="quick-action-label">Department Bookings</span>
            <span className="quick-action-arrow">→</span>
          </Link>
          <Link to="/tickets" className="quick-action-card purple" id="qa-staff-tickets">
            <span className="quick-action-icon">🎫</span>
            <span className="quick-action-label">Raise Service Request</span>
            <span className="quick-action-arrow">→</span>
          </Link>
          <Link to="/facilities" className="quick-action-card blue" id="qa-staff-facilities">
            <span className="quick-action-icon">🏛️</span>
            <span className="quick-action-label">Browse Facilities</span>
            <span className="quick-action-arrow">→</span>
          </Link>
          <Link to="/notifications" className="quick-action-card amber" id="qa-staff-notifications">
            <span className="quick-action-icon">🔔</span>
            <span className="quick-action-label">Notifications</span>
            {unreadCount > 0 && <span className="quick-action-badge">{unreadCount}</span>}
          </Link>
        </div>
      </section>

      <section className="dashboard-section" aria-labelledby="staff-modules-heading">
        <h2 id="staff-modules-heading">Department Overview</h2>
        <div className="dashboard-cards-grid">
          <article className="dashboard-info-card" id="card-staff-bookings">
            <div className="dashboard-info-card-icon teal">📅</div>
            <div className="dashboard-info-card-body">
              <h3>My Bookings</h3>
              <p>View and manage all bookings you have made, including pending approvals and approved sessions.</p>
              <Link to="/bookings" className="dashboard-card-link">View Bookings →</Link>
            </div>
          </article>
          <article className="dashboard-info-card" id="card-staff-requests">
            <div className="dashboard-info-card-icon purple">🔧</div>
            <div className="dashboard-info-card-body">
              <h3>Service Requests</h3>
              <p>View operational incidents and maintenance requests you have raised on behalf of your department.</p>
              <Link to="/tickets" className="dashboard-card-link">My Service Requests →</Link>
            </div>
          </article>
          <article className="dashboard-info-card" id="card-staff-notifications">
            <div className="dashboard-info-card-icon amber">🔔</div>
            <div className="dashboard-info-card-body">
              <h3>Operational Alerts</h3>
              <p>Stay informed about booking status changes, facility updates, and reminders for your team.</p>
              <Link to="/notifications" className="dashboard-card-link">View Notifications →</Link>
            </div>
          </article>
          <article className="dashboard-info-card" id="card-staff-preferences">
            <div className="dashboard-info-card-icon rose">⚙️</div>
            <div className="dashboard-info-card-body">
              <h3>Notification Settings</h3>
              <p>Customise which notifications you receive for bookings, tickets, and security events.</p>
              <Link to="/notifications/preferences" className="dashboard-card-link">Manage Preferences →</Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
