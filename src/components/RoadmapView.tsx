'use client';

import React, { useState } from 'react';
import { Roadmap } from '@/types';
import {
  Calendar,
  CheckCircle2,
  Circle,
  ExternalLink,
  BookOpen,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface Props {
  initialRoadmaps: Roadmap[];
  studentId: string;
}

export default function RoadmapView({ initialRoadmaps, studentId }: Props) {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>(initialRoadmaps || []);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const toggleTask = async (taskId: string) => {
    setTogglingId(taskId);
    try {
      const res = await fetch('/api/roadmap', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });
      const data = await res.json();
      if (res.ok && data.task) {
        setRoadmaps((prev) =>
          prev.map((r) => (r.id === taskId ? { ...r, is_completed: data.task.is_completed } : r))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingId(null);
    }
  };

  const completedCount = roadmaps.filter((r) => r.is_completed).length;
  const progressPercent = roadmaps.length > 0 ? Math.round((completedCount / roadmaps.length) * 100) : 0;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                30-Day Targeted Career Roadmap
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30">
                Actionable Modules
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalized weekly targets to bridge verified evidence gaps for campus placements
            </p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-3">
          <div className="w-28 bg-slate-200 dark:bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-300 dark:border-slate-800">
            <div
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-300">
            {completedCount}/{roadmaps.length} ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* 4-Week Roadmap Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {roadmaps.length === 0 ? (
          <div className="col-span-full py-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            No roadmap modules assigned in database for this student.
          </div>
        ) : (
          roadmaps.map((week) => (
          <div
            key={week.id}
            className={`p-4 rounded-xl border transition-all glass-card ${
              week.is_completed
                ? 'border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/10'
                : 'border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    week.is_completed
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                      : 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/30'
                  }`}
                >
                  WEEK {week.week_number}
                </span>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                  {week.title.replace(/^Week \d+:\s*/, '')}
                </h4>
              </div>

              <button
                onClick={() => toggleTask(week.id)}
                disabled={togglingId === week.id}
                className="text-slate-400 hover:text-emerald-500 transition-colors shrink-0"
                title={week.is_completed ? 'Mark as Incomplete' : 'Mark as Completed'}
              >
                {week.is_completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400" />
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
              {week.description}
            </p>

            {/* Action Items */}
            <div className="space-y-1.5 mb-3 bg-slate-100 dark:bg-slate-950/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-900">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Micro-Milestones:
              </span>
              {week.action_items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-300">
                  <ArrowRight className="w-3 h-3 text-indigo-500 dark:text-indigo-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Free Curated Learning Resources */}
            {week.resource_urls && week.resource_urls.length > 0 && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-900 flex flex-wrap gap-2">
                {week.resource_urls.map((res, idx) => (
                  <a
                    key={idx}
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-800 transition-colors"
                  >
                    <BookOpen className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    <span>{res.title}</span>
                    <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                  </a>
                ))}
              </div>
            )}
          </div>
        ))
      )}
      </div>
    </div>
  );
}
