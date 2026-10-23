'use client';

import React, { useState, useEffect, useRef } from 'react';
import { InAppNotification } from '@/types';
import {
  Bell,
  Clock,
  Sparkles,
  CheckCircle2,
  Check,
  X,
  ChevronRight,
  Briefcase,
  Layers,
} from 'lucide-react';
import Link from 'next/link';

const STORAGE_KEY = 'yojanasethu_read_notifications';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Helper to get dismissed/read IDs from localStorage
  const getStoredReadIds = (): string[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // Helper to persist dismissed/read IDs
  const saveReadId = (id: string) => {
    try {
      const current = getStoredReadIds();
      if (!current.includes(id)) {
        const updated = [...current, id];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } catch {}
  };

  const saveAllReadIds = (ids: string[]) => {
    try {
      const current = getStoredReadIds();
      const set = new Set([...current, ...ids]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
    } catch {}
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/placement/notifications');
      const data = await res.json();
      if (Array.isArray(data.notifications)) {
        const readIds = getStoredReadIds();
        // Filter out notifications that have been marked as read / seen so they disappear
        const activeNotifs = data.notifications.filter(
          (n: InAppNotification) => !n.is_read && !readIds.includes(n.id)
        );
        setNotifications(activeNotifs);
      }
    } catch (e) {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Close dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When a notification is marked as read, it disappears immediately
  const markAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    // Remove from active list so it disappears
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    saveReadId(id);

    try {
      await fetch('/api/placement/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
    } catch (e) {
      // Graceful
    }
  };

  // Mark all as read -> all disappear immediately
  const markAllAsRead = async () => {
    const ids = notifications.map((n) => n.id);
    setNotifications([]);
    saveAllReadIds(ids);

    // Call API for each
    ids.forEach((id) => {
      fetch('/api/placement/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      }).catch(() => {});
    });
  };

  const unreadCount = notifications.length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
        aria-label="View placement notifications"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center animate-pulse shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-xs text-slate-900 dark:text-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/40">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-900 dark:text-white">
                Notifications
              </span>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                  {unreadCount} new
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  All caught up
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline font-semibold flex items-center gap-1"
                title="Mark all as read"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  All caught up!
                </p>
                <p className="text-[11px] text-slate-400">
                  No active notifications at this time.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-3.5 transition-colors bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 group relative"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                      {n.type === 'deadline' ? (
                        <Clock className="w-3.5 h-3.5 text-rose-500" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div className="space-y-1 flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                          {n.title}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                      </div>

                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                        {n.message}
                      </p>

                      <div className="flex items-center justify-between pt-1.5 text-[10px] text-slate-400">
                        <span>
                          {new Date(n.created_at).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>

                        <div className="flex items-center gap-2">
                          {n.link && (
                            <Link
                              href={n.link}
                              onClick={() => {
                                markAsRead(n.id);
                                setIsOpen(false);
                              }}
                              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 font-semibold"
                            >
                              <span>Open Hub</span>
                              <ChevronRight className="w-3 h-3" />
                            </Link>
                          )}

                          <button
                            type="button"
                            onClick={(e) => markAsRead(n.id, e)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 shadow-2xs font-semibold text-[10px] transition-colors"
                            title="Mark as read and dismiss"
                          >
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>Mark read</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Top right quick dismiss X button */}
                    <button
                      type="button"
                      onClick={(e) => markAsRead(n.id, e)}
                      className="absolute top-2.5 right-2.5 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                      title="Dismiss notification"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-center">
            <Link
              href="/student/placement-hub"
              onClick={() => setIsOpen(false)}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center justify-center gap-1"
            >
              <span>Explore All Opportunities in Hub</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
