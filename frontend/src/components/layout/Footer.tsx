import { Link } from 'react-router-dom';
import smartCampusLogo from '../../assets/smart-campus-logo.svg';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <img src={smartCampusLogo} alt="Smart Campus" />
          <p>
            A connected campus platform for facilities, bookings, maintenance, notifications, and
            secure account access.
          </p>
        </div>

        <nav className="site-footer-links" aria-label="Footer navigation">
          <Link to="/about">About</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/facilities">Facilities</Link>
          <Link to="/bookings">Bookings</Link>
          <Link to="/tickets">Tickets</Link>
        </nav>

        <div className="site-footer-meta">
          <span>Smart Campus &copy; 2026</span>
          <span>Innovate. Connect. Learn.</span>
        </div>
      </div>
    </footer>
  );
}
