import { useState } from 'react';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../../hooks/useNotifications';
import { Bell, Calendar, Ticket, AlertCircle, Check, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { NotificationType } from '../../services/types/notification';

export function NotificationsPage() {
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('UNREAD');
  const { data, isLoading } = useNotifications(filter === 'UNREAD' ? { read: false } : {});
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'BOOKING': return <Calendar className="w-5 h-5 text-emerald-500" />;
      case 'TICKET': return <Ticket className="w-5 h-5 text-rose-500" />;
      default: return <AlertCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const notifications = data?.notifications?.content ?? [];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            Notifications
          </h1>
          <p className="text-slate-400 mt-1">Stay updated with your campus activities</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-slate-800/50 p-1 rounded-xl flex gap-1 border border-slate-700/50 backdrop-blur-sm">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'ALL' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'UNREAD' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'}`}
            >
              Unread
            </button>
          </div>

          <button 
            onClick={() => markAllAsRead.mutate()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-colors border border-slate-700 flex items-center gap-2"
          >
            <Check className="w-4 h-4" /> Mark all read
          </button>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl shadow-xl backdrop-blur-md overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 animate-pulse">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-500">
            <Bell className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-xl font-semibold mb-2 text-slate-400">You're all caught up!</h3>
            <p>No new notifications match your filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                className={`p-6 transition-colors hover:bg-slate-800/30 flex flex-col md:flex-row gap-4 justify-between items-start ${!notif.isRead ? 'bg-indigo-950/10' : ''}`}
              >
                <div className="flex gap-4">
                  <div className={`mt-1 p-3 rounded-2xl h-fit border ${!notif.isRead ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-slate-800/80 border-slate-700/50'}`}>
                    {getIcon(notif.type)}
                  </div>
                  <div>
                    <h4 className={`text-lg font-medium mb-1 ${!notif.isRead ? 'text-indigo-200' : 'text-slate-300'}`}>
                      {notif.title}
                    </h4>
                    <p className="text-slate-400">{notif.message}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </span>
                      {!notif.isRead && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {!notif.isRead && (
                  <button 
                    onClick={() => markAsRead.mutate(notif.id)}
                    className="shrink-0 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-sm font-medium rounded-xl transition-colors whitespace-nowrap border border-indigo-500/20"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
