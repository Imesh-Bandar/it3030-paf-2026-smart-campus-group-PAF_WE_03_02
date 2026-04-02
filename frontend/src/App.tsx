import { Navigate, NavLink, Outlet, Route, Routes } from 'react-router-dom';
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
import type { UserRole } from './services/types/user';

function ProtectedRoute({ children, roles }: { children: JSX.Element; roles?: UserRole[] }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const allowPreviewInDev = import.meta.env.DEV;

  if (allowPreviewInDev) {
    return children;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppLayout() {
  return (
    <div className="app-layout">
      <header className="app-header">
        <h1 className="app-title">Smart Campus</h1>
        <nav className="app-nav" aria-label="Main navigation">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/facilities">Facilities</NavLink>
          <NavLink to="/bookings">Bookings</NavLink>
          <NavLink to="/tickets">Tickets</NavLink>
          <NavLink to="/admin/users">Admin</NavLink>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppLayout />}>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/facilities"
          element={
            <ProtectedRoute>
              <FacilitiesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/facilities/:id"
          element={
            <ProtectedRoute>
              <FacilityDetailsPage />
            </ProtectedRoute>
          }
        />
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
