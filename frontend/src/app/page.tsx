import { Link } from 'react-router-dom';
import { useRole } from '../hooks/useRole';

export function HomePage() {
  const { isAdmin, isTechnician } = useRole();

  return (
    <main className="page-shell">
      <h1>Smart Campus Operations Hub</h1>
      <p className="muted">Authenticated dashboard and role-aware navigation are enabled.</p>
      <div className="card">
        <h2>Modules</h2>
        <ul>
          <li>
            <Link to="/facilities">Facilities</Link>
          </li>
          <li>
            <Link to="/bookings">Bookings</Link>
          </li>
          <li>
            <Link to="/tickets">Tickets</Link>
          </li>
          {isTechnician() && (
            <li>
              <Link to="/tickets">My Assigned Tickets</Link>
            </li>
          )}
          {isAdmin() && (
            <>
              <li>
                <Link to="/admin/facilities">Manage Facilities</Link>
              </li>
              <li>
                <Link to="/admin/bookings">Manage Bookings</Link>
              </li>
              <li>
                <Link to="/admin/tickets">Manage Tickets</Link>
              </li>
              <li>
                <Link to="/admin/users">Manage Users</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </main>
  );
}
