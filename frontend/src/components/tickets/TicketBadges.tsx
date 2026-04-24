import type { TicketPriority, TicketStatus } from '../../services/types/ticket';

const statusLabels: Record<TicketStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REJECTED: 'Rejected',
};

const priorityLabels: Record<TicketPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={`ticket-badge status-${status.toLowerCase()}`}>{statusLabels[status]}</span>
  );
}

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <span className={`ticket-badge priority-${priority.toLowerCase()}`}>
      {priorityLabels[priority]}
    </span>
  );
}

export function SlaBadge({ breached }: { breached: boolean }) {
  return (
    <span className={`ticket-badge ${breached ? 'sla-breached' : 'sla-ok'}`}>
      {breached ? 'SLA risk' : 'On SLA'}
    </span>
  );
}
