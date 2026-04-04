import {
  Users,
  Grid,
  Bookmark,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Loader,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboardStats } from '../../../hooks/useDashboard';

export function AdminDashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <Loader className="w-12 h-12 text-indigo-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: <Users className="w-6 h-6" />,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      label: 'Resources',
      value: stats?.totalResources || 0,
      icon: <Grid className="w-6 h-6" />,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      label: 'Pending Bookings',
      value: stats?.pendingBookings || 0,
      icon: <Bookmark className="w-6 h-6" />,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      label: 'Open Tickets',
      value: stats?.openTickets || 0,
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            Admin Dashboard
          </h1>
          <p className="text-slate-400 mt-1">System overview and control center.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((stat, i) => (
          <div
            key={i}
            className={`bg-slate-900/50 backdrop-blur-sm border ${stat.border} p-6 rounded-3xl flex items-center gap-5 hover:bg-slate-800/80 transition-colors`}
          >
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-sm font-medium text-slate-400">{stat.label}</p>
              <h3 className="text-3xl font-bold text-slate-100 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Charts Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Trends */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-semibold text-slate-200">
                Booking Requests (Last 30 Days)
              </h3>
            </div>
            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-700/50 rounded-2xl bg-slate-900/20">
              <BarChart3 className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-slate-500 font-medium">Chart visualization loading...</p>
              {stats?.bookingStats && (
                <div className="mt-4 grid grid-cols-2 gap-4 w-full px-4">
                  <div className="p-2 bg-slate-800/50 rounded text-center">
                    <p className="text-xs text-slate-400">Pending</p>
                    <p className="text-xl font-bold text-amber-400">{stats.bookingStats.pending}</p>
                  </div>
                  <div className="p-2 bg-slate-800/50 rounded text-center">
                    <p className="text-xs text-slate-400">Confirmed</p>
                    <p className="text-xl font-bold text-emerald-400">
                      {stats.bookingStats.confirmed}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ticket Severity Distribution */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <h3 className="text-lg font-semibold text-slate-200">Tickets by Severity</h3>
            </div>
            <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-slate-700/50 rounded-2xl bg-slate-900/20">
              <PieChart className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-slate-500 font-medium">Chart visualization loading...</p>
              {stats?.ticketStats && (
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs w-full px-4">
                  <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-center">
                    <p className="text-red-400">Critical</p>
                    <p className="font-bold text-red-300">{stats.ticketStats.critical}</p>
                  </div>
                  <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded text-center">
                    <p className="text-orange-400">High</p>
                    <p className="font-bold text-orange-300">{stats.ticketStats.high}</p>
                  </div>
                  <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-center">
                    <p className="text-yellow-400">Medium</p>
                    <p className="font-bold text-yellow-300">{stats.ticketStats.medium}</p>
                  </div>
                  <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded text-center">
                    <p className="text-blue-400">Low</p>
                    <p className="font-bold text-blue-300">{stats.ticketStats.low}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Tools */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
            <h3 className="text-lg font-semibold text-slate-200 mb-6">Quick Tools</h3>
            <div className="flex flex-col gap-3">
              <Link
                to="/admin/bookings"
                className="w-full py-4 px-6 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-2xl text-center text-blue-300 font-medium transition-all"
              >
                Manage Bookings
              </Link>
              <Link
                to="/admin/tickets"
                className="w-full py-4 px-6 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 rounded-2xl text-center text-rose-300 font-medium transition-all"
              >
                Review Tickets
              </Link>
              <Link
                to="/admin/facilities"
                className="w-full py-4 px-6 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-2xl text-center text-emerald-300 font-medium transition-all"
              >
                Facility Catalog
              </Link>
              <Link
                to="/admin/users"
                className="w-full py-4 px-6 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-2xl text-center text-purple-300 font-medium transition-all"
              >
                User Management
              </Link>
            </div>
          </div>

          {/* Ticket Status Overview */}
          {stats?.ticketStatusStats && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-slate-200">Ticket Status</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded">
                  <span className="text-xs text-slate-400">Open</span>
                  <span className="font-bold text-red-400">{stats.ticketStatusStats.open}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded">
                  <span className="text-xs text-slate-400">In Progress</span>
                  <span className="font-bold text-amber-400">
                    {stats.ticketStatusStats.inProgress}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded">
                  <span className="text-xs text-slate-400">Resolved</span>
                  <span className="font-bold text-emerald-400">
                    {stats.ticketStatusStats.resolved}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
