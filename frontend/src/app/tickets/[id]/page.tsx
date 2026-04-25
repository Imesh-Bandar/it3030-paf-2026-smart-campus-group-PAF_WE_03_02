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
        <div className="ticket-loading-card" />
      </main>
    );
  }
  if (isError) {
    return (
      <main className="page-shell">
        <div className="ticket-error-banner">
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
          <p className="section-summary">
            Reported by {ticket.reporterName}. Use the status control to move the workflow forward.
          </p>
        </div>
        <div className="ticket-detail-badges">
          <Link className="btn-ghost" to="/tickets">
            Back to tickets
          </Link>
        </div>
      </div>

      <section className="ticket-detail-grid">
        <article className="ticket-detail-main ticket-detail-section">
          <div className="ticket-detail-badges">
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityBadge priority={ticket.priority} />
            <SlaBadge breached={ticket.slaBreached} />
          </div>
          <p className="ticket-detail-copy">{ticket.description}</p>
          <dl className="ticket-detail-meta-grid ticket-facts">
            <div>
              <dt>Category</dt>
              <dd>{ticket.category.replace('_', ' ')}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{ticket.location || 'Not specified'}</dd>
            </div>
            <div>
              <dt>Reporter</dt>
              <dd>{ticket.reporterName}</dd>
            </div>
            <div>
              <dt>Technician</dt>
              <dd>{ticket.assigneeName || 'Unassigned'}</dd>
            </div>
            <div>
              <dt>Elapsed</dt>
              <dd>{ticket.elapsedMinutes} minutes</dd>
            </div>
            <div>
              <dt>First response</dt>
              <dd>
                {ticket.firstResponseAt
                  ? new Date(ticket.firstResponseAt).toLocaleString()
                  : 'Pending'}
              </dd>
            </div>
          </dl>

          {canManage && (
            <div className="ticket-status-control ticket-detail-section">
              <label>
                <span>Status</span>
                <select
                  className="ticket-status-select"
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
              {actionError && <p className="field-error">{actionError}</p>}
            </div>
          )}
        </article>

        <aside className="ticket-detail-side ticket-detail-section">
          <h2>Attachments</h2>
          <div className="ticket-attachment-grid">
            {ticket.attachments.length === 0 && (
              <div className="ticket-empty-column">No attachments added.</div>
            )}
            {ticket.attachments.map((attachment) => (
              <a
                href={`${backendRoot}${attachment.fileUrl}`}
                target="_blank"
                rel="noreferrer"
                key={attachment.id}
              >
                <img src={`${backendRoot}${attachment.fileUrl}`} alt={attachment.fileName} />
                <span>{attachment.fileName}</span>
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
