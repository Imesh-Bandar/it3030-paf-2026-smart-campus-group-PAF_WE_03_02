import { useState } from 'react';
import type { FormEvent } from 'react';
import type { TicketComment } from '../../services/types/ticket';

type Props = {
  comments: TicketComment[];
  canUseInternalNotes: boolean;
  onAdd: (content: string, internal: boolean) => Promise<void>;
  onEdit: (commentId: string, content: string, internal: boolean) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
};

export function CommentSection({ comments, canUseInternalNotes, onAdd, onEdit, onDelete }: Props) {
  const [content, setContent] = useState('');
  const [internal, setInternal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await onAdd(content, internal);
    setContent('');
    setInternal(false);
  };

  return (
    <section className="ticket-detail-section">
      <div className="section-header compact">
        <h2>Comments</h2>
      </div>
      <div className="ticket-comments">
        {comments.map((comment) => (
          <article className="ticket-comment" key={comment.id}>
            <div>
              <strong>{comment.authorName}</strong>
              {comment.internal && <span className="ticket-badge internal-note">Internal</span>}
            </div>
            {editingId === comment.id ? (
              <form
                onSubmit={async (event) => {
                  event.preventDefault();
                  await onEdit(comment.id, editingContent, comment.internal);
                  setEditingId(null);
                }}
              >
                <textarea value={editingContent} onChange={(event) => setEditingContent(event.target.value)} rows={3} />
                <div className="ticket-inline-actions">
                  <button type="submit" className="btn-primary">Save</button>
                  <button type="button" className="btn-ghost" onClick={() => setEditingId(null)}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <p>{comment.content}</p>
                <div className="ticket-inline-actions">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => {
                      setEditingId(comment.id);
                      setEditingContent(comment.content);
                    }}
                  >
                    Edit
                  </button>
                  <button type="button" className="btn-ghost danger" onClick={() => onDelete(comment.id)}>
                    Delete
                  </button>
                </div>
              </>
            )}
          </article>
        ))}
      </div>
      <form className="ticket-comment-form" onSubmit={submit}>
        <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={4} required />
        {canUseInternalNotes && (
          <label className="ticket-checkbox">
            <input type="checkbox" checked={internal} onChange={(event) => setInternal(event.target.checked)} />
            Internal note
          </label>
        )}
        <button type="submit" className="btn-primary">Add comment</button>
      </form>
    </section>
  );
}
