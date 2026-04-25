import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CalendarClock, Clock3, MapPin, Paperclip, User, UserCog } from 'lucide-react';
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

function formatDateTime(value?: string) {
  return value ? new Date(value).toLocaleString() : 'Pending';
}

function formatMinutes(value: number) {
  if (value < 60) return `${value} min`;
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

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
      <main className="page-shell" id="ticket-detail-page">
        <div className="ticket-detail-loading" />
      </main>
    );
  }
  if (isError) {
    return (
      <main className="page-shell" id="ticket-detail-page">
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
      <div className="ticket-detail-hero">
        <div>
          <p className="section-eyebrow">{ticket.ticketNumber}</p>
          <h1>{ticket.title}</h1>
          <p className="section-summary">
            Reported by {ticket.reporterName}. Use the status control to move the workflow forward.
          </p>
        </div>
        <Link className="btn-ghost ticket-back-link" to="/tickets">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to tickets
        </Link>
      </div>

      <section className="ticket-detail-grid">
        <article className="ticket-detail-main ticket-panel-enter">
          <div className="ticket-detail-badges">
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityBadge priority={ticket.priority} />
            <SlaBadge breached={ticket.slaBreached} />
          </div>
          <p className="ticket-detail-description">{ticket.description}</p>
          <dl className="ticket-facts">
            <div>
              <dt>
                <CalendarClock size={15} aria-hidden="true" />
                Category
              </dt>
              <dd>{ticket.category.replace('_', ' ')}</dd>
            </div>
            <div>
              <dt>
                <MapPin size={15} aria-hidden="true" />
                Location
              </dt>
              <dd>{ticket.location || 'Not specified'}</dd>
            </div>
            <div>
              <dt>
                <User size={15} aria-hidden="true" />
                Reporter
              </dt>
              <dd>{ticket.reporterName}</dd>
            </div>
            <div>
              <dt>
                <UserCog size={15} aria-hidden="true" />
                Technician
              </dt>
              <dd>{ticket.assigneeName || 'Unassigned'}</dd>
            </div>
            <div>
              <dt>
                <Clock3 size={15} aria-hidden="true" />
                Elapsed
              </dt>
              <dd>{formatMinutes(ticket.elapsedMinutes)}</dd>
            </div>
            <div>
              <dt>
                <CalendarClock size={15} aria-hidden="true" />
                First response
              </dt>
              <dd>{formatDateTime(ticket.firstResponseAt)}</dd>
            </div>
          </dl>

          {canManage && (
            <div className="ticket-status-control">
              <label>
                Status
                <select
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
              {actionError && <p className="ticket-action-error">{actionError}</p>}
            </div>
          )}
        </article>

        <aside className="ticket-detail-section ticket-panel-enter ticket-panel-enter-delay">
          <div className="ticket-section-title">
            <Paperclip size={18} aria-hidden="true" />
            <h2>Attachments</h2>
          </div>
          <div className="ticket-attachment-grid">
            {ticket.attachments.length === 0 && (
              <div className="ticket-empty-state">No attachments added.</div>
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
