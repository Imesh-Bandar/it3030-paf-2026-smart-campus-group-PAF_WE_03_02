import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { CommentSection } from '../../../components/tickets/CommentSection';
import {
  SlaBadge,
  TicketPriorityBadge,
  TicketStatusBadge,
} from '../../../components/tickets/TicketBadges';
import { useRole } from '../../../hooks/useRole';
import { ticketApi } from '../../../services/api/ticketApi';
import type { TicketStatus } from '../../../services/types/ticket';
import { formatStatusLabel, getApiErrorMessage } from '../../../components/tickets/ticketUi';

const statuses: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];

export function TicketDetailsPage() {
  const { id } = useParams();
  const { isAdmin, isTechnician } = useRole();
  const queryClient = useQueryClient();
  const [statusSaving, setStatusSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const {
    data: ticket,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketApi.getById(id!),
    enabled: Boolean(id),
  });

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['ticket', id] }),
      queryClient.invalidateQueries({ queryKey: ['tickets'] }),
    ]);
  };

  if (isLoading) {
    return (
      <main className="page-shell">
        <div className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
      </main>
    );
  }
  if (isError) {
    return (
      <main className="page-shell">
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {getApiErrorMessage(error, 'Failed to load ticket.')}
        </div>
      </main>
    );
  }
  if (!ticket) return <main className="page-shell">Ticket not found</main>;

  const canManage = isAdmin() || isTechnician();
  const backendRoot =
    import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') ?? 'http://localhost:8008';

  return (
    <main className="page-shell animate-fade-up" id="ticket-detail-page">
      <div className="section-header">
        <div>
          <p className="section-eyebrow">{ticket.ticketNumber}</p>
          <h1>{ticket.title}</h1>
        </div>
        <Link className="btn-ghost" to="/tickets">
          Back to tickets
        </Link>
      </div>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityBadge priority={ticket.priority} />
            <SlaBadge breached={ticket.slaBreached} />
          </div>
          <p className="whitespace-pre-line text-sm text-slate-700">{ticket.description}</p>
          <dl className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Category
              </dt>
              <dd className="text-sm font-medium text-slate-800">
                {ticket.category.replace('_', ' ')}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Location
              </dt>
              <dd className="text-sm font-medium text-slate-800">
                {ticket.location || 'Not specified'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Reporter
              </dt>
              <dd className="text-sm font-medium text-slate-800">{ticket.reporterName}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Technician
              </dt>
              <dd className="text-sm font-medium text-slate-800">
                {ticket.assigneeName || 'Unassigned'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Elapsed
              </dt>
              <dd className="text-sm font-medium text-slate-800">
                {ticket.elapsedMinutes} minutes
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                First response
              </dt>
              <dd className="text-sm font-medium text-slate-800">
                {ticket.firstResponseAt
                  ? new Date(ticket.firstResponseAt).toLocaleString()
                  : 'Pending'}
              </dd>
            </div>
          </dl>

          {canManage && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Status
                <select
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-slate-300 focus:ring-2"
                  value={ticket.status}
                  onChange={async (event) => {
                    setActionError(null);
                    setStatusSaving(true);
                    try {
                      await ticketApi.updateStatus(ticket.id, event.target.value as TicketStatus);
                      toast.success('Status updated');
                      await refresh();
                    } catch (submitError) {
                      setActionError(getApiErrorMessage(submitError, 'Unable to update status.'));
                    } finally {
                      setStatusSaving(false);
                    }
                  }}
                  disabled={statusSaving}
                >
                  {statuses.map((status) => (
                    <option value={status} key={status}>
                      {formatStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </label>
              {actionError && <p className="mt-2 text-xs text-rose-600">{actionError}</p>}
            </div>
          )}
        </article>

        <aside className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <h2 className="text-lg font-semibold text-slate-900">Attachments</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {ticket.attachments.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-500">
                No attachments added.
              </div>
            )}
            {ticket.attachments.map((attachment) => (
              <a
                href={`${backendRoot}${attachment.fileUrl}`}
                target="_blank"
                rel="noreferrer"
                key={attachment.id}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
              >
                <img
                  src={`${backendRoot}${attachment.fileUrl}`}
                  alt={attachment.fileName}
                  className="h-32 w-full object-cover transition group-hover:scale-[1.02]"
                />
                <span className="block truncate px-2 py-1.5 text-xs text-slate-600">
                  {attachment.fileName}
                </span>
              </a>
            ))}
          </div>
        </aside>
      </section>

      <CommentSection
        comments={ticket.comments}
        canUseInternalNotes={canManage}
        onAdd={async (content, internal) => {
          await ticketApi.addComment(ticket.id, content, internal);
          toast.success('Comment added');
          await refresh();
        }}
        onEdit={async (commentId, content, internal) => {
          await ticketApi.updateComment(ticket.id, commentId, content, internal);
          toast.success('Comment updated');
          await refresh();
        }}
        onDelete={async (commentId) => {
          await ticketApi.deleteComment(ticket.id, commentId);
          toast.success('Comment deleted');
          await refresh();
        }}
      />
    </main>
  );
}
