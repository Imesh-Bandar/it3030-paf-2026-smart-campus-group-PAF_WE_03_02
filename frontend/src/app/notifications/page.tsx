import { useEffect, useMemo, useState } from 'react';
import { Bell, CalendarDays, CheckCheck, Cog, ShieldCheck, Ticket, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { notificationApi, type Notification } from '../../services/api/notificationApi';
import { useNotificationStore } from '../../stores/notificationStore';

function formatRelativeTime(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getNotificationAccent(type: string) {
  if (type.includes('SECURITY')) return 'rose';
  if (type.includes('TICKET')) return 'purple';
  if (type.includes('BOOKING')) return 'teal';
  return 'blue';
}

function NotificationTypeIcon({ type, size }: { type: string; size: number }) {
  if (type.includes('SECURITY')) return <ShieldCheck size={size} aria-hidden="true" />;
  if (type.includes('TICKET')) return <Ticket size={size} aria-hidden="true" />;
  if (type.includes('BOOKING')) return <CalendarDays size={size} aria-hidden="true" />;
  return <Bell size={size} aria-hidden="true" />;
}

function NotificationRow({
  notification,
  onRefresh,
}: {
  notification: Notification;
  onRefresh: () => Promise<void>;
}) {
  const markRead = useNotificationStore((state) => state.markRead);
  const removeNotification = useNotificationStore((state) => state.removeNotification);

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

  const handleDelete = async () => {
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
      className={`notification-card ${notification.read ? '' : 'unread'}`}
      onClick={!notification.read ? handleMarkRead : undefined}
      role={!notification.read ? 'button' : undefined}
      tabIndex={!notification.read ? 0 : undefined}
      id={`notification-${notification.id}`}
    >
      <div className={`notification-card-icon ${getNotificationAccent(notification.type)}`}>
        <NotificationTypeIcon type={notification.type} size={20} />
      </div>
      <div className="notification-row-body">
        <div className="notification-row-header">
          <div>
            <h3>{notification.title}</h3>
            <p>{notification.message}</p>
          </div>
          {!notification.read && <span className="quick-action-badge">New</span>}
        </div>
        <div className="notification-row-meta">
          <span>{notification.type.replace(/_/g, ' ')}</span>
          <span>{formatRelativeTime(notification.createdAt)}</span>
          {notification.referenceType && <span>{notification.referenceType}</span>}
        </div>
        <div className="notification-row-actions">
          {!notification.read && (
            <button
              type="button"
              className="btn-ghost"
              onClick={(event) => {
                event.stopPropagation();
                void handleMarkRead();
              }}
            >
              <CheckCheck size={15} aria-hidden="true" />
              Mark read
            </button>
          )}
          <button
            type="button"
            className="btn-ghost btn-danger"
            onClick={(event) => {
              event.stopPropagation();
              void handleDelete();
            }}
          >
            <Trash2 size={15} aria-hidden="true" />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export function NotificationsPage() {
  const [page, setPage] = useState(0);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const setNotifications = useNotificationStore((state) => state.setNotifications);
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  const markAllRead = useNotificationStore((state) => state.markAllRead);

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

  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !notification.read),
    [notifications],
  );

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

  if (loading) {
    return (
      <main className="page-shell" id="notifications-page">
        <div className="notification-loading">Loading notifications...</div>
      </main>
    );
  }

  return (
    <main className="page-shell animate-fade-up" id="notifications-page">
      <header className="notification-hero">
        <h1>Notifications</h1>
        <p>Track booking updates, ticket changes, and security alerts in one place.</p>
      </header>

      <section className="notification-summary-grid" aria-label="Notification summary">
        <article className="notification-summary-card">
          <div className="notification-card-icon amber">
            <Bell size={20} aria-hidden="true" />
          </div>
          <div>
            <h3>Unread Alerts</h3>
            <p>
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}.
            </p>
          </div>
        </article>
        <article className="notification-summary-card">
          <div className="notification-card-icon rose">
            <ShieldCheck size={20} aria-hidden="true" />
          </div>
          <div>
            <h3>Security Settings</h3>
            <p>Review your account activity and suspicious login history.</p>
            <Link to="/account/security" className="dashboard-card-link">
              View Security Activity
            </Link>
          </div>
        </article>
        <article className="notification-summary-card">
          <div className="notification-card-icon blue">
            <Cog size={20} aria-hidden="true" />
          </div>
          <div>
            <h3>Preferences</h3>
            <p>Choose which categories of updates you want to receive.</p>
            <Link to="/notifications/preferences" className="dashboard-card-link">
              Manage Preferences
            </Link>
          </div>
        </article>
      </section>

      <section className="notifications-panel" aria-labelledby="notifications-list-heading">
        <div className="notifications-toolbar">
          <div>
            <h2 id="notifications-list-heading">Recent Notifications</h2>
            <p>
              {unreadNotifications.length} unread item{unreadNotifications.length !== 1 ? 's' : ''}{' '}
              in the current page.
            </p>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={handleMarkAllRead}
            disabled={saving || unreadCount === 0}
          >
            <CheckCheck size={16} aria-hidden="true" />
            {saving ? 'Updating...' : 'Mark All Read'}
          </button>
        </div>

        <div className="notifications-list">
          {notifications.length === 0 ? (
            <article className="notification-empty-state">
              <Bell size={28} aria-hidden="true" />
              <div>
                <h3>No notifications yet</h3>
                <p>You will see booking, ticket, and security updates here when they arrive.</p>
              </div>
            </article>
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

        {totalPages > 1 && (
          <div className="pagination-bar">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              disabled={page === 0}
            >
              Previous
            </button>
            <span>
              Page {page + 1} of {totalPages}
            </span>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
              disabled={page >= totalPages - 1}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
