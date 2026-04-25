import { useNotificationStore } from '../../stores/notificationStore';
import { notificationApi } from '../../services/api/notificationApi';
import type { Notification } from '../../services/api/notificationApi';
import { Link } from 'react-router-dom';

/* ─── Helpers ──────────────────────────────────────────────────── */

function formatRelativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs} hr ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

type AccentKey = 'rose' | 'purple' | 'teal' | 'amber' | 'blue';

function getTypeMeta(type: string): { icon: string; accent: AccentKey } {
  if (type.includes('SECURITY')) return { icon: '🔐', accent: 'rose' };
  if (type.includes('TICKET')) return { icon: '🎫', accent: 'purple' };
  if (type.includes('BOOKING')) return { icon: '📅', accent: 'teal' };
  if (type.includes('REMINDER')) return { icon: '⏰', accent: 'amber' };
  return { icon: '🔔', accent: 'blue' };
}

/* ─── Single Notification Item ─────────────────────────────────── */

function NotificationItem({ notification }: { notification: Notification }) {
  const { markRead, removeNotification } = useNotificationStore();

  const handleMarkRead = async () => {
    if (notification.read) return;
    try {
      await notificationApi.markAsRead(notification.id);
      markRead(notification.id);
    } catch {
      /* silent */
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationApi.deleteNotification(notification.id);
      removeNotification(notification.id);
    } catch {
      /* silent */
    }
  };

  const { icon, accent } = getTypeMeta(notification.type);

  return (
    <div
      id={`notification-panel-${notification.id}`}
      onClick={!notification.read ? handleMarkRead : undefined}
      role={!notification.read ? 'button' : undefined}
      tabIndex={!notification.read ? 0 : undefined}
      className={`np-item ${notification.read ? 'np-item--read' : 'np-item--unread'}`}
    >
      {/* Unread dot */}
      {!notification.read && <span className="np-unread-dot" />}

      {/* Icon */}
      <div className={`np-icon np-icon--${accent}`}>{icon}</div>

      {/* Text */}
      <div className="np-text">
        <p className={`np-item-title ${notification.read ? 'np-item-title--read' : ''}`}>
          {notification.title}
        </p>
        {notification.message && <p className="np-item-msg">{notification.message}</p>}
        <span className="np-item-time">{formatRelativeTime(notification.createdAt)}</span>
      </div>

      {/* Delete */}
      <button
        type="button"
        onClick={handleDelete}
        aria-label="Delete notification"
        className="np-delete-btn"
      >
        ✕
      </button>
    </div>
  );
}

/* ─── Panel ────────────────────────────────────────────────────── */

export function NotificationPanel() {
  const { notifications, markAllRead } = useNotificationStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      markAllRead();
    } catch {
      /* silent */
    }
  };

  return (
    <div id="notification-panel" role="dialog" aria-label="Notifications" className="np-panel">
      {/* Header */}
      <div className="np-header">
        <div className="np-header-left">
          <h3 className="np-header-title">Notifications</h3>
          {unreadCount > 0 && <span className="np-header-badge">{unreadCount}</span>}
        </div>
        <div className="np-header-actions">
          <button
            type="button"
            id="btn-mark-all-read"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="np-mark-all-btn"
          >
            Mark all read
          </button>
          <Link
            to="/notifications/preferences"
            className="np-prefs-btn"
            title="Notification preferences"
          >
            ⚙
          </Link>
        </div>
      </div>

      {/* Body */}
      <div className="np-body">
        {notifications.length === 0 ? (
          <div className="np-empty">
            <span className="np-empty-icon">🔔</span>
            <p className="np-empty-title">All caught up!</p>
            <p className="np-empty-sub">No notifications right now.</p>
          </div>
        ) : (
          <div className="np-list">
            {notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="np-footer">
        <Link to="/notifications" className="np-view-all-btn">
          View all notifications →
        </Link>
      </div>
    </div>
  );
}
