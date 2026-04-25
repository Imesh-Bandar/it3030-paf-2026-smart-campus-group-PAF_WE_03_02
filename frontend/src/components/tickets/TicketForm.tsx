import { useState } from 'react';
import type { FormEvent } from 'react';
import type { TicketCategory, TicketPriority } from '../../services/types/ticket';
import { ImageUploadPreview } from './ImageUploadPreview';
import { getApiErrorMessage } from './ticketUi';

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
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    priority?: string;
    submit?: string;
  }>({});

  const hasDraft =
    Boolean(title.trim()) ||
    Boolean(description.trim()) ||
    category !== 'OTHER' ||
    priority !== 'MEDIUM' ||
    Boolean(location.trim()) ||
    files.length > 0;

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('OTHER');
    setPriority('MEDIUM');
    setLocation('');
    setFiles([]);
    setErrors({});
  };

  const validate = () => {
    const nextErrors: { title?: string; description?: string; priority?: string } = {};
    if (!title.trim()) {
      nextErrors.title = 'Title is required.';
    } else if (title.trim().length < 5) {
      nextErrors.title = 'Title should be at least 5 characters.';
    }
    if (!description.trim()) {
      nextErrors.description = 'Description is required.';
    } else if (description.trim().length < 10) {
      nextErrors.description = 'Description should be at least 10 characters.';
    }
    if (!priority) {
      nextErrors.priority = 'Priority is required.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }
    setSaving(true);
    setErrors({});
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        location: location.trim(),
        files,
      });
      resetForm();
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: getApiErrorMessage(error, 'Could not create ticket. Please try again.'),
      }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="ticket-form ticket-form-enhanced" onSubmit={submit} noValidate>
      <label>
        <span>Title</span>
        <input
          className={errors.title ? 'field-invalid' : undefined}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          maxLength={120}
          placeholder="Short issue summary"
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? 'ticket-title-error' : undefined}
        />
        {errors.title && (
          <span className="field-error" id="ticket-title-error">
            {errors.title}
          </span>
        )}
      </label>
      <label>
        <span>Location</span>
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
        <span>Priority</span>
        <select
          className={errors.priority ? 'field-invalid' : undefined}
          value={priority}
          onChange={(event) => setPriority(event.target.value as TicketPriority)}
          aria-invalid={Boolean(errors.priority)}
          aria-describedby={errors.priority ? 'ticket-priority-error' : undefined}
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
        {errors.priority && (
          <span className="field-error" id="ticket-priority-error">
            {errors.priority}
          </span>
        )}
      </label>

      <label className="ticket-form-wide">
        <span>Description</span>
        <textarea
          className={errors.description ? 'field-invalid' : undefined}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
          rows={5}
          placeholder="Describe the issue, impact, and any urgent details."
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? 'ticket-description-error' : undefined}
        />
        {errors.description && (
          <span className="field-error" id="ticket-description-error">
            {errors.description}
          </span>
        )}
      </label>

      <div className="ticket-form-wide">
        <ImageUploadPreview files={files} onFilesChange={setFiles} />
      </div>
      <div className="ticket-form-actions ticket-form-wide">
        <p className="muted">Tip: add a photo when reporting visible damage or equipment issues.</p>
        <div className="ticket-form-actions-inline">
          <button
            type="button"
            className="btn-ghost"
            onClick={resetForm}
            disabled={!hasDraft || saving}
          >
            Clear form
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Submitting...' : 'Submit ticket'}
          </button>
        </div>
      </div>
    </form>
  );
}
