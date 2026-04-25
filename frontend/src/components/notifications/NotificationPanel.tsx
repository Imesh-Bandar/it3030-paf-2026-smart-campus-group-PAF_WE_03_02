import type { MouseEvent } from 'react';
import { Bell, CalendarDays, CheckCheck, Cog, ShieldCheck, Ticket, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { notificationApi } from '../../services/api/notificationApi';
import type { Notification } from '../../services/api/notificationApi';
import { useNotificationStore } from '../../stores/notificationStore';

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

function NotificationTypeIcon({ type }: { type: string }) {
  if (type.startsWith('BOOKING')) return <CalendarDays size={17} aria-hidden="true" />;
  if (type.startsWith('TICKET')) return <Ticket size={17} aria-hidden="true" />;
  if (type.startsWith('ACCOUNT_SECURITY')) return <ShieldCheck size={17} aria-hidden="true" />;
  return <Bell size={17} aria-hidden="true" />;
}

function NotificationItem({ notification }: { notification: Notification }) {
  const { markRead, removeNotification } = useNotificationStore();

  const handleMarkRead = async () => {
    try {
      await notificationApi.markAsRead(notification.id);
      markRead(notification.id);
    } catch {
      // ignore
    }
  };

  const handleDelete = async (event: MouseEvent) => {
    event.stopPropagation();
    try {
      await notificationApi.deleteNotification(notification.id);
      removeNotification(notification.id);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className={`notification-item${notification.read ? '' : ' unread'}`}
      onClick={!notification.read ? handleMarkRead : undefined}
      role={!notification.read ? 'button' : undefined}
      tabIndex={!notification.read ? 0 : undefined}
      id={`notification-${notification.id}`}
    >
      <span className="notification-item-icon">
        <NotificationTypeIcon type={notification.type} />
      </span>
      <div className="notification-item-body">
        <p className="notification-item-title">{notification.title}</p>
        {notification.message && <p className="notification-item-msg">{notification.message}</p>}
        <span className="notification-item-time">{formatRelativeTime(notification.createdAt)}</span>
      </div>
      <button
        type="button"
        className="notification-item-delete"
        onClick={handleDelete}
        aria-label="Delete notification"
        title="Delete"
      >
        <Trash2 size={15} aria-hidden="true" />
      </button>
    </div>
  );
}

export function NotificationPanel() {
  const { notifications, markAllRead } = useNotificationStore();

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      markAllRead();
    } catch {
      // ignore
    }
  };

  return (
    <div
      className="notification-panel"
      id="notification-panel"
      role="dialog"
      aria-label="Notifications"
    >
      <div className="notification-panel-header">
        <h3>Notifications</h3>
        <div className="notification-panel-actions">
          <button
            type="button"
            className="btn-ghost notification-panel-action"
            onClick={handleMarkAllRead}
            id="btn-mark-all-read"
          >
            <CheckCheck size={14} aria-hidden="true" />
            Mark all read
          </button>
          <Link
            to="/notifications/preferences"
            className="btn-ghost notification-panel-icon-action"
            aria-label="Notification preferences"
          >
            <Cog size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="notification-panel-body">
        {notifications.length === 0 ? (
          <div className="notification-empty">
            <Bell size={26} aria-hidden="true" />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))
        )}
      </div>

      <div className="notification-panel-footer">
        <Link to="/notifications" className="btn-ghost notification-panel-view-all">
          View all notifications
        </Link>
      </div>
    </div>
  );
}
