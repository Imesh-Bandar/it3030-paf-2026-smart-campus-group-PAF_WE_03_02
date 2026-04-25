import { useState } from 'react';
import type { FormEvent } from 'react';
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
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Comments</h2>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
          {comments.length}
        </span>
      </div>
      <div className="space-y-3">
        {comments.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-500">
            No comments yet. Start the conversation with details or updates.
          </div>
        )}
        {comments.map((comment) => (
          <article className="rounded-xl border border-slate-200 bg-slate-50 p-3" key={comment.id}>
            <div className="mb-2 flex items-center gap-2">
              <strong className="text-sm text-slate-800">{comment.authorName}</strong>
              {comment.internal && (
                <span className="inline-flex rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-800">
                  Internal
                </span>
              )}
              <span className="ml-auto text-xs text-slate-500">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
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
                className="space-y-2"
              >
                <textarea
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
                  value={editingContent}
                  onChange={(event) => setEditingContent(event.target.value)}
                  rows={3}
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
                    disabled={busyCommentId === comment.id}
                  >
                    {busyCommentId === comment.id ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    onClick={() => setEditingId(null)}
                    disabled={busyCommentId === comment.id}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p className="whitespace-pre-line text-sm text-slate-700">{comment.content}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    onClick={() => {
                      setEditingId(comment.id);
                      setEditingContent(comment.content);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
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
      <form
        className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
        onSubmit={submit}
      >
        <textarea
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-300 placeholder:text-slate-400 focus:ring-2"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={4}
          required
          placeholder="Write a comment..."
        />
        {canUseInternalNotes && (
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={internal}
              onChange={(event) => setInternal(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Internal note
          </label>
        )}
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        )}
        <button
          type="submit"
          className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
          disabled={isAdding}
        >
          {isAdding ? 'Adding...' : 'Add comment'}
        </button>
      </form>
    </section>
  );
}
