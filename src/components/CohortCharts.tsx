'use client';

import React from 'react';
import { CohortSkillMetric } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, AlertOctagon, Sparkles, CheckCircle2 } from 'lucide-react';

interface Props {
  metrics: CohortSkillMetric[];
  interventions: {
    id: string;
    skill_name: string;
    unverified_students: number;
    recommendation: string;
    urgency: string;
  }[];
}

export default function CohortCharts({ metrics, interventions }: Props) {
  // Format data for Recharts
  const chartData = metrics.map((m) => ({
    name: m.skill_name,
    'Faculty Verified': m.verified_count,
    'Pending Review': m.pending_count,
    'Self-Declared Claim': m.self_declared_count,
    'Missing Skill': m.missing_count,
  }));

  return (
    <div className="space-y-6">
      {/* Chart Panel */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800/80 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Department Cohort Skill Gap Breakdown
              </h3>
              <p className="text-xs text-slate-400">
                Aggregated from student_skill_passport and Contineo academic records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" /> Evidenced First
            </span>
          </div>
        </div>

        {/* Recharts Bar Container */}
        <div className="h-72 w-full pt-2">
          {metrics.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No skill passport records found in database to plot cohort analytics.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                stroke="#334155"
              />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} stroke="#334155" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#fff',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
              <Bar
                dataKey="Faculty Verified"
                stackId="a"
                fill="#10b981"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="Pending Review"
                stackId="a"
                fill="#38bdf8"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="Self-Declared Claim"
                stackId="a"
                fill="#f59e0b"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="Missing Skill"
                stackId="a"
                fill="#334155"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
        </div>
      </div>

      {/* Actionable Workshop & Intervention Cards */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h4 className="text-sm font-semibold text-white">
            Targeted Department Interventions (AI Recommender)
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {interventions.length === 0 ? (
            <div className="col-span-full py-6 text-center text-xs text-slate-500 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
              No critical skill deficits detected across the student cohort.
            </div>
          ) : (
            interventions.map((int) => (
            <div
              key={int.id}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors flex items-start gap-3"
            >
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  int.urgency === 'high'
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                }`}
              >
                <AlertOctagon className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-white">
                    {int.skill_name} Deficit Alert
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      int.urgency === 'high'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {int.unverified_students} students unverified
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {int.recommendation}
                </p>
              </div>
            </div>
          ))
        )}
        </div>
      </div>
    </div>
  );
}
