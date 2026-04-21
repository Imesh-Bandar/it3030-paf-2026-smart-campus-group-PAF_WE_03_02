import { Link } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { useNotificationStore } from '../../../stores/notificationStore';

export function TechnicianDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { unreadCount } = useNotificationStore();

  return (
    <main className="page-shell" id="technician-dashboard">
      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <div className="dashboard-role-badge technician">🔧 Technician</div>
          <h1 className="dashboard-title">
            Welcome, <span className="highlight">{user?.fullName?.split(' ')[0] ?? 'Technician'}</span>
          </h1>
          <p className="dashboard-subtitle">
            View your assigned tickets, update resolutions, and manage maintenance tasks efficiently.
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="dashboard-alert info" role="status">
            <span>🔔</span>
            <span>You have <strong>{unreadCount}</strong> unread notification{unreadCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </section>

      <section className="dashboard-section" aria-labelledby="technician-actions-heading">
        <h2 id="technician-actions-heading">Quick Actions</h2>
        <div className="dashboard-quick-actions">
          <Link to="/tickets" className="quick-action-card purple" id="qa-tech-tickets">
            <span className="quick-action-icon">🎫</span>
            <span className="quick-action-label">My Tickets Queue</span>
            <span className="quick-action-arrow">→</span>
          </Link>
          <Link to="/facilities" className="quick-action-card blue" id="qa-tech-facilities">
            <span className="quick-action-icon">🏛️</span>
            <span className="quick-action-label">Browse Facilities</span>
            <span className="quick-action-arrow">→</span>
          </Link>
          <Link to="/notifications" className="quick-action-card amber" id="qa-tech-notifications">
            <span className="quick-action-icon">🔔</span>
            <span className="quick-action-label">Notifications</span>
            {unreadCount > 0 && <span className="quick-action-badge">{unreadCount}</span>}
          </Link>
        </div>
      </section>

      <section className="dashboard-section" aria-labelledby="technician-modules-heading">
        <h2 id="technician-modules-heading">My Workload Overview</h2>
        <div className="dashboard-cards-grid">
          <article className="dashboard-info-card" id="card-tech-queue">
            <div className="dashboard-info-card-icon purple">🎫</div>
            <div className="dashboard-info-card-body">
              <h3>Assigned Tickets Queue</h3>
              <p>View all tickets assigned to you. Prioritize tasks by SLA and current workload.</p>
              <Link to="/tickets" className="dashboard-card-link">View My Queue →</Link>
            </div>
          </article>
          <article className="dashboard-info-card" id="card-tech-status">
            <div className="dashboard-info-card-icon teal">🔄</div>
            <div className="dashboard-info-card-body">
              <h3>Update Status</h3>
              <p>Log your progress on open tickets. Transition tickets from Open to In-Progress to Resolved.</p>
              <Link to="/tickets" className="dashboard-card-link">Update Tickets →</Link>
            </div>
          </article>
          <article className="dashboard-info-card" id="card-tech-alerts">
            <div className="dashboard-info-card-icon amber">🔔</div>
            <div className="dashboard-info-card-body">
              <h3>Ticket Alerts</h3>
              <p>Receive notifications for new assignments, SLA breaches, and important updates on your tasks.</p>
              <Link to="/notifications" className="dashboard-card-link">View Alerts →</Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
