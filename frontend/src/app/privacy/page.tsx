export function PrivacyPolicyPage() {
  return (
    <main className="page-shell animate-fade-up info-page" id="privacy-page">
      <section className="info-hero">
        <p className="section-eyebrow">Privacy Policy</p>
        <h1>How Smart Campus handles your information.</h1>
        <p>
          This page explains the basic data practices for the Smart Campus platform used for campus
          operations, bookings, tickets, notifications, and account security.
        </p>
      </section>

      <section className="privacy-content">
        <article>
          <h2>Information We Use</h2>
          <p>
            The platform may store account details such as name, email, role, verification status,
            booking requests, ticket activity, notification preferences, and security activity logs.
          </p>
        </article>
        <article>
          <h2>Why We Use It</h2>
          <p>
            Data is used to provide role-based access, manage facilities, process bookings, support
            QR check-in, assign maintenance tickets, send notifications, and protect accounts.
          </p>
        </article>
        <article>
          <h2>Access and Roles</h2>
          <p>
            Administrators can manage user roles and access status. Staff and technicians only see
            the information needed for their campus workflow.
          </p>
        </article>
        <article>
          <h2>Security</h2>
          <p>
            Authentication tokens, security events, account status, and role controls help prevent
            unauthorized access and support account auditing.
          </p>
        </article>
        <article>
          <h2>Questions</h2>
          <p>
            For questions about data usage, contact your campus system administrator or project
            maintainer.
          </p>
        </article>
      </section>
    </main>
  );
}
