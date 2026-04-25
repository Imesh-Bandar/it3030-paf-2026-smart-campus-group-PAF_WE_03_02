import { useParams } from 'react-router-dom';

export function FacilityDetailsPage() {
  const { id } = useParams();

  return (
    <main className="page-shell">
      <h1>Facility Details</h1>
      <p className="muted">Facility id: {id}</p>
    </main>
  );
}
