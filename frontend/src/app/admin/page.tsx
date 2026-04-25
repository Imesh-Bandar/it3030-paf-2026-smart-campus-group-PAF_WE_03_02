import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Building2,
  CalendarCheck,
  ShieldCheck,
  Ticket,
  UserCheck,
  Users,
} from 'lucide-react';
import { api } from '../../lib/axios';

interface TopResource {
  resourceId: string;
  resourceName: string;
  bookingCount: number;
}

interface AnalyticsData {
  topResources: TopResource[];
  peakBookingHours: Record<string, number>;
}

export function AdminDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/analytics/top-resources'),
      api.get('/admin/analytics/peak-booking-hours'),
    ])
      .then(([topRes, peakHours]) => {
        setData({
          topResources: topRes.data,
          peakBookingHours: peakHours.data,
        });
      })
      .catch(() => {
        // Keep the dashboard usable when analytics are unavailable.
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="page-shell animate-fade-up" id="admin-dashboard">
      <header className="page-header admin-dashboard-hero">
        <div>
          <p className="section-eyebrow">Campus Operations</p>
          <h1>Admin Dashboard</h1>
          <p>System overview, operational shortcuts, and booking analytics.</p>
        </div>
        <div className="admin-dashboard-hero-icon" aria-hidden="true">
          <BarChart3 size={34} />
        </div>
      </header>

      <section className="dashboard-cards-grid admin-module-grid" aria-label="Admin modules">
        <article className="dashboard-info-card">
          <div className="dashboard-info-card-icon teal">
            <CalendarCheck size={22} />
          </div>
          <div className="dashboard-info-card-body">
            <h3>Manage Bookings</h3>
            <p>Review and approve pending facility booking requests.</p>
            <Link to="/admin/bookings" className="dashboard-card-link">
              Approval Queue &rarr;
            </Link>
          </div>
        </article>

        <article className="dashboard-info-card">
          <div className="dashboard-info-card-icon purple">
            <Ticket size={22} />
          </div>
          <div className="dashboard-info-card-body">
            <h3>Manage Tickets</h3>
            <p>Assign tickets to technicians and monitor system-wide SLAs.</p>
            <Link to="/admin/tickets" className="dashboard-card-link">
              Ticket Board &rarr;
            </Link>
          </div>
        </article>

        <article className="dashboard-info-card">
          <div className="dashboard-info-card-icon rose">
            <Users size={22} />
          </div>
          <div className="dashboard-info-card-body">
            <h3>Manage Users</h3>
            <p>Manage user accounts, roles, and system access.</p>
            <Link to="/admin/users" className="dashboard-card-link">
              User Directory &rarr;
            </Link>
          </div>
        </article>

        <article className="dashboard-info-card">
          <div className="dashboard-info-card-icon blue">
            <Building2 size={22} />
          </div>
          <div className="dashboard-info-card-body">
            <h3>Manage Facilities</h3>
            <p>Add new resources, update availability, and manage campus assets.</p>
            <Link to="/admin/facilities" className="dashboard-card-link">
              Resource Catalog &rarr;
            </Link>
          </div>
        </article>
      </section>

      <section className="dashboard-section admin-user-management-dashboard">
        <div className="dashboard-section-heading">
          <h2>User Management</h2>
          <p>Control account roles, access status, and verification from one dashboard.</p>
        </div>

        <div className="admin-user-dashboard-panel">
          <div className="admin-user-dashboard-main">
            <div className="admin-user-dashboard-icon">
              <UserCheck size={28} />
            </div>
            <div>
              <h3>Campus User Directory</h3>
              <p>
                Search students, staff, technicians, and admins. Update access immediately when
                someone changes responsibility or should no longer use the system.
              </p>
              <Link to="/admin/users" className="btn-primary">
                Open User Management
              </Link>
            </div>
          </div>

          <div className="admin-user-dashboard-actions" aria-label="User management controls">
            <div>
              <ShieldCheck size={19} />
              <span>Role assignment</span>
            </div>
            <div>
              <UserCheck size={19} />
              <span>Active, locked, archived status</span>
            </div>
            <div>
              <Users size={19} />
              <span>Email verification visibility</span>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-section admin-analytics-section">
        <div className="dashboard-section-heading">
          <h2>System Analytics</h2>
          <p>Booking demand patterns from campus resources.</p>
        </div>

        {loading ? (
          <div className="admin-analytics-loading">Loading analytics...</div>
        ) : (
          <div className="dashboard-cards-grid admin-analytics-grid">
            <article className="dashboard-info-card admin-analytics-card">
              <div className="dashboard-info-card-body">
                <h3>Top Booked Resources</h3>
                {data?.topResources.length ? (
                  <ul className="admin-resource-list">
                    {data.topResources.map((resource) => (
                      <li key={resource.resourceId} className="admin-resource-row">
                        <span>{resource.resourceName}</span>
                        <strong>{resource.bookingCount} bookings</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="admin-empty-state">No booking data available yet.</p>
                )}
              </div>
            </article>

            <article className="dashboard-info-card admin-analytics-card">
              <div className="dashboard-info-card-body">
                <h3>Peak Booking Hours</h3>
                {data?.peakBookingHours && Object.keys(data.peakBookingHours).length > 0 ? (
                  <div className="admin-peak-chart" aria-label="Peak booking hours chart">
                    {Object.entries(data.peakBookingHours).map(([hour, count]) => (
                      <div
                        key={hour}
                        className="admin-peak-bar"
                        style={{ height: `${Math.max(10, count * 10)}%` }}
                        title={`${hour}:00 - ${count} bookings`}
                      >
                        <span>{hour}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="admin-empty-state">No time-series data available yet.</p>
                )}
              </div>
            </article>
          </div>
        )}
      </section>
    </main>
  );
}
