'use client';

import React, { useState, useMemo } from 'react';
import { PlacementCalendarEvent, PlacementEventType } from '@/types';
import {
  Calendar as CalendarIcon,
  Clock,
  Filter,
  Users,
  Video,
  FileCode2,
  Building2,
  ExternalLink,
  ChevronRight,
  List,
  Grid,
  AlertCircle,
} from 'lucide-react';

interface Props {
  events: PlacementCalendarEvent[];
  onSelectAnnouncement?: (announcementId: string) => void;
}

export default function PlacementCalendarView({
  events,
  onSelectAnnouncement,
}: Props) {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'timeline' | 'month'>('timeline');

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (selectedType !== 'all' && e.event_type !== selectedType) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchComp = e.company_name.toLowerCase().includes(q);
        const matchTitle = e.title.toLowerCase().includes(q);
        const matchRole = e.role_title.toLowerCase().includes(q);
        if (!matchComp && !matchTitle && !matchRole) return false;
      }
      return true;
    });
  }, [events, selectedType, searchTerm]);

  // Group events by date category: Today, This Week, Upcoming
  const groupedEvents = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const sevenDaysLater = new Date(now.getTime() + 7 * 86400000);

    const todayEvents: PlacementCalendarEvent[] = [];
    const thisWeekEvents: PlacementCalendarEvent[] = [];
    const upcomingEvents: PlacementCalendarEvent[] = [];
    const pastEvents: PlacementCalendarEvent[] = [];

    filteredEvents.forEach((e) => {
      const eDate = new Date(e.date);
      const eDateStr = eDate.toISOString().split('T')[0];

      if (eDateStr === todayStr) {
        todayEvents.push(e);
      } else if (eDate < now) {
        pastEvents.push(e);
      } else if (eDate <= sevenDaysLater) {
        thisWeekEvents.push(e);
      } else {
        upcomingEvents.push(e);
      }
    });

    return {
      today: todayEvents,
      thisWeek: thisWeekEvents,
      upcoming: upcomingEvents,
      past: pastEvents,
    };
  }, [filteredEvents]);

  const getEventBadge = (type: PlacementEventType) => {
    switch (type) {
      case 'registration_deadline':
        return {
          label: 'Application Deadline',
          color: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          icon: Clock,
        };
      case 'ppt':
        return {
          label: 'Pre-Placement Talk',
          color: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
          icon: Video,
        };
      case 'assessment':
        return {
          label: 'Online Assessment',
          color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          icon: FileCode2,
        };
      case 'interview':
        return {
          label: 'Interviews',
          color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          icon: Users,
        };
      default:
        return {
          label: 'Recruitment Event',
          color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          icon: CalendarIcon,
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Calendar Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium mr-1">
            <Filter className="w-3.5 h-3.5 text-indigo-500" />
            <span>Filter Events:</span>
          </div>

          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
              selectedType === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Events ({events.length})
          </button>
          <button
            onClick={() => setSelectedType('registration_deadline')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
              selectedType === 'registration_deadline'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50'
            }`}
          >
            Deadlines
          </button>
          <button
            onClick={() => setSelectedType('ppt')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
              selectedType === 'ppt'
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/50'
            }`}
          >
            Pre-Placement Talks
          </button>
          <button
            onClick={() => setSelectedType('assessment')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
              selectedType === 'assessment'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50'
            }`}
          >
            Assessments
          </button>
          <button
            onClick={() => setSelectedType('interview')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
              selectedType === 'interview'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
            }`}
          >
            Interviews
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search company or event..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 w-full sm:w-48"
          />

          <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shrink-0">
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-1.5 transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
              title="Timeline view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`p-1.5 transition-colors ${
                viewMode === 'month'
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
              title="Month Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Events Display */}
      {filteredEvents.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          No placement events match the selected criteria.
        </div>
      ) : viewMode === 'timeline' ? (
        <div className="space-y-6">
          {/* Today Group */}
          {groupedEvents.today.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Today's Milestones
                </h4>
              </div>
              <div className="space-y-2">
                {groupedEvents.today.map((e) => (
                  <EventItem
                    key={e.id}
                    event={e}
                    badge={getEventBadge(e.event_type)}
                    onSelectAnnouncement={onSelectAnnouncement}
                  />
                ))}
              </div>
            </div>
          )}

          {/* This Week Group */}
          {groupedEvents.thisWeek.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  This Week ({groupedEvents.thisWeek.length})
                </h4>
              </div>
              <div className="space-y-2">
                {groupedEvents.thisWeek.map((e) => (
                  <EventItem
                    key={e.id}
                    event={e}
                    badge={getEventBadge(e.event_type)}
                    onSelectAnnouncement={onSelectAnnouncement}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Group */}
          {groupedEvents.upcoming.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Upcoming Events & Visits ({groupedEvents.upcoming.length})
                </h4>
              </div>
              <div className="space-y-2">
                {groupedEvents.upcoming.map((e) => (
                  <EventItem
                    key={e.id}
                    event={e}
                    badge={getEventBadge(e.event_type)}
                    onSelectAnnouncement={onSelectAnnouncement}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Past Milestones */}
          {groupedEvents.past.length > 0 && (
            <div className="space-y-2 opacity-70">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Concluded Milestones
                </h4>
              </div>
              <div className="space-y-2">
                {groupedEvents.past.slice(0, 5).map((e) => (
                  <EventItem
                    key={e.id}
                    event={e}
                    badge={getEventBadge(e.event_type)}
                    onSelectAnnouncement={onSelectAnnouncement}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Month Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredEvents.map((e) => {
            const badge = getEventBadge(e.event_type);
            const Icon = badge.icon;
            const dateObj = new Date(e.date);

            return (
              <div
                key={e.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-3 transition-all hover:border-indigo-400"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${badge.color}`}>
                      <Icon className="w-3 h-3" />
                      <span>{badge.label}</span>
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-500">
                      {dateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      {e.company_name}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {e.role_title}
                    </p>
                  </div>

                  {e.description && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                      {e.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 truncate max-w-[150px]">
                    {e.location_or_link || 'NMAMIT Campus'}
                  </span>
                  {onSelectAnnouncement && (
                    <button
                      onClick={() => onSelectAnnouncement(e.announcement_id)}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-0.5"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EventItem({
  event,
  badge,
  onSelectAnnouncement,
}: {
  event: PlacementCalendarEvent;
  badge: { label: string; color: string; icon: any };
  onSelectAnnouncement?: (announcementId: string) => void;
}) {
  const Icon = badge.icon;
  const dateObj = new Date(event.date);

  return (
    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-slate-300 dark:hover:border-slate-700">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0 text-center min-w-[50px]">
          <span className="text-[10px] font-bold uppercase block text-slate-400">
            {dateObj.toLocaleDateString('en-IN', { month: 'short' })}
          </span>
          <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono leading-none">
            {dateObj.getDate()}
          </span>
        </div>

        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${badge.color}`}>
              <Icon className="w-3 h-3" />
              <span>{badge.label}</span>
            </span>
            <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
              {event.company_name} — {event.role_title}
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
            {event.description}
          </p>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Time: {dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
            <span>•</span>
            <span>Location: {event.location_or_link || 'Campus TPO Center'}</span>
          </div>
        </div>
      </div>

      <div className="shrink-0 self-end sm:self-center">
        {onSelectAnnouncement && (
          <button
            onClick={() => onSelectAnnouncement(event.announcement_id)}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 font-semibold text-xs transition-colors flex items-center gap-1"
          >
            <span>View Opportunity</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
