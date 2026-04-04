import { Wrench, CheckCircle2, Clock, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboardStats } from '../../../hooks/useDashboard';

export function TechDashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-8 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <Loader className="w-12 h-12 text-orange-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const totalAssigned =
    (stats?.assignedTickets?.open || 0) + (stats?.assignedTickets?.inProgress || 0);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-rose-400">
          Technician Dashboard
        </h1>
        <p className="text-slate-400 mt-1">Manage your active maintenance tasks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900/50 border border-orange-500/30 p-6 rounded-3xl flex items-center justify-between hover:bg-slate-900/70 transition-colors">
          <div>
            <p className="text-sm text-slate-400 font-medium">Assigned to Me</p>
            <h2 className="text-4xl font-bold text-white mt-2">{totalAssigned}</h2>
            <p className="text-xs text-slate-500 mt-2">
              {stats?.assignedTickets?.open || 0} Open, {stats?.assignedTickets?.inProgress || 0} In
              Progress
            </p>
          </div>
          <div className="w-16 h-16 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center">
            <Wrench className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-emerald-500/30 p-6 rounded-3xl flex items-center justify-between hover:bg-slate-900/70 transition-colors">
          <div>
            <p className="text-sm text-slate-400 font-medium">Resolved This Week</p>
            <h2 className="text-4xl font-bold text-white mt-2">{stats?.resolvedThisWeek || 0}</h2>
            <p className="text-xs text-slate-500 mt-2">tickets completed</p>
          </div>
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-blue-500/30 p-6 rounded-3xl flex items-center justify-between hover:bg-slate-900/70 transition-colors">
          <div>
            <p className="text-sm text-slate-400 font-medium">Avg Resolution Time</p>
            <h2 className="text-3xl font-bold text-white mt-2">
              {stats?.averageResolutionTime || 0}{' '}
              <span className="text-lg font-normal text-slate-500">hrs</span>
            </h2>
            <p className="text-xs text-slate-500 mt-2">average per ticket</p>
          </div>
          <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-slate-200">Current Assignments</h3>
            <Link
              to="/tickets"
              className="text-orange-400 hover:text-orange-300 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          {totalAssigned > 0 ? (
            <div className="space-y-3">
              {stats?.assignedTickets?.open && stats.assignedTickets.open > 0 && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-400">Open Tickets</p>
                    <p className="text-xs text-red-300">Awaiting start</p>
                  </div>
                  <span className="text-2xl font-bold text-red-300">
                    {stats.assignedTickets.open}
                  </span>
                </div>
              )}
              {stats?.assignedTickets?.inProgress && stats.assignedTickets.inProgress > 0 && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-400">In Progress</p>
                    <p className="text-xs text-amber-300">Currently being worked on</p>
                  </div>
                  <span className="text-2xl font-bold text-amber-300">
                    {stats.assignedTickets.inProgress}
                  </span>
                </div>
              )}
              {stats?.assignedTickets?.resolved && stats.assignedTickets.resolved > 0 && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-400">Resolved</p>
                    <p className="text-xs text-emerald-300">Completed tasks</p>
                  </div>
                  <span className="text-2xl font-bold text-emerald-300">
                    {stats.assignedTickets.resolved}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-800 rounded-2xl h-48 flex flex-col items-center justify-center text-slate-500">
              <Wrench className="w-12 h-12 mb-4 opacity-20" />
              <p>No assignments yet. Great work!</p>
            </div>
          )}
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/tickets"
              className="w-full py-3 px-4 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 rounded-2xl text-center text-orange-300 font-medium transition-all text-sm"
            >
              My Tickets
            </Link>
            <Link
              to="/notifications"
              className="w-full py-3 px-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-2xl text-center text-blue-300 font-medium transition-all text-sm"
            >
              Notifications
            </Link>
            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/30">
              <p className="text-xs text-slate-400 mb-2">Performance This Month</p>
              <div className="text-2xl font-bold text-emerald-400">98%</div>
              <p className="text-xs text-slate-500 mt-1">Ticket resolution rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
