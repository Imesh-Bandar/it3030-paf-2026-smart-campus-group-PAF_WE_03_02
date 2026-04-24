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
      setTitle('');
      setDescription('');
      setLocation('');
      setFiles([]);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: getApiErrorMessage(error, 'Could not create ticket. Please try again.'),
      }));
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('OTHER');
    setPriority('MEDIUM');
    setLocation('');
    setFiles([]);
    setErrors({});
  };

  const hasDraft =
    title.trim().length > 0 ||
    description.trim().length > 0 ||
    location.trim().length > 0 ||
    files.length > 0;

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
          aria-invalid={Boolean(errors.title)}
          placeholder="Brief issue summary"
        />
        {errors.title && <span className="field-error">{errors.title}</span>}
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
        <span>Category</span>
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
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
        {errors.priority && <span className="field-error">{errors.priority}</span>}
      </label>

      <label className="ticket-form-wide">
        <span>Description</span>
        <textarea
          className={errors.description ? 'field-invalid' : undefined}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
          rows={5}
          aria-invalid={Boolean(errors.description)}
          placeholder="Describe what happened, where, and when."
        />
        {errors.description && <span className="field-error">{errors.description}</span>}
      </label>

      <div className="ticket-form-wide">
        <ImageUploadPreview files={files} onFilesChange={setFiles} />
      </div>

      {errors.submit && (
        <div className="ticket-error-banner ticket-form-wide" role="alert">
          {errors.submit}
        </div>
      )}

      <div className="ticket-form-actions ticket-form-wide">
        <button
          type="button"
          className="btn-ghost"
          onClick={resetForm}
          disabled={saving || !hasDraft}
        >
          Clear form
        </button>
        <button type="submit" className="btn-primary btn-ticket-submit" disabled={saving}>
          {saving ? 'Submitting...' : 'Submit ticket'}
        </button>
      </div>
    </form>
  );
}
