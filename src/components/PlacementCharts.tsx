'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { BarChart3, TrendingUp, Filter, Award } from 'lucide-react';

interface DepartmentStat {
  department_code: string;
  department_name: string;
  total_students: number;
  eligible_students: number;
  placed_students: number;
  average_cgpa: number;
  placement_rate: number;
}

interface PlacementChartsProps {
  departmentStats: DepartmentStat[];
  drives: any[];
  applications: any[];
}

export default function PlacementCharts({
  departmentStats,
  drives,
  applications,
}: PlacementChartsProps) {
  // 1. Department Progress Data
  const deptData = (departmentStats || []).map((d) => ({
    name: d.department_code,
    fullName: d.department_name,
    'Total Cohort': d.total_students,
    'Contineo Eligible': d.eligible_students,
    'Placed / Offers': d.placed_students,
    placementRate: d.placement_rate,
  }));

  // 2. CTC Distribution Data (Binned by compensation bracket)
  const ctcBrackets = [
    { range: '< 6 LPA', min: 0, max: 6, count: 0, companies: [] as string[] },
    { range: '6 - 10 LPA', min: 6, max: 10, count: 0, companies: [] as string[] },
    { range: '10 - 15 LPA', min: 10, max: 15, count: 0, companies: [] as string[] },
    { range: '15+ LPA', min: 15, max: 999, count: 0, companies: [] as string[] },
  ];

  drives.forEach((drive) => {
    const ctc = Number(drive.ctc_lpa) || 0;
    const bracket = ctcBrackets.find((b) => ctc >= b.min && (b.max === 999 ? true : ctc < b.max));
    if (bracket) {
      bracket.count += 1;
      const compName = drive.company_name || 'Drive';
      if (!bracket.companies.includes(compName)) {
        bracket.companies.push(compName);
      }
    }
  });

  const ctcData = ctcBrackets.map((b) => ({
    range: b.range,
    'Active Drives': b.count,
    companies: b.companies.join(', ') || 'None',
  }));

  // 3. Application Funnel Data
  const stageCounts: Record<string, number> = {
    applied: 0,
    shortlisted: 0,
    interview_scheduled: 0,
    selected: 0,
    rejected: 0,
  };

  applications.forEach((app) => {
    const st = app.stage || 'applied';
    if (stageCounts[st] !== undefined) {
      stageCounts[st] += 1;
    } else {
      stageCounts[st] = 1;
    }
  });

  const funnelData = [
    { stage: 'Applied', count: stageCounts.applied, color: '#6366f1' },
    { stage: 'Shortlisted', count: stageCounts.shortlisted, color: '#38bdf8' },
    { stage: 'Interview', count: stageCounts.interview_scheduled, color: '#f59e0b' },
    { stage: 'Selected (Offers)', count: stageCounts.selected, color: '#10b981' },
    { stage: 'Rejected', count: stageCounts.rejected, color: '#f43f5e' },
  ];

  const tooltipStyle = {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderRadius: '0.75rem',
    fontSize: '12px',
    color: '#f8fafc',
  };

  return (
    <div className="space-y-6">
      {/* Chart Row 1: Department Progress (Full width) */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200/80 dark:border-slate-800/80 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Department-Wise Placement Progress & Capacity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total cohort vs Contineo ERP eligible vs placed offers across branches
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              <Award className="w-3.5 h-3.5" />
              <span>Real-time Contineo Sync</span>
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          {deptData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">
              No department placement records available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  stroke="#475569"
                />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} stroke="#475569" />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: any, name: string, item: any) => {
                    if (name === 'Placed / Offers') {
                      return [`${value} students (${item.payload.placementRate}% rate)`, name];
                    }
                    return [`${value} students`, name];
                  }}
                  labelFormatter={(code) => {
                    const match = deptData.find((d) => d.name === code);
                    return match ? `${match.fullName} (${code})` : code;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Total Cohort" fill="#64748b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Contineo Eligible" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Placed / Offers" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart Row 2: CTC Distribution & Application Stage Funnel (Side by side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart A: CTC Distribution */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200/80 dark:border-slate-800/80 mb-4">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                CTC Package Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Active campus drives categorized by salary brackets (LPA)
              </p>
            </div>
          </div>

          <div className="h-64 w-full pt-1">
            {drives.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">
                No active placement drives found.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ctcData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 11 }} stroke="#475569" />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    stroke="#475569"
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(val: any, name: string, item: any) => [
                      `${val} Drive(s) [${item.payload.companies}]`,
                      name,
                    ]}
                  />
                  <Bar dataKey="Active Drives" fill="#a855f7" radius={[6, 6, 0, 0]}>
                    {ctcData.map((entry, index) => (
                      <Cell
                        key={`cell-ctc-${index}`}
                        fill={['#6366f1', '#8b5cf6', '#a855f7', '#ec4899'][index % 4]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart B: Application Funnel */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200/80 dark:border-slate-800/80 mb-4">
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Application Recruitment Funnel
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Candidate progression from applied to selected offers
              </p>
            </div>
          </div>

          <div className="h-64 w-full pt-1">
            {applications.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">
                No candidate applications recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={funnelData}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 25, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    stroke="#475569"
                  />
                  <YAxis
                    dataKey="stage"
                    type="category"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    stroke="#475569"
                    width={90}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(val: any) => [`${val} Candidates`, 'Count']}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-funnel-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
