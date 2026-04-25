import { useState } from 'react';
import type { FormEvent } from 'react';
import { MessageSquare } from 'lucide-react';
import type { TicketComment } from '../../services/types/ticket';
import { getApiErrorMessage } from './ticketUi';

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
  const [isAdding, setIsAdding] = useState(false);
  const [busyCommentId, setBusyCommentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!content.trim()) {
      setError('Comment cannot be empty.');
      return;
    }
    setError(null);
    setIsAdding(true);
    try {
      await onAdd(content.trim(), internal);
      setContent('');
      setInternal(false);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Unable to add comment.'));
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <section className="ticket-detail-section ticket-comments-panel">
      <div className="ticket-section-title">
        <MessageSquare size={18} aria-hidden="true" />
        <h2>Comments</h2>
        <span className="ticket-total-pill">{comments.length}</span>
      </div>
      <div className="ticket-comments">
        {comments.length === 0 && (
          <div className="ticket-empty-state">
            No comments yet. Start the conversation with details or updates.
          </div>
        )}
        {comments.map((comment) => (
          <article className="ticket-comment" key={comment.id}>
            <div className="ticket-comment-header">
              <strong>{comment.authorName}</strong>
              {comment.internal && <span className="ticket-badge internal-note">Internal</span>}
              <span>{new Date(comment.createdAt).toLocaleString()}</span>
            </div>
            {editingId === comment.id ? (
              <form
                onSubmit={async (event) => {
                  event.preventDefault();
                  if (!editingContent.trim()) {
                    setError('Edited comment cannot be empty.');
                    return;
                  }
                  setError(null);
                  setBusyCommentId(comment.id);
                  try {
                    await onEdit(comment.id, editingContent.trim(), comment.internal);
                    setEditingId(null);
                  } catch (submitError) {
                    setError(getApiErrorMessage(submitError, 'Unable to update comment.'));
                  } finally {
                    setBusyCommentId(null);
                  }
                }}
                className="ticket-comment-edit"
              >
                <textarea
                  value={editingContent}
                  onChange={(event) => setEditingContent(event.target.value)}
                  rows={3}
                />
                <div className="ticket-inline-actions">
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={busyCommentId === comment.id}
                  >
                    {busyCommentId === comment.id ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setEditingId(null)}
                    disabled={busyCommentId === comment.id}
                  >
                    Cancel
                  </button>
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
                  <button
                    type="button"
                    className="btn-ghost btn-danger"
                    onClick={async () => {
                      setError(null);
                      setBusyCommentId(comment.id);
                      try {
                        await onDelete(comment.id);
                      } catch (submitError) {
                        setError(getApiErrorMessage(submitError, 'Unable to delete comment.'));
                      } finally {
                        setBusyCommentId(null);
                      }
                    }}
                    disabled={busyCommentId === comment.id}
                  >
                    {busyCommentId === comment.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </>
            )}
          </article>
        ))}
      </div>
      <form className="ticket-comment-form" onSubmit={submit}>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={4}
          required
          placeholder="Write a comment..."
        />
        {canUseInternalNotes && (
          <label className="ticket-checkbox">
            <input
              type="checkbox"
              checked={internal}
              onChange={(event) => setInternal(event.target.checked)}
            />
            Internal note
          </label>
        )}
        {error && <div className="ticket-error-banner">{error}</div>}
        <button type="submit" className="btn-primary" disabled={isAdding}>
          {isAdding ? 'Adding...' : 'Add comment'}
        </button>
      </form>
    </section>
  );
}
