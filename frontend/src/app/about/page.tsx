import { Link } from 'react-router-dom';

export function AboutPage() {
  return (
    <main className="page-shell animate-fade-up info-page" id="about-page">
      <section className="info-hero">
        <p className="section-eyebrow">About Smart Campus</p>
        <h1>One digital space for everyday campus operations.</h1>
        <p>
          Smart Campus helps students, staff, technicians, and administrators coordinate shared
          resources, service requests, alerts, and secure access without switching between scattered
          tools.
        </p>
      </section>

      <section className="info-card-grid">
        <article className="info-card">
          <h2>Facilities</h2>
          <p>Browse campus resources, inspect availability, and manage resource details.</p>
        </article>
        <article className="info-card">
          <h2>Bookings</h2>
          <p>Submit reservations, track approval status, and use QR check-in for approved slots.</p>
        </article>
        <article className="info-card">
          <h2>Maintenance</h2>
          <p>
            Report issues with photos, comments, assignments, status updates, and SLA visibility.
          </p>
        </article>
        <article className="info-card">
          <h2>Admin Control</h2>
          <p>Manage users, roles, resources, booking approvals, and operational dashboards.</p>
        </article>
      </section>

      <section className="info-cta">
        <div>
          <h2>Start with the resource catalogue</h2>
          <p>Find the right space or equipment before creating a booking request.</p>
        </div>
        <Link to="/facilities" className="btn-primary">
          Explore Facilities
        </Link>
      </section>
    </main>
  );
}
