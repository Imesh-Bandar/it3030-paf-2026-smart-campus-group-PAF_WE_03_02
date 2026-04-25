import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { notificationApi, type Notification } from '../../services/api/notificationApi';
import { useNotificationStore } from '../../stores/notificationStore';

/* ─── Helpers ──────────────────────────────────────────────────── */

function formatRelativeTime(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

type AccentKey = 'rose' | 'purple' | 'teal' | 'blue' | 'amber';

interface TypeMeta {
  icon: string;
  label: string;
  accent: AccentKey;
}

function getTypeMeta(type: string): TypeMeta {
  if (type.includes('SECURITY')) return { icon: '🔐', label: 'Security', accent: 'rose' };
  if (type.includes('TICKET')) return { icon: '🎫', label: 'Ticket', accent: 'purple' };
  if (type.includes('BOOKING')) return { icon: '📅', label: 'Booking', accent: 'teal' };
  if (type.includes('REMINDER')) return { icon: '⏰', label: 'Reminder', accent: 'amber' };
  return { icon: '🔔', label: 'General', accent: 'blue' };
}

/* ─── Notification Row ─────────────────────────────────────────── */

function NotificationRow({
  notification,
  onRefresh,
}: {
  notification: Notification;
  onRefresh: () => Promise<void>;
}) {
  const markRead = useNotificationStore((s) => s.markRead);
  const removeNotification = useNotificationStore((s) => s.removeNotification);

  const { icon, label, accent } = getTypeMeta(notification.type);

  const handleMarkRead = async () => {
    if (notification.read) return;
    try {
      await notificationApi.markAsRead(notification.id);
      markRead(notification.id);
      await onRefresh();
    } catch {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationApi.deleteNotification(notification.id);
      removeNotification(notification.id);
      await onRefresh();
      toast.success('Notification deleted');
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  return (
    <article
      id={`notification-${notification.id}`}
      onClick={!notification.read ? handleMarkRead : undefined}
      role={!notification.read ? 'button' : undefined}
      tabIndex={!notification.read ? 0 : undefined}
      className={`notif-row ${notification.read ? 'notif-row--read' : 'notif-row--unread'}`}
    >
      {/* Unread dot */}
      {!notification.read && <span className="notif-unread-dot" />}

      {/* Icon */}
      <div className={`notif-icon-wrap notif-icon-wrap--${accent}`}>{icon}</div>

      {/* Body */}
      <div className="notif-body">
        {/* Title + "New" badge */}
        <div className="notif-title-row">
          <h3 className="notif-title">{notification.title}</h3>
          {!notification.read && <span className="notif-new-badge">New</span>}
        </div>

        {/* Message */}
        <p className="notif-message">{notification.message}</p>

        {/* Meta row */}
        <div className="notif-meta">
          <span className={`notif-type-badge notif-type-badge--${accent}`}>{label}</span>
          {notification.referenceType && (
            <span className="notif-ref-badge">{notification.referenceType}</span>
          )}
          <span className="notif-time">🕐 {formatRelativeTime(notification.createdAt)}</span>
        </div>

        {/* Actions */}
        <div className="notif-actions">
          {!notification.read && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void handleMarkRead();
              }}
              className="notif-btn-read"
            >
              ✓ Mark as read
            </button>
          )}
          <button type="button" onClick={handleDelete} className="notif-btn-delete">
            🗑 Delete
          </button>
        </div>
      </div>
    </article>
  );
}

/* ─── Page ─────────────────────────────────────────────────────── */

export function NotificationsPage() {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  const markAllRead = useNotificationStore((s) => s.markAllRead);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const [pageData, unread] = await Promise.all([
        notificationApi.getAll(page, pageSize),
        notificationApi.getUnreadCount(),
      ]);
      setNotifications(pageData.content);
      setTotalPages(pageData.totalPages || 1);
      setUnreadCount(unread);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const unreadNotifications = useMemo(() => notifications.filter((n) => !n.read), [notifications]);

  const handleMarkAllRead = async () => {
    setSaving(true);
    try {
      await notificationApi.markAllAsRead();
      markAllRead();
      setUnreadCount(0);
      await loadNotifications();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to update notifications');
    } finally {
      setSaving(false);
    }
  };

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <main className="notif-page" id="notifications-page">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="notif-skeleton">
            <div className="notif-skeleton-icon" />
            <div className="notif-skeleton-body">
              <div className="notif-skeleton-line notif-skeleton-line--title" />
              <div className="notif-skeleton-line notif-skeleton-line--msg" />
              <div className="notif-skeleton-line notif-skeleton-line--meta" />
            </div>
          </div>
        ))}
      </main>
    );
  }

  return (
    <main className="notif-page" id="notifications-page">
      {/* ── Page Header ── */}
      <header className="notif-page-header">
        <h1 className="notif-page-title">Notifications</h1>
        <p className="notif-page-subtitle">
          Track booking updates, ticket changes, and security alerts in one place.
        </p>
      </header>

      {/* ── Summary Cards ── */}
      <section aria-label="Notification summary" className="notif-summary-grid">
        <div className="notif-summary-card notif-summary-card--amber">
          <span className="notif-summary-icon">🔔</span>
          <div>
            <p className="notif-summary-label">Unread</p>
            <p className="notif-summary-value">{unreadCount}</p>
          </div>
        </div>

        <Link
          to="/account/security"
          className="notif-summary-card notif-summary-card--rose notif-summary-card--link"
        >
          <span className="notif-summary-icon">🔐</span>
          <div>
            <p className="notif-summary-label">Security</p>
            <p className="notif-summary-link-text">View activity →</p>
          </div>
        </Link>

        <Link
          to="/notifications/preferences"
          className="notif-summary-card notif-summary-card--blue notif-summary-card--link"
        >
          <span className="notif-summary-icon">⚙️</span>
          <div>
            <p className="notif-summary-label">Preferences</p>
            <p className="notif-summary-link-text">Manage alerts →</p>
          </div>
        </Link>
      </section>

      {/* ── Notifications List ── */}
      <section aria-labelledby="notifications-list-heading">
        {/* Toolbar */}
        <div className="notif-toolbar">
          <div>
            <h2 id="notifications-list-heading" className="notif-list-heading">
              Recent Notifications
            </h2>
            <p className="notif-list-subheading">
              {unreadNotifications.length} unread on this page
            </p>
          </div>
          <button
            type="button"
            id="btn-mark-all-read"
            onClick={handleMarkAllRead}
            disabled={saving || unreadCount === 0}
            className="notif-mark-all-btn"
          >
            {saving ? 'Updating…' : '✓ Mark All Read'}
          </button>
        </div>

        {/* Items */}
        <div className="notif-list">
          {notifications.length === 0 ? (
            <div className="notif-empty">
              <span className="notif-empty-icon">🔔</span>
              <p className="notif-empty-title">No notifications yet</p>
              <p className="notif-empty-sub">
                Booking, ticket and security updates will appear here.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onRefresh={loadNotifications}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="notif-pagination">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="notif-page-btn"
            >
              ← Previous
            </button>
            <span className="notif-page-info">
              Page <strong>{page + 1}</strong> of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="notif-page-btn"
            >
              Next →
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
