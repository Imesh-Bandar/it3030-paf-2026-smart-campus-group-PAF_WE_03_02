import { Link } from 'react-router-dom';
import { Calendar, Ticket, Bell, Zap, ArrowRight, Activity, Loader } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuthStore } from '../../stores/authStore';
import { useDashboardStats } from '../../hooks/useDashboard';

export function UserDashboardPage() {
  const { data: notificationData } = useNotifications({ read: false, size: 5 });
  const { data: dashboardData, isLoading } = useDashboardStats();
  const user = useAuthStore((state) => state.user);
  const unreadCount = notificationData?.unreadCount ?? 0;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-8 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <Loader className="w-12 h-12 text-indigo-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-700">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          Welcome back, {user?.fullName?.split(' ')[0]}{' '}
          <span className="inline-block animate-wave">👋</span>
        </h1>
        <p className="text-slate-400 mt-2 text-lg">Here's what's happening on campus today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900 border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md group hover:bg-indigo-900/60 transition-colors">
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform duration-500 text-indigo-400">
            <Calendar className="w-24 h-24" />
          </div>
          <h3 className="text-indigo-400 font-medium mb-2">My Bookings</h3>
          <div className="text-4xl font-bold text-white mb-4">
            {dashboardData?.activeBookings ?? 0}{' '}
            <span className="text-lg text-slate-500 font-normal">Active</span>
          </div>
          <Link
            to="/bookings"
            className="text-sm font-medium text-indigo-300 hover:text-indigo-200 flex items-center gap-1 group-hover:translate-x-1 transition-transform w-fit"
          >
            View Schedule <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-gradient-to-br from-rose-900/50 to-slate-900 border border-rose-500/20 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md group hover:bg-rose-900/60 transition-colors">
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform duration-500 text-rose-400">
            <Ticket className="w-24 h-24" />
          </div>
          <h3 className="text-rose-400 font-medium mb-2">My Tickets</h3>
          <div className="text-4xl font-bold text-white mb-4">
            {dashboardData?.openTickets ?? 0}{' '}
            <span className="text-lg text-slate-500 font-normal">Open</span>
          </div>
          <Link
            to="/tickets"
            className="text-sm font-medium text-rose-300 hover:text-rose-200 flex items-center gap-1 group-hover:translate-x-1 transition-transform w-fit"
          >
            Track Issues <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-gradient-to-br from-amber-900/50 to-slate-900 border border-amber-500/20 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md group hover:bg-amber-900/60 transition-colors">
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform duration-500 text-amber-400">
            <Bell className="w-24 h-24" />
          </div>
          <h3 className="text-amber-400 font-medium mb-2">Notifications</h3>
          <div className="text-4xl font-bold text-white mb-4">
            {unreadCount} <span className="text-lg text-slate-500 font-normal">Unread</span>
          </div>
          <Link
            to="/notifications"
            className="text-sm font-medium text-amber-300 hover:text-amber-200 flex items-center gap-1 group-hover:translate-x-1 transition-transform w-fit"
          >
            Check Inbox <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" /> Recent Activity
            </h2>
          </div>
          <div className="space-y-3">
            {dashboardData?.activeBookings ? (
              <>
                <div className="p-3 bg-slate-800/50 rounded-2xl flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-indigo-400"></div>
                  <span className="text-slate-300 text-sm">
                    {dashboardData.activeBookings} active booking(s)
                  </span>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-2xl flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                  <span className="text-slate-300 text-sm">
                    {dashboardData.openTickets} open ticket(s)
                  </span>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-2xl flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  <span className="text-slate-300 text-sm">
                    {unreadCount} unread notification(s)
                  </span>
                </div>
              </>
            ) : (
              <p className="text-slate-500 text-center py-8">No recent activity found.</p>
            )}
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
          <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-emerald-400" /> Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/facilities"
              className="p-6 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-2xl transition-all hover:scale-105 active:scale-95 flex flex-col items-center justify-center text-center gap-3 group"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="font-medium text-slate-300">Book Facility</span>
            </Link>

            <Link
              to="/tickets"
              className="p-6 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-2xl transition-all hover:scale-105 active:scale-95 flex flex-col items-center justify-center text-center gap-3 group"
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-colors">
                <Ticket className="w-6 h-6" />
              </div>
              <span className="font-medium text-slate-300">Report Issue</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
