import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CommentSection } from '../../../components/tickets/CommentSection';
import { SlaBadge, TicketPriorityBadge, TicketStatusBadge } from '../../../components/tickets/TicketBadges';
import { useRole } from '../../../hooks/useRole';
import { ticketApi } from '../../../services/api/ticketApi';
import type { TicketStatus } from '../../../services/types/ticket';

const statuses: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];

export function TicketDetailsPage() {
  const { id } = useParams();
  const { isAdmin, isTechnician } = useRole();
  const queryClient = useQueryClient();
  const { data: ticket, isLoading } = useQuery({
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

  if (isLoading) return <main className="page-shell">Loading ticket...</main>;
  if (!ticket) return <main className="page-shell">Ticket not found</main>;

  const canManage = isAdmin() || isTechnician();
  const backendRoot = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') ?? 'http://localhost:8008';

  return (
    <main className="page-shell animate-fade-up" id="ticket-detail-page">
      <div className="section-header">
        <div>
          <p className="section-eyebrow">{ticket.ticketNumber}</p>
          <h1>{ticket.title}</h1>
        </div>
        <Link className="btn-ghost" to="/tickets">Back to tickets</Link>
      </div>

      <section className="ticket-detail-grid">
        <article className="ticket-detail-main">
          <div className="ticket-detail-badges">
            <TicketStatusBadge status={ticket.status} />
            <TicketPriorityBadge priority={ticket.priority} />
            <SlaBadge breached={ticket.slaBreached} />
          </div>
          <p>{ticket.description}</p>
          <dl className="ticket-facts">
            <div><dt>Category</dt><dd>{ticket.category.replace('_', ' ')}</dd></div>
            <div><dt>Location</dt><dd>{ticket.location || 'Not specified'}</dd></div>
            <div><dt>Reporter</dt><dd>{ticket.reporterName}</dd></div>
            <div><dt>Technician</dt><dd>{ticket.assigneeName || 'Unassigned'}</dd></div>
            <div><dt>Elapsed</dt><dd>{ticket.elapsedMinutes} minutes</dd></div>
            <div><dt>First response</dt><dd>{ticket.firstResponseAt ? new Date(ticket.firstResponseAt).toLocaleString() : 'Pending'}</dd></div>
          </dl>

          {canManage && (
            <div className="ticket-status-control">
              <label>
                Status
                <select
                  value={ticket.status}
                  onChange={async (event) => {
                    await ticketApi.updateStatus(ticket.id, event.target.value as TicketStatus);
                    toast.success('Status updated');
                    await refresh();
                  }}
                >
                  {statuses.map((status) => <option value={status} key={status}>{status.replace('_', ' ')}</option>)}
                </select>
              </label>
            </div>
          )}
        </article>

        <aside className="ticket-detail-section">
          <h2>Attachments</h2>
          <div className="ticket-attachment-grid">
            {ticket.attachments.map((attachment) => (
              <a href={`${backendRoot}${attachment.fileUrl}`} target="_blank" rel="noreferrer" key={attachment.id}>
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
