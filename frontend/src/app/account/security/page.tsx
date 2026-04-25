import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Globe2,
  Laptop,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { securityApi, type SecurityActivityLog } from '../../../services/api/securityApi';

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function getEventLabel(type: string) {
  const map: Record<string, string> = {
    LOGIN_SUCCESS: 'Successful Login',
    LOGIN_FAILED: 'Failed Login Attempt',
    LOGOUT: 'Logout',
    TOKEN_REFRESH: 'Session Refresh',
    OAUTH_LOGIN: 'Google Login',
    PASSWORD_CHANGED: 'Password Changed',
    ROLE_CHANGED: 'Role Changed',
    SUSPICIOUS_LOGIN: 'Suspicious Login',
  };
  return map[type] || type;
}

function getEventIcon(type: string, suspicious: boolean) {
  if (suspicious || type === 'LOGIN_FAILED') return <AlertTriangle size={18} aria-hidden="true" />;
  if (type === 'LOGIN_SUCCESS' || type === 'OAUTH_LOGIN') {
    return <CheckCircle2 size={18} aria-hidden="true" />;
  }
  return <ShieldCheck size={18} aria-hidden="true" />;
}

export function SecurityActivityPage() {
  const [logs, setLogs] = useState<SecurityActivityLog[]>([]);
  const [suspiciousLogs, setSuspiciousLogs] = useState<SecurityActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [ackLoading, setAckLoading] = useState(false);

  useEffect(() => {
    Promise.all([securityApi.getActivity(0, 50), securityApi.getSuspiciousActivity()])
      .then(([page, suspicious]) => {
        setLogs(page.content);
        setSuspiciousLogs(suspicious);
      })
      .catch(() => toast.error('Failed to load security activity'))
      .finally(() => setLoading(false));
  }, []);

  const unacknowledgedSuspicious = suspiciousLogs.filter((log) => !log.acknowledgedAt);

  const handleAcknowledgeSuspicious = async () => {
    setAckLoading(true);
    try {
      await securityApi.acknowledgeSuspicious();
      setSuspiciousLogs((prev) =>
        prev.map((log) => ({
          ...log,
          acknowledgedAt: log.acknowledgedAt ?? new Date().toISOString(),
        })),
      );
      toast.success('Security alert acknowledged');
    } catch {
      toast.error('Failed to acknowledge alert');
    } finally {
      setAckLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="page-shell" id="security-activity">
        <div className="security-loading">Loading activity...</div>
      </main>
    );
  }

  return (
    <main className="page-shell animate-fade-up" id="security-activity">
      <header className="security-hero">
        <div>
          <p className="section-eyebrow">Account protection</p>
          <h1>Security Activity</h1>
          <p>Review recent sign-ins and security events on your account.</p>
        </div>
        <div className="security-hero-icon">
          <ShieldCheck size={28} aria-hidden="true" />
        </div>
      </header>

      <section className="security-summary-grid" aria-label="Security summary">
        <article className="security-summary-card">
          <ShieldCheck size={20} aria-hidden="true" />
          <div>
            <span>Total events</span>
            <strong>{logs.length}</strong>
          </div>
        </article>
        <article className="security-summary-card warning">
          <AlertTriangle size={20} aria-hidden="true" />
          <div>
            <span>Needs review</span>
            <strong>{unacknowledgedSuspicious.length}</strong>
          </div>
        </article>
        <article className="security-summary-card">
          <Clock3 size={20} aria-hidden="true" />
          <div>
            <span>Latest event</span>
            <strong>{logs[0] ? formatDateTime(logs[0].createdAt) : 'None'}</strong>
          </div>
        </article>
      </section>

      <section className="security-guidance-card">
        <div>
          <h2>Keep your account protected</h2>
          <p>
            Check unfamiliar devices, failed sign-ins, or locations you do not recognize. Change
            your password if anything looks unusual.
          </p>
        </div>
      </section>

      {unacknowledgedSuspicious.length > 0 && (
        <section className="security-alert" role="alert">
          <AlertTriangle size={22} aria-hidden="true" />
          <div>
            <strong>Suspicious Activity Detected</strong>
            <p>
              We noticed unusual login attempts on your account. If this was not you, please change
              your password immediately.
            </p>
          </div>
          <button
            type="button"
            className="btn-ghost"
            onClick={handleAcknowledgeSuspicious}
            disabled={ackLoading}
            aria-label="Acknowledge suspicious activity alert"
          >
            {ackLoading ? 'Acknowledging...' : 'Acknowledge'}
          </button>
        </section>
      )}

      <section className="security-activity-panel" aria-labelledby="security-activity-heading">
        <div className="security-panel-header">
          <div>
            <h2 id="security-activity-heading">Recent Activity</h2>
            <p>Latest sign-ins and account security events.</p>
          </div>
        </div>

        <div className="security-activity-list">
          {logs.length === 0 ? (
            <article className="security-empty-state">No recent security activity.</article>
          ) : (
            logs.map((log) => (
              <article
                key={log.id}
                className={`security-activity-card ${
                  log.suspicious || log.eventType === 'LOGIN_FAILED' ? 'warning' : ''
                }`}
              >
                <div className="security-event-icon">
                  {getEventIcon(log.eventType, log.suspicious)}
                </div>
                <div className="security-event-body">
                  <div className="security-event-header">
                    <h3>{getEventLabel(log.eventType)}</h3>
                    <span>{formatDateTime(log.createdAt)}</span>
                  </div>
                  <div className="security-event-meta">
                    <span>
                      <Globe2 size={14} aria-hidden="true" />
                      {log.ipAddress || 'Unknown IP'}
                    </span>
                    <span>
                      <MapPin size={14} aria-hidden="true" />
                      {log.location || 'Unknown location'}
                    </span>
                    <span title={log.userAgent}>
                      <Laptop size={14} aria-hidden="true" />
                      {log.userAgent || 'Unknown device'}
                    </span>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
