import { useEffect, useState } from 'react';
import { notificationApi, type NotificationPreferences } from '../../../services/api/notificationApi';
import toast from 'react-hot-toast';

export function NotificationPreferencesPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    bookingNotifications: true,
    ticketNotifications: true,
    securityNotifications: true,
    reminderNotifications: true,
    generalNotifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    notificationApi.getPreferences()
      .then(setPreferences)
      .catch(() => toast.error('Failed to load notification preferences'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences((prev: NotificationPreferences) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await notificationApi.updatePreferences(preferences);
      toast.success('Notification preferences updated');
    } catch {
      toast.error('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className="page-shell">Loading preferences...</main>;

  return (
    <main className="page-shell" id="notification-preferences">
      <header className="page-header">
        <h1>Notification Preferences</h1>
        <p>Manage how you receive alerts and updates from the Smart Campus system.</p>
      </header>

      <section className="form-section">
        <div className="preferences-list">
          <label className="toggle-label" htmlFor="pref-booking">
            <div className="toggle-text">
              <strong>Booking Notifications</strong>
              <p>Updates on your facility booking approvals, rejections, and cancellations.</p>
            </div>
            <input
              id="pref-booking"
              type="checkbox"
              checked={preferences.bookingNotifications}
              onChange={() => handleToggle('bookingNotifications')}
            />
          </label>

          <label className="toggle-label" htmlFor="pref-ticket">
            <div className="toggle-text">
              <strong>Ticket Notifications</strong>
              <p>Alerts when tickets are assigned, updated, or resolved.</p>
            </div>
            <input
              id="pref-ticket"
              type="checkbox"
              checked={preferences.ticketNotifications}
              onChange={() => handleToggle('ticketNotifications')}
            />
          </label>

          <label className="toggle-label" htmlFor="pref-security">
            <div className="toggle-text">
              <strong>Security Alerts</strong>
              <p>Important security alerts, such as suspicious login activity.</p>
            </div>
            <input
              id="pref-security"
              type="checkbox"
              checked={preferences.securityNotifications}
              onChange={() => handleToggle('securityNotifications')}
            />
          </label>

          <label className="toggle-label" htmlFor="pref-reminder">
            <div className="toggle-text">
              <strong>Reminders</strong>
              <p>Reminders for upcoming bookings and overdue tickets.</p>
            </div>
            <input
              id="pref-reminder"
              type="checkbox"
              checked={preferences.reminderNotifications}
              onChange={() => handleToggle('reminderNotifications')}
            />
          </label>

          <label className="toggle-label" htmlFor="pref-general">
            <div className="toggle-text">
              <strong>General Updates</strong>
              <p>Other system updates and announcements.</p>
            </div>
            <input
              id="pref-general"
              type="checkbox"
              checked={preferences.generalNotifications}
              onChange={() => handleToggle('generalNotifications')}
            />
          </label>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </section>
    </main>
  );
}
