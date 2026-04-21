import { useEffect, useRef, useCallback } from 'react';
import { useNotificationStore } from '../../stores/notificationStore';
import { notificationApi } from '../../services/api/notificationApi';
import { useAuthStore } from '../../stores/authStore';
import { NotificationPanel } from './NotificationPanel';

function BellIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

export function NotificationBell() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { unreadCount, isOpen, setNotifications, setUnreadCount, toggleOpen, closePanel } =
    useNotificationStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Silently fail if backend not ready
    }
  }, [isAuthenticated, setUnreadCount]);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const page = await notificationApi.getAll(0, 10);
      setNotifications(page.content);
    } catch {
      // Silently fail
    }
  }, [isAuthenticated, setNotifications]);

  // Poll unread count every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30_000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUnreadCount]);

  // Fetch notifications when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Close panel on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(e.target as Node)
      ) {
        closePanel();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [closePanel]);

  if (!isAuthenticated) return null;

  return (
    <div className="notification-bell-wrapper" style={{ position: 'relative' }}>
      <button
        ref={bellRef}
        type="button"
        id="btn-notification-bell"
        className="btn-ghost"
        onClick={toggleOpen}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
        style={{ position: 'relative', padding: '8px' }}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span
            className="notification-badge"
            aria-label={`${unreadCount} unread notifications`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div ref={panelRef}>
          <NotificationPanel />
        </div>
      )}
    </div>
  );
}
