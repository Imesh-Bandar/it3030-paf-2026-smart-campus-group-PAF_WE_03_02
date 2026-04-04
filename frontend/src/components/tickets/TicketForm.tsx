import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useFacilities } from '../../hooks/useFacilities';
import { useCreateTicket } from '../../hooks/useTickets';
import type { TicketCategory, TicketDetail, TicketSeverity } from '../../services/types/ticket';

type TicketFormProps = {
  onCreated?: (ticket: TicketDetail) => void;
};

const severities: TicketSeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const categories: TicketCategory[] = ['ELECTRICAL', 'PLUMBING', 'EQUIPMENT', 'CLEANING', 'OTHER'];

export function TicketForm({ onCreated }: TicketFormProps) {
  const facilitiesQuery = useFacilities();
  const createTicket = useCreateTicket();
  const [resourceId, setResourceId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<TicketSeverity>('MEDIUM');
  const [category, setCategory] = useState<TicketCategory>('OTHER');

  const resources = useMemo(() => {
    const data = facilitiesQuery.data;
    if (Array.isArray(data)) {
      return data;
    }

    return data?.content ?? [];
  }, [facilitiesQuery.data]);

  return (
    <form
      className="ticket-form"
      onSubmit={async (event) => {
        event.preventDefault();

        if (!resourceId) {
          toast.error('Choose a resource first');
          return;
        }

        try {
          const ticket = await createTicket.mutateAsync({
            resourceId,
            title: title.trim(),
            description: description.trim(),
            severity,
            category,
          });

          toast.success('Ticket created successfully');
          setTitle('');
          setDescription('');
          setSeverity('MEDIUM');
          setCategory('OTHER');
          onCreated?.(ticket);
        } catch {
          toast.error('Unable to create ticket');
        }
      }}
    >
      <div className="ticket-form-row ticket-form-grid-2">
        <label className="ticket-form-field">
          Resource
          <select
            className="ticket-input"
            value={resourceId}
            onChange={(event) => setResourceId(event.target.value)}
            required
          >
            <option value="">Select a resource</option>
            {resources.map((resource: { id: string; name: string }) => (
              <option key={resource.id} value={resource.id}>
                {resource.name}
              </option>
            ))}
          </select>
        </label>
        <label className="ticket-form-field">
          Severity
          <select
            className="ticket-input"
            value={severity}
            onChange={(event) => setSeverity(event.target.value as TicketSeverity)}
          >
            {severities.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="ticket-form-field">
        Title
        <input
          className="ticket-input"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Short summary of the issue"
          required
        />
      </label>

      <label className="ticket-form-field">
        Description
        <textarea
          className="ticket-textarea"
          rows={5}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What happened, when did it start, and what impact does it have?"
          required
        />
      </label>

      <div className="ticket-form-row ticket-form-grid-2">
        <label className="ticket-form-field">
          Category
          <select
            className="ticket-input"
            value={category}
            onChange={(event) => setCategory(event.target.value as TicketCategory)}
          >
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="ticket-form-actions">
        <button type="submit" className="btn-primary" disabled={createTicket.isPending}>
          {createTicket.isPending ? 'Submitting...' : 'Submit Ticket'}
        </button>
      </div>
    </form>
  );
}
