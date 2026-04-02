import { useRole } from '../../hooks/useRole';

export function FacilitiesPage() {
  const { isAdmin } = useRole();

  return (
    <main className="page-shell">
      <h1>Facilities</h1>
      <p className="muted">Facility catalogue UI starts in Phase 2.</p>
      {isAdmin() && <button type="button">Create Resource</button>}
    </main>
  );
}
