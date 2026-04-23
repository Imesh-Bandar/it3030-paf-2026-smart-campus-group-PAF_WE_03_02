import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FacilityCard } from '../../../components/facilities/FacilityCard';
import { ResourceForm } from '../../../components/facilities/ResourceForm';
import { facilityApi } from '../../../services/api/facilityApi';
import type { Facility, FacilityRequestPayload } from '../../../services/types/facility';

export function AdminFacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Facility | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setFacilities(await facilityApi.getAll());
    } catch {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async (payload: FacilityRequestPayload) => {
    setSaving(true);
    try {
      if (editing) {
        await facilityApi.update(editing.id, payload);
        toast.success('Resource updated');
      } else {
        await facilityApi.create(payload);
        toast.success('Resource created');
      }
      setEditing(null);
      await load();
    } catch {
      toast.error('Failed to save resource');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (facility: Facility) => {
    if (!window.confirm(`Delete ${facility.name}?`)) return;
    try {
      await facilityApi.remove(facility.id);
      toast.success('Resource deleted');
      if (editing?.id === facility.id) {
        setEditing(null);
      }
      await load();
    } catch {
      toast.error('Failed to delete resource');
    }
  };

  return (
    <main className="page-shell" id="admin-facilities-page">
      <header className="page-header">
        <h1>Facility Management</h1>
        <p>Create, edit, and retire campus resources, and keep availability windows up to date.</p>
      </header>

      <ResourceForm
        key={editing?.id ?? 'create'}
        initialValue={editing}
        loading={saving}
        submitLabel={editing ? 'Update Resource' : 'Create Resource'}
        onSubmit={save}
      />

      <section className="dashboard-section booking-section-gap">
        <div className="section-header booking-header-compact">
          <div>
            <p className="section-eyebrow">Catalogue</p>
            <h2 className="booking-tight-title">Existing Resources</h2>
          </div>
          <button type="button" className="btn-ghost" onClick={() => setEditing(null)}>
            Clear Selection
          </button>
        </div>

        {loading ? <p>Loading resources...</p> : null}
        {!loading && facilities.length === 0 ? <p>No resources created yet.</p> : null}
        <div className="facility-grid">
          {facilities.map((facility) => (
            <div key={facility.id} className="facility-admin-card">
              <FacilityCard facility={facility} />
              <div className="booking-card-actions">
                <button type="button" className="btn-primary" onClick={() => setEditing(facility)}>
                  Edit
                </button>
                <button type="button" className="btn-ghost" onClick={() => void remove(facility)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
