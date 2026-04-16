import { useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { TicketCard } from '../../../components/tickets/TicketCard';
import {
  useAddTicketComment,
  useAddTicketEvidence,
  useAssignTicket,
  useTicket,
  useUpdateTicketStatus,
} from '../../../hooks/useTickets';
import { useTechnicians } from '../../../hooks/useTechnicians';
import { useAuthStore } from '../../../stores/authStore';
import { useRole } from '../../../hooks/useRole';
import type { TicketStatus } from '../../../services/types/ticket';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1';
const apiOrigin = apiBaseUrl.replace(/\/api\/v1\/?$/, '');

function resolveEvidenceUrl(url: string) {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  if (url.startsWith('/')) {
    return `${apiOrigin}${url}`;
  }

  return `${apiOrigin}/${url}`;
}

export function TicketDetailsPage() {
  const { id } = useParams();
  const { isAdmin, isTechnician } = useRole();
  const userId = useAuthStore((state) => state.user?.id);
  const ticketQuery = useTicket(id);
  const techniciansQuery = useTechnicians(isAdmin());
  const statusMutation = useUpdateTicketStatus();
  const assignMutation = useAssignTicket();
  const commentMutation = useAddTicketComment();
  const evidenceMutation = useAddTicketEvidence();
  const [comment, setComment] = useState('');
  const [notes, setNotes] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidenceInputKey, setEvidenceInputKey] = useState(0);

  const ticket = ticketQuery.data;
  const technicians = techniciansQuery.data ?? [];
  const canManageStatus = isAdmin() || (isTechnician() && ticket?.assignedToId === userId);
  const canAssign = isAdmin();
  const statusButtons: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];
  const selectedAssignedToId = assignedToId || ticket?.assignedToId || '';

  const title = ticket?.title ?? 'Ticket Details';

  if (ticketQuery.isLoading) {
    return (
      <main className="page-shell">
        <div className="ticket-empty-state">Loading ticket...</div>
      </main>
    );
  }

  if (ticketQuery.isError || !ticket) {
    return (
      <main className="page-shell">
        <div className="ticket-empty-state error">Ticket not found or unavailable.</div>
      </main>
    );
  }

  return (
    <main className="page-shell ticket-page animate-fade-up" id="ticket-detail-page">
      <div className="section-header">
        <div>
          <p className="section-eyebrow">Support & Maintenance</p>
          <h1>{title}</h1>
          <p className="section-subtitle">
            {ticket.ticketNumber} · {ticket.resourceName}
          </p>
        </div>
      </div>

      <section className="ticket-detail-layout">
        <div className="ticket-panel">
          <TicketCard ticket={ticket} compact />

          <div className="ticket-detail-meta">
            <div>
              <span className="meta-label">Reporter</span>
              <strong>{ticket.reporterName}</strong>
            </div>
            <div>
              <span className="meta-label">Assigned To</span>
              <strong>{ticket.assignedToName ?? 'Unassigned'}</strong>
            </div>
            <div>
              <span className="meta-label">Updated</span>
              <strong>{new Date(ticket.updatedAt).toLocaleString()}</strong>
            </div>
          </div>

          {canManageStatus && (
            <div className="ticket-action-card">
              <h3>Update status</h3>
              <div className="ticket-status-actions">
                {statusButtons.map((nextStatus) => (
                  <button
                    key={nextStatus}
                    type="button"
                    className="btn-ghost"
                    disabled={statusMutation.isPending || ticket.status === nextStatus}
                    onClick={async () => {
                      try {
                        await statusMutation.mutateAsync({
                          id: ticket.id,
                          payload: { status: nextStatus, notes: notes.trim() || undefined },
                        });
                        toast.success(`Ticket moved to ${nextStatus.replace('_', ' ')}`);
                        setNotes('');
                      } catch {
                        toast.error('Unable to update ticket status');
                      }
                    }}
                  >
                    {nextStatus.replace('_', ' ')}
                  </button>
                ))}
              </div>
              <textarea
                className="ticket-textarea"
                rows={3}
                placeholder="Optional note for the status change"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </div>
          )}

          {canAssign && (
            <div className="ticket-action-card">
              <h3>Assign technician</h3>
              <div className="ticket-search-row">
                <select
                  className="ticket-input"
                  value={selectedAssignedToId}
                  onChange={(event) => setAssignedToId(event.target.value)}
                >
                  <option value="">Select technician</option>
                  {technicians.map((technician) => (
                    <option key={technician.id} value={technician.id}>
                      {technician.fullName} · {technician.email}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={
                    assignMutation.isPending ||
                    !selectedAssignedToId ||
                    selectedAssignedToId === ticket.assignedToId
                  }
                  onClick={async () => {
                    try {
                      await assignMutation.mutateAsync({
                        id: ticket.id,
                        payload: {
                          assignedToId: selectedAssignedToId,
                          notes: 'Assigned from ticket details',
                        },
                      });
                      toast.success('Technician assigned');
                    } catch {
                      toast.error('Unable to assign technician');
                    }
                  }}
                >
                  Assign
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="ticket-panel">
          <div className="ticket-action-card">
            <h3>Add comment</h3>
            <textarea
              className="ticket-textarea"
              rows={4}
              placeholder="Write an update or question"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
            <button
              type="button"
              className="btn-primary"
              disabled={commentMutation.isPending || !comment.trim()}
              onClick={async () => {
                try {
                  await commentMutation.mutateAsync({
                    id: ticket.id,
                    payload: { text: comment.trim() },
                  });
                  toast.success('Comment added');
                  setComment('');
                } catch {
                  toast.error('Unable to add comment');
                }
              }}
            >
              Post Comment
            </button>
          </div>

          <div className="ticket-action-card">
            <h3>Add evidence</h3>
            <input
              key={evidenceInputKey}
              className="ticket-input"
              type="file"
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={(event) => setEvidenceFile(event.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              className="btn-primary"
              disabled={evidenceMutation.isPending || !evidenceFile}
              onClick={async () => {
                if (!evidenceFile) {
                  return;
                }

                try {
                  await evidenceMutation.mutateAsync({ id: ticket.id, file: evidenceFile });
                  toast.success('Evidence uploaded');
                  setEvidenceFile(null);
                  setEvidenceInputKey((prev) => prev + 1);
                } catch {
                  toast.error('Unable to upload evidence');
                }
              }}
            >
              Upload Evidence
            </button>
          </div>

          <div className="ticket-thread">
            <div className="ticket-thread-header">
              <h3>Comments</h3>
              <span>{ticket.comments.length}</span>
            </div>
            {ticket.comments.length === 0 ? (
              <p className="muted">No comments yet.</p>
            ) : (
              ticket.comments.map((entry) => (
                <article key={entry.id} className="ticket-thread-item">
                  <div className="ticket-thread-item-header">
                    <strong>{entry.userName}</strong>
                    <span>{new Date(entry.createdAt).toLocaleString()}</span>
                  </div>
                  <p>{entry.text}</p>
                </article>
              ))
            )}
          </div>

          <div className="ticket-thread">
            <div className="ticket-thread-header">
              <h3>Evidence</h3>
              <span>{ticket.evidence.length}</span>
            </div>
            {ticket.evidence.length === 0 ? (
              <p className="muted">No evidence uploaded yet.</p>
            ) : (
              ticket.evidence.map((entry) => (
                <a
                  key={entry.id}
                  className="ticket-evidence-item"
                  href={resolveEvidenceUrl(entry.url)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div>
                    <strong>{entry.uploadedByName}</strong>
                    <span>{new Date(entry.uploadedAt).toLocaleString()}</span>
                  </div>
                  <span>Open file</span>
                </a>
              ))
            )}
          </div>

          <div className="ticket-thread">
            <div className="ticket-thread-header">
              <h3>Status history</h3>
              <span>{ticket.statusHistory.length}</span>
            </div>
            {ticket.statusHistory.length === 0 ? (
              <p className="muted">No status changes yet.</p>
            ) : (
              ticket.statusHistory.map((entry) => (
                <article key={entry.id} className="ticket-thread-item">
                  <div className="ticket-thread-item-header">
                    <strong>{entry.changedByName}</strong>
                    <span>{new Date(entry.createdAt).toLocaleString()}</span>
                  </div>
                  <p>
                    {entry.oldStatus ?? 'None'} → {entry.newStatus}
                  </p>
                  {entry.notes && <p className="muted">{entry.notes}</p>}
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
