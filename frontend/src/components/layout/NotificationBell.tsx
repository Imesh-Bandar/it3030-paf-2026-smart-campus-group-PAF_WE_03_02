import { useState } from 'react';
import { Bell, Check, Clock, Calendar, Ticket, AlertCircle } from 'lucide-react';
import { useNotifications, useMarkAllAsRead, useMarkAsRead } from '../../hooks/useNotifications';
import type { NotificationType } from '../../services/types/notification';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: notificationData } = useNotifications({ read: false, size: 5 });
  const markAllAsRead = useMarkAllAsRead();
  const markAsRead = useMarkAsRead();

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'BOOKING': return <Calendar className="w-4 h-4 text-emerald-500" />;
      case 'TICKET': return <Ticket className="w-4 h-4 text-rose-500" />;
      default: return <AlertCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const unreadCount = notificationData?.unreadCount ?? 0;
  const notifications = notificationData?.notifications?.content ?? [];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-slate-800 transition-colors"
      >
        <Bell className="w-6 h-6 text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-rose-500 rounded-full animate-pulse border-2 border-slate-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700/50 rounded-2xl shadow-xl shadow-black/50 overflow-hidden z-50 backdrop-blur-xl">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h3 className="font-semibold text-slate-200">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllAsRead.mutate()}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                <Bell className="w-10 h-10 mb-3 opacity-20" />
                <p>You're all caught up!</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className="p-4 border-b border-slate-800 hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => {
                      if (!notif.isRead) markAsRead.mutate(notif.id);
                    }}
                  >
                    <div className="flex gap-3">
                      <div className="mt-1 flex-shrink-0 bg-slate-800 p-2 rounded-full h-fit">
                        {getIcon(notif.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200 line-clamp-1">{notif.title}</p>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{notif.message}</p>
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-slate-800 text-center bg-slate-900/50 hover:bg-slate-800 transition-colors">
            <Link to="/notifications" onClick={() => setIsOpen(false)} className="text-sm text-indigo-400 font-medium block">
              View All Notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
