import { useEffect, useMemo, useState } from 'react';
import { Bell, CalendarDays, Megaphone, Save, ShieldCheck, Ticket, Timer } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  notificationApi,
  type NotificationPreferences,
} from '../../../services/api/notificationApi';

const preferenceOptions: Array<{
  key: keyof NotificationPreferences;
  title: string;
  description: string;
  icon: typeof Bell;
}> = [
  {
    key: 'bookingNotifications',
    title: 'Booking Notifications',
    description: 'Facility booking approvals, rejections, cancellations, and schedule changes.',
    icon: CalendarDays,
  },
  {
    key: 'ticketNotifications',
    title: 'Ticket Notifications',
    description: 'Ticket assignments, status updates, comments, and resolution alerts.',
    icon: Ticket,
  },
  {
    key: 'securityNotifications',
    title: 'Security Alerts',
    description: 'Suspicious sign-ins, account protection warnings, and sensitive account changes.',
    icon: ShieldCheck,
  },
  {
    key: 'reminderNotifications',
    title: 'Reminders',
    description: 'Upcoming bookings, overdue tickets, and time-sensitive campus tasks.',
    icon: Timer,
  },
  {
    key: 'generalNotifications',
    title: 'General Updates',
    description: 'System announcements, maintenance notices, and other campus updates.',
    icon: Megaphone,
  },
];

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
    notificationApi
      .getPreferences()
      .then(setPreferences)
      .catch(() => toast.error('Failed to load notification preferences'))
      .finally(() => setLoading(false));
  }, []);

  const enabledCount = useMemo(
    () => preferenceOptions.filter((option) => preferences[option.key]).length,
    [preferences],
  );

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

  if (loading) {
    return (
      <main className="page-shell" id="notification-preferences">
        <div className="notification-loading">Loading preferences...</div>
      </main>
    );
  }

  return (
    <main className="page-shell animate-fade-up" id="notification-preferences">
      <header className="notification-hero">
        <h1>Notification Preferences</h1>
        <p>Choose which Smart Campus alerts should reach you.</p>
      </header>

      <section className="preference-overview-grid" aria-label="Preferences summary">
        <article className="notification-summary-card">
          <div className="notification-card-icon blue">
            <Bell size={20} aria-hidden="true" />
          </div>
          <div>
            <h3>Enabled Categories</h3>
            <p>
              {enabledCount} of {preferenceOptions.length} notification categories are active.
            </p>
          </div>
        </article>
        <article className="notification-summary-card">
          <div className="notification-card-icon teal">
            <ShieldCheck size={20} aria-hidden="true" />
          </div>
          <div>
            <h3>Recommended</h3>
            <p>Keep security alerts enabled so account warnings are never missed.</p>
          </div>
        </article>
      </section>

      <section className="preferences-panel" aria-labelledby="preferences-heading">
        <div className="notifications-toolbar">
          <div>
            <h2 id="preferences-heading">Alert Categories</h2>
            <p>Turn individual update streams on or off.</p>
          </div>
          <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={16} aria-hidden="true" />
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>

        <div className="preferences-list">
          {preferenceOptions.map((option) => {
            const Icon = option.icon;
            const checked = preferences[option.key];
            return (
              <label
                className={`preference-card ${checked ? 'enabled' : ''}`}
                htmlFor={`pref-${option.key}`}
                key={option.key}
              >
                <span className="preference-icon">
                  <Icon size={19} aria-hidden="true" />
                </span>
                <span className="toggle-text">
                  <strong>{option.title}</strong>
                  <p>{option.description}</p>
                </span>
                <input
                  id={`pref-${option.key}`}
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleToggle(option.key)}
                />
                <span className="preference-switch" aria-hidden="true" />
              </label>
            );
          })}
        </div>
      </section>
    </main>
  );
}
