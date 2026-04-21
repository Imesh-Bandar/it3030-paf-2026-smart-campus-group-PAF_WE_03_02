import { useEffect, useState } from 'react';
import { api } from '../../lib/axios';
import { Link } from 'react-router-dom';

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
      api.get('/admin/analytics/peak-booking-hours')
    ])
      .then(([topRes, peakHours]) => {
        setData({
          topResources: topRes.data,
          peakBookingHours: peakHours.data
        });
      })
      .catch(() => {
        // Silent fail, just show empty
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="page-shell" id="admin-dashboard">
      <header className="page-header">
        <h1>Admin Dashboard</h1>
        <p>System overview and analytics</p>
      </header>

      <div className="dashboard-cards-grid">
        {/* Module Links */}
        <article className="dashboard-info-card">
          <div className="dashboard-info-card-icon teal">📅</div>
          <div className="dashboard-info-card-body">
            <h3>Manage Bookings</h3>
            <p>Review and approve pending facility booking requests.</p>
            <Link to="/admin/bookings" className="dashboard-card-link">Approval Queue →</Link>
          </div>
        </article>

        <article className="dashboard-info-card">
          <div className="dashboard-info-card-icon purple">🎫</div>
          <div className="dashboard-info-card-body">
            <h3>Manage Tickets</h3>
            <p>Assign tickets to technicians and monitor system-wide SLAs.</p>
            <Link to="/admin/tickets" className="dashboard-card-link">Ticket Board →</Link>
          </div>
        </article>

        <article className="dashboard-info-card">
          <div className="dashboard-info-card-icon rose">👥</div>
          <div className="dashboard-info-card-body">
            <h3>Manage Users</h3>
            <p>Manage user accounts, roles, and system access.</p>
            <Link to="/admin/users" className="dashboard-card-link">User Directory →</Link>
          </div>
        </article>

        <article className="dashboard-info-card">
          <div className="dashboard-info-card-icon blue">🏛️</div>
          <div className="dashboard-info-card-body">
            <h3>Manage Facilities</h3>
            <p>Add new resources, update availability, and manage campus assets.</p>
            <Link to="/admin/facilities" className="dashboard-card-link">Resource Catalog →</Link>
          </div>
        </article>
      </div>

      <h2 className="mt-8 mb-4">System Analytics</h2>

      {loading ? (
        <p>Loading analytics...</p>
      ) : (
        <div className="dashboard-cards-grid">
          {/* Top Resources Chart Placeholder */}
          <article className="dashboard-info-card" style={{ gridColumn: 'span 2' }}>
            <div className="dashboard-info-card-body">
              <h3>Top Booked Resources</h3>
              {data?.topResources.length ? (
                <ul className="mt-4 space-y-2">
                  {data.topResources.map((res) => (
                    <li key={res.resourceId} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded">
                      <span>{res.resourceName}</span>
                      <span className="font-bold">{res.bookingCount} bookings</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-slate-500">No booking data available yet.</p>
              )}
            </div>
          </article>

          {/* Peak Hours Chart Placeholder */}
          <article className="dashboard-info-card" style={{ gridColumn: 'span 2' }}>
            <div className="dashboard-info-card-body">
              <h3>Peak Booking Hours</h3>
              {data?.peakBookingHours && Object.keys(data.peakBookingHours).length > 0 ? (
                <div className="mt-4 flex h-32 items-end gap-1">
                  {Object.entries(data.peakBookingHours).map(([hour, count]) => (
                    <div key={hour} className="flex-1 bg-blue-500 rounded-t min-w-[20px]"
                         style={{ height: `${Math.max(10, (count as number) * 10)}%` }}
                         title={`${hour}:00 - ${count} bookings`} />
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-slate-500">No time-series data available yet.</p>
              )}
            </div>
          </article>
        </div>
      )}
    </main>
  );
}
