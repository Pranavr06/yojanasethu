'use client';

import React, { useEffect, useState } from 'react';
import CohortCharts from '@/components/CohortCharts';
import { CohortSkillMetric } from '@/types';
import { BarChart3, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MentorAnalyticsPage() {
  const [metrics, setMetrics] = useState<CohortSkillMetric[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/college/cohort-analytics');
      const data = await res.json();
      if (data.skill_gap_analytics) setMetrics(data.skill_gap_analytics);
      if (data.recommended_interventions) setInterventions(data.recommended_interventions);
    } catch (e) {
      console.error('Failed to fetch cohort analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/mentor"
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Back to Overview"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Intelligence & Planning • Skill Gaps
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-indigo-500" />
            <span>Cohort Skill Gap Analytics & Interventions</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated cohort analysis identifying missing and unverified skills with recommended faculty workshops.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-bold hover:bg-indigo-100 transition-colors self-start sm:self-center disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {/* Cohort Charts Component */}
      <CohortCharts metrics={metrics} interventions={interventions} />
    </div>
  );
}
