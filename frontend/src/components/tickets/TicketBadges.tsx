import type { TicketPriority, TicketStatus } from '../../services/types/ticket';
import { formatStatusLabel } from './ticketUi';

const statusLabels: Record<TicketStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REJECTED: 'Rejected',
};

const statusStyles: Record<TicketStatus, string> = {
  OPEN: 'status-open',
  IN_PROGRESS: 'status-in_progress',
  RESOLVED: 'status-resolved',
  CLOSED: 'status-closed',
  REJECTED: 'status-closed',
};

const priorityStyles: Record<TicketPriority, string> = {
  LOW: 'priority-low',
  MEDIUM: 'priority-medium',
  HIGH: 'priority-high',
  CRITICAL: 'priority-critical',
};

const baseBadge = 'ticket-badge';

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={`${baseBadge} ${statusStyles[status]}`} title={formatStatusLabel(status)}>
      {statusLabels[status]}
    </span>
  );
}

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  return <span className={`${baseBadge} ${priorityStyles[priority]}`}>{priority}</span>;
}

export function SlaBadge({ breached }: { breached: boolean }) {
  return (
    <span className={`${baseBadge} ${breached ? 'sla-breached' : 'sla-ok'}`}>
      {breached ? 'SLA risk' : 'On SLA'}
    </span>
  );
}
