import { useState } from 'react';
import type { FormEvent } from 'react';
import type { TicketCategory, TicketPriority } from '../../services/types/ticket';
import { ImageUploadPreview } from './ImageUploadPreview';

type Props = {
  onSubmit: (payload: {
    title: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
    location?: string;
    files: File[];
  }) => Promise<void>;
};

export function TicketForm({ onSubmit }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>('OTHER');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [location, setLocation] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit({ title, description, category, priority, location, files });
      setTitle('');
      setDescription('');
      setLocation('');
      setFiles([]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="ticket-form" onSubmit={submit}>
      <label>
        Title
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          maxLength={120}
          placeholder="Short issue summary"
        />
      </label>
      <label>
        Location
        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="Building, room, or area"
        />
      </label>
      <label>
        Category
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as TicketCategory)}
        >
          <option value="ELECTRICAL">Electrical</option>
          <option value="PLUMBING">Plumbing</option>
          <option value="IT_EQUIPMENT">IT equipment</option>
          <option value="HVAC">HVAC</option>
          <option value="STRUCTURAL">Structural</option>
          <option value="OTHER">Other</option>
        </select>
      </label>
      <label>
        Priority
        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value as TicketPriority)}
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </label>
      <label className="ticket-form-wide">
        Description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
          rows={5}
          placeholder="Describe the issue, impact, and any urgent details."
        />
      </label>
      <div className="ticket-form-wide">
        <ImageUploadPreview files={files} onFilesChange={setFiles} />
      </div>
      <div className="ticket-form-actions ticket-form-wide">
        <p className="muted">Tip: add a photo when reporting visible damage or equipment issues.</p>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Submitting...' : 'Submit ticket'}
        </button>
      </div>
    </form>
  );
}
