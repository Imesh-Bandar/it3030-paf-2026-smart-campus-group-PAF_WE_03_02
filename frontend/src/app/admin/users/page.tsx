import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { RefreshCw, ShieldCheck, UserCheck, UserX, Users } from 'lucide-react';
import { authApi } from '../../../services/api/authApi';
import type { User } from '../../../services/types/user';

type AdminAssignableRole = 'STUDENT' | 'STAFF' | 'TECHNICIAN' | 'ADMIN';

function formatDate(value?: string) {
  if (!value) return 'Unknown';
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await authApi.listUsers();
      setUsers(response);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return users;
    return users.filter((user) => {
      return (
        user.fullName.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.role.toLowerCase().includes(search) ||
        (user.status ?? '').toLowerCase().includes(search)
      );
    });
  }, [query, users]);

  const activeUsers = users.filter((user) => (user.status ?? 'ACTIVE') === 'ACTIVE').length;
  const lockedUsers = users.filter((user) => user.status === 'LOCKED').length;
  const admins = users.filter((user) => user.role === 'ADMIN').length;
  const verifiedUsers = users.filter((user) => user.emailVerified).length;

  const getRoleValue = (role: User['role']): AdminAssignableRole => {
    return role === 'ADMIN' || role === 'STUDENT' || role === 'STAFF' || role === 'TECHNICIAN'
      ? role
      : 'STUDENT';
  };

  const handleRoleChange = async (user: User, role: AdminAssignableRole) => {
    if (user.role === role) return;
    setSavingId(user.id);
    try {
      const updated = await authApi.updateUserRole(user.id, { role });
      setUsers((prev) => prev.map((entry) => (entry.id === user.id ? updated : entry)));
      toast.success('User role updated');
    } catch {
      toast.error('Failed to update user role');
    } finally {
      setSavingId(null);
    }
  };

  const handleStatusChange = async (user: User, status: NonNullable<User['status']>) => {
    if (user.status === status) return;
    setSavingId(user.id);
    try {
      const updated = await authApi.updateUserStatus(user.id, { status });
      setUsers((prev) => prev.map((entry) => (entry.id === user.id ? updated : entry)));
      toast.success('User status updated');
    } catch {
      toast.error('Failed to update user status');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <main className="page-shell admin-users-loading" id="admin-users">
        Loading users...
      </main>
    );
  }

  return (
    <main className="page-shell animate-fade-up" id="admin-users">
      <header className="page-header admin-users-hero">
        <div>
          <p className="section-eyebrow">Admin Console</p>
          <h1>User Management</h1>
          <p>Update roles, review verification, and control access for campus accounts.</p>
        </div>
      </header>

      <section className="admin-users-summary" aria-label="User management summary">
        <article className="admin-users-summary-card">
          <Users size={22} />
          <div>
            <span>Total users</span>
            <strong>{users.length}</strong>
          </div>
        </article>
        <article className="admin-users-summary-card">
          <UserCheck size={22} />
          <div>
            <span>Active</span>
            <strong>{activeUsers}</strong>
          </div>
        </article>
        <article className="admin-users-summary-card">
          <ShieldCheck size={22} />
          <div>
            <span>Admins</span>
            <strong>{admins}</strong>
          </div>
        </article>
        <article className="admin-users-summary-card">
          <UserX size={22} />
          <div>
            <span>Locked</span>
            <strong>{lockedUsers}</strong>
          </div>
        </article>
      </section>

      <section className="dashboard-section admin-users-directory">
        <div className="admin-users-toolbar">
          <div>
            <h2>Directory</h2>
            <p>
              {filteredUsers.length} visible. {verifiedUsers} verified account
              {verifiedUsers !== 1 ? 's' : ''}.
            </p>
          </div>
          <label className="admin-users-search" htmlFor="user-search">
            <input
              id="user-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, email, role, or status"
            />
          </label>
        </div>

        <div className="admin-users-table-wrap">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Verified</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center">
                    No users match the current filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-user-identity">
                        <strong>{user.fullName}</strong>
                        <span>{user.email}</span>
                      </div>
                    </td>
                    <td>
                      <select
                        className="admin-users-select"
                        value={getRoleValue(user.role)}
                        onChange={(event) =>
                          handleRoleChange(user, event.target.value as AdminAssignableRole)
                        }
                        disabled={savingId === user.id}
                      >
                        <option value="STUDENT">Student</option>
                        <option value="STAFF">Staff</option>
                        <option value="TECHNICIAN">Technician</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td>
                      <select
                        className="admin-users-select"
                        value={user.status ?? 'ACTIVE'}
                        onChange={(event) =>
                          handleStatusChange(
                            user,
                            event.target.value as NonNullable<User['status']>,
                          )
                        }
                        disabled={savingId === user.id}
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="LOCKED">Locked</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${user.emailVerified ? 'approved' : 'rejected'}`}
                      >
                        {user.emailVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-users-controls-card">
          <div className="dashboard-info-card-body">
            <h3>Admin Controls</h3>
            <p>
              Role changes are applied immediately. Locked and archived users will be blocked by the
              backend security layer.
            </p>
            <button
              type="button"
              className="btn-ghost admin-users-refresh"
              onClick={() => void loadUsers()}
            >
              <RefreshCw size={16} />
              Refresh Directory
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
