import { Link } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { useNotificationStore } from '../../../stores/notificationStore';

export function StudentDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { unreadCount } = useNotificationStore();
  const firstName = user?.fullName?.split(' ')[0] ?? 'Student';

  return (
    <main className="page-shell" id="student-dashboard">
      {/* Header */}
      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <div className="dashboard-role-badge student">Student Workspace</div>
          <h1 className="dashboard-title">
            Welcome back, <span className="highlight">{firstName}</span>
          </h1>
          <p className="dashboard-subtitle">
            Manage your bookings, report issues, and track your campus activities from one place.
          </p>
          <div className="student-hero-tags" aria-label="Student dashboard focus areas">
            <span>Booking ready spaces</span>
            <span>Report issues faster</span>
            <span>Stay updated in real-time</span>
          </div>
        </div>
        {unreadCount > 0 && (
          <div className="dashboard-alert info" role="status">
            <span>🔔</span>
            <span>
              You have <strong>{unreadCount}</strong> unread notification
              {unreadCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </section>

      <section className="student-at-a-glance" aria-label="Student dashboard summary">
        <article className="student-glance-card">
          <span className="student-glance-title">Notifications</span>
          <strong className="student-glance-value">{unreadCount}</strong>
          <span className="student-glance-caption">
            {unreadCount > 0 ? 'New updates waiting for you' : 'You are fully caught up'}
          </span>
        </article>
        <article className="student-glance-card">
          <span className="student-glance-title">Next Step</span>
          <strong className="student-glance-value">Book a Space</strong>
          <span className="student-glance-caption">
            Reserve labs, rooms, and resources for your next session
          </span>
        </article>
        <article className="student-glance-card">
          <span className="student-glance-title">Support Status</span>
          <strong className="student-glance-value">Ticket Desk Active</strong>
          <span className="student-glance-caption">
            Report incidents and monitor progress anytime
          </span>
        </article>
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
            <span className="quick-action-arrow">→</span>
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
              <p>
                View your upcoming, pending, and rejected bookings. Cancel anytime before approval.
              </p>
              <Link to="/bookings" className="dashboard-card-link">
                View My Bookings →
              </Link>
            </div>
          </article>
          <article className="dashboard-info-card" id="card-tickets-overview">
            <div className="dashboard-info-card-icon purple">🎫</div>
            <div className="dashboard-info-card-body">
              <h3>My Tickets</h3>
              <p>
                Track reported campus issues from open through to resolved with full comment
                history.
              </p>
              <Link to="/tickets" className="dashboard-card-link">
                View My Tickets →
              </Link>
            </div>
          </article>
          <article className="dashboard-info-card" id="card-facilities-overview">
            <div className="dashboard-info-card-icon teal">🏛️</div>
            <div className="dashboard-info-card-body">
              <h3>Campus Facilities</h3>
              <p>Browse available labs, lecture halls, meeting rooms, and equipment to book.</p>
              <Link to="/facilities" className="dashboard-card-link">
                Explore Facilities →
              </Link>
            </div>
          </article>
          <article className="dashboard-info-card" id="card-security-overview">
            <div className="dashboard-info-card-icon rose">🔐</div>
            <div className="dashboard-info-card-body">
              <h3>Account Security</h3>
              <p>Review your recent sign-in activity and manage notification preferences.</p>
              <Link to="/account/security" className="dashboard-card-link">
                Security Activity →
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="student-planner" aria-labelledby="student-planner-heading">
        <div className="dashboard-section-heading">
          <h2 id="student-planner-heading">Student Planner</h2>
          <p>Move through your workflow with fewer clicks.</p>
        </div>
        <div className="student-planner-grid">
          <article className="student-planner-item">
            <span className="student-step">01</span>
            <h3>Discover</h3>
            <p>Find facilities and check availability before peak hours.</p>
            <Link to="/facilities">Explore Facilities →</Link>
          </article>
          <article className="student-planner-item">
            <span className="student-step">02</span>
            <h3>Reserve</h3>
            <p>Create bookings and keep track of pending or approved requests.</p>
            <Link to="/bookings">Open My Bookings →</Link>
          </article>
          <article className="student-planner-item">
            <span className="student-step">03</span>
            <h3>Resolve</h3>
            <p>Report issues, follow technician updates, and stay informed.</p>
            <Link to="/tickets">Track My Tickets →</Link>
          </article>
        </div>
      </section>
    </main>
  );
}
