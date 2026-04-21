import { useEffect, useState } from 'react';
import { securityApi, type SecurityActivityLog } from '../../../services/api/securityApi';
import toast from 'react-hot-toast';

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

export function SecurityActivityPage() {
  const [logs, setLogs] = useState<SecurityActivityLog[]>([]);
  const [suspiciousLogs, setSuspiciousLogs] = useState<SecurityActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [ackLoading, setAckLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      securityApi.getActivity(0, 50),
      securityApi.getSuspiciousActivity()
    ])
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
      setSuspiciousLogs((prev) => prev.map((log) => ({
        ...log,
        acknowledgedAt: log.acknowledgedAt ?? new Date().toISOString(),
      })));
      toast.success('Security alert acknowledged');
    } catch {
      toast.error('Failed to acknowledge alert');
    } finally {
      setAckLoading(false);
    }
  };

  if (loading) return <main className="page-shell">Loading activity...</main>;

  return (
    <main className="page-shell" id="security-activity">
      <header className="page-header">
        <h1>Account Security Activity</h1>
        <p>Review recent sign-ins and security events on your account.</p>
      </header>

      {unacknowledgedSuspicious.length > 0 && (
        <section className="dashboard-alert warning" role="alert">
          <span>⚠️</span>
          <div>
            <strong>Suspicious Activity Detected</strong>
            <p>We noticed unusual login attempts on your account. If this wasn't you, please change your password immediately.</p>
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

      <section className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Date & Time</th>
              <th>IP Address</th>
              <th>Location</th>
              <th>Device / Browser</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center">No recent security activity.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className={log.suspicious || log.eventType === 'LOGIN_FAILED' ? 'row-warning' : ''}>
                  <td>
                    <span className={`status-badge ${log.suspicious || log.eventType === 'LOGIN_FAILED' ? 'rejected' : 'approved'}`}>
                      {getEventLabel(log.eventType)}
                    </span>
                  </td>
                  <td>{formatDateTime(log.createdAt)}</td>
                  <td>{log.ipAddress || 'Unknown'}</td>
                  <td>{log.location || 'Unknown'}</td>
                  <td>
                    <span title={log.userAgent} className="truncate-text">
                      {log.userAgent || 'Unknown Device'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
