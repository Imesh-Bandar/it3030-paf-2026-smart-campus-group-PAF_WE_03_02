import { useState } from 'react';
import { Navigate, NavLink, Outlet, Route, Routes, Link } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { LoginPage } from './app/login/page';
import { HomePage } from './app/page';
import { FacilitiesPage } from './app/facilities/page';
import { FacilityDetailsPage } from './app/facilities/[id]/page';
import { BookingsPage } from './app/bookings/page';
import { BookingDetailsPage } from './app/bookings/[id]/page';
import { TicketsPage } from './app/tickets/page';
import { TicketDetailsPage } from './app/tickets/[id]/page';
import { AdminBookingsPage } from './app/admin/bookings/page';
import { AdminFacilitiesPage } from './app/admin/facilities/page';
import { AdminTicketsPage } from './app/admin/tickets/page';
import { AdminUsersPage } from './app/admin/users/page';
import { AdminDashboardPage } from './app/admin/page';
import { StudentDashboardPage } from './app/dashboard/student/page';
import { StaffDashboardPage } from './app/dashboard/staff/page';
import { TechnicianDashboardPage } from './app/dashboard/technician/page';
import { NotificationsPage } from './app/notifications/page';
import { NotificationPreferencesPage } from './app/notifications/preferences/page';
import { SecurityActivityPage } from './app/account/security/page';
import { NotificationBell } from './components/notifications/NotificationBell';
import { getRoleHomePath, useRole } from './hooks/useRole';
import { useTheme } from './hooks/useTheme';
import type { UserRole } from './services/types/user';

/* ─── Icons (inline SVG helpers) ─────────────────── */
function IconHome() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function IconGrid() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function IconTicket() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
function IconBell() {
  return (
    <svg
      width="15"
      height="15"
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
function IconShield() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function IconSignOut() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
function IconChevron() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function IconSun() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

/* ─── Protected Route ─────────────────────────────── */
function ProtectedRoute({ children, roles }: { children: JSX.Element; roles?: UserRole[] }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }
  return children;
}

function DashboardRoute() {
  const user = useAuthStore((state) => state.user);
  return <Navigate to={getRoleHomePath(user?.role)} replace />;
}

/* ─── App Layout + Nav ───────────────────────────── */
function AppLayout() {
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { isAdmin } = useRole();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'SC';

  const navLinks = [
    { to: '/', label: 'Home', icon: <IconHome /> },
    ...(isAuthenticated ? [{ to: '/dashboard', label: 'Dashboard', icon: <IconHome /> }] : []),
    { to: '/facilities', label: 'Facilities', icon: <IconGrid /> },
    { to: '/bookings', label: 'Bookings', icon: <IconCalendar /> },
    { to: '/tickets', label: 'Tickets', icon: <IconTicket /> },
    ...(isAuthenticated
      ? [{ to: '/notifications', label: 'Notifications', icon: <IconBell /> }]
      : []),
    ...(isAuthenticated
      ? [{ to: '/account/security', label: 'Security', icon: <IconShield /> }]
      : []),
    ...(isAdmin() ? [{ to: '/admin/users', label: 'Admin', icon: <IconUsers /> }] : []),
  ];

  return (
    <div className="app-layout">
      {/* ── Sticky Header ── */}
      <header className="app-header">
        {/* Brand */}
        <Link to="/" className="header-brand" aria-label="Smart Campus Home" onClick={closeMenu}>
          <div className="header-brand-icon">
            <IconBuilding />
          </div>
          <span className="header-brand-name">
            Smart<span>Campus</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="app-nav" aria-label="Main navigation">
          {navLinks.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'}>
              {l.icon}
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Right actions */}
        <div className="header-actions">
          {/* Theme toggle */}
          <button
            type="button"
            className="btn-theme"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            id="btn-theme-toggle"
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <IconSun /> : <IconMoon />}
          </button>

          {/* Auth state */}
          {isAuthenticated && user ? (
            <>
              <div className="header-user-badge">
                <div className="header-avatar" aria-hidden="true">
                  {initials}
                </div>
                <span>{user.fullName?.split(' ')[0] ?? 'User'}</span>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  clearAuth();
                  closeMenu();
                }}
                aria-label="Sign out"
                id="btn-sign-out-desktop"
              >
                <IconSignOut />
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary" id="btn-sign-in-header" onClick={closeMenu}>
              Sign In <IconChevron />
            </Link>
          )}

          {/* Notification Bell */}
          <NotificationBell />

          {/* Hamburger — mobile only */}
          <button
            type="button"
            className={`btn-hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            id="btn-hamburger"
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      <nav
        className={`mobile-menu${menuOpen ? ' open' : ''}`}
        aria-label="Mobile navigation"
        id="mobile-menu"
      >
        {/* User info if signed in */}
        {isAuthenticated && user && (
          <div className="mobile-menu-user">
            <div className="header-avatar mobile-avatar" aria-hidden="true">
              {initials}
            </div>
            <div className="mobile-menu-user-info">
              <span className="mobile-menu-user-name">{user.fullName}</span>
              <span className="mobile-menu-user-role">
                {user.role} · {user.email}
              </span>
            </div>
          </div>
        )}

        {/* Nav links */}
        {navLinks.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`}
            onClick={closeMenu}
          >
            <span className="mobile-nav-icon">{l.icon}</span>
            {l.label}
          </NavLink>
        ))}

        <div className="mobile-menu-divider" />

        {/* Mobile actions */}
        <div className="mobile-menu-actions">
          {isAuthenticated ? (
            <button
              type="button"
              className="btn-ghost mobile-action-btn"
              onClick={() => {
                clearAuth();
                closeMenu();
              }}
              id="btn-sign-out-mobile"
            >
              <IconSignOut /> Sign Out
            </button>
          ) : (
            <Link
              to="/login"
              className="btn-primary mobile-action-btn"
              onClick={closeMenu}
              id="btn-sign-in-mobile"
            >
              Sign In <IconChevron />
            </Link>
          )}
        </div>
      </nav>

      <Outlet />
    </div>
  );
}

/* ─── Root App ───────────────────────────────────── */
function App() {
  // Apply theme on mount (before any render)
  useTheme();

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRoute />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/student"
          element={
            <ProtectedRoute roles={['STUDENT']}>
              <StudentDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/staff"
          element={
            <ProtectedRoute roles={['STAFF']}>
              <StaffDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/technician"
          element={
            <ProtectedRoute roles={['TECHNICIAN']}>
              <TechnicianDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications/preferences"
          element={
            <ProtectedRoute>
              <NotificationPreferencesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/security"
          element={
            <ProtectedRoute>
              <SecurityActivityPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Navigate to="/" replace />
            </ProtectedRoute>
          }
        />
        <Route path="/facilities" element={<FacilitiesPage />} />
        <Route path="/facilities/:id" element={<FacilityDetailsPage />} />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <BookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/:id"
          element={
            <ProtectedRoute>
              <BookingDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <TicketsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets/:id"
          element={
            <ProtectedRoute>
              <TicketDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/facilities"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminFacilitiesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tickets"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminTicketsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
