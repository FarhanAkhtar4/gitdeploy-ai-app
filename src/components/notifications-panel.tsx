'use client';

import React from 'react';
import { useAppStore, type Notification } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Bell,
  Rocket,
  Wrench,
  Clock,
  GitBranch,
  Info,
  CheckCheck,
  X,
} from 'lucide-react';

const NOTIFICATION_ICONS: Record<Notification['type'], { icon: React.ElementType; color: string; bg: string }> = {
  deployment: { icon: Rocket, color: '#3fb950', bg: 'rgba(63,185,80,0.15)' },
  build: { icon: Wrench, color: '#58a6ff', bg: 'rgba(88,166,255,0.15)' },
  schedule: { icon: Clock, color: '#e3b341', bg: 'rgba(227,179,65,0.15)' },
  workflow: { icon: GitBranch, color: '#a371f7', bg: 'rgba(163,113,247,0.15)' },
  info: { icon: Info, color: '#8b949e', bg: 'rgba(139,148,158,0.15)' },
};

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationsPanel() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg transition-colors hover:bg-[#21262d]" style={{ color: '#8b949e' }}>
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white animate-pulse"
              style={{ backgroundColor: '#f85149' }}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0 border-[#30363d] rounded-xl shadow-2xl"
        style={{ backgroundColor: '#161b22' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#30363d' }}>
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4" style={{ color: '#58a6ff' }} />
            <h3 className="text-sm font-semibold" style={{ color: '#c9d1d9' }}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: 'rgba(248,81,73,0.15)', color: '#f85149' }}
              >
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] gap-1 hover:bg-[#21262d]"
              style={{ color: '#58a6ff' }}
              onClick={markAllNotificationsRead}
            >
              <CheckCheck className="w-3 h-3" /> Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Bell className="w-8 h-8 mb-2" style={{ color: '#30363d' }} />
              <p className="text-xs" style={{ color: '#8b949e' }}>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: '#21262d' }}>
              {notifications.map((notification) => {
                const config = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.info;
                const Icon = config.icon;
                return (
                  <div
                    key={notification.id}
                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[#21262d] cursor-pointer"
                    style={{
                      backgroundColor: notification.read ? 'transparent' : 'rgba(88,166,255,0.03)',
                      borderLeft: notification.read ? '2px solid transparent' : `2px solid #58a6ff`,
                    }}
                    onClick={() => markNotificationRead(notification.id)}
                  >
                    <div
                      className="p-1.5 rounded-lg shrink-0 mt-0.5"
                      style={{ backgroundColor: config.bg }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-medium truncate"
                        style={{ color: notification.read ? '#8b949e' : '#c9d1d9' }}
                      >
                        {notification.title}
                      </p>
                      <p className="text-[11px] mt-0.5 truncate" style={{ color: '#8b949e' }}>
                        {notification.description}
                      </p>
                      <p className="text-[10px] mt-1" style={{ color: '#484f58' }}>
                        {formatTimeAgo(notification.timestamp)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div
                        className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                        style={{ backgroundColor: '#58a6ff' }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t text-center" style={{ borderColor: '#30363d' }}>
          <p className="text-[10px]" style={{ color: '#484f58' }}>
            Notification preferences available in Settings
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
