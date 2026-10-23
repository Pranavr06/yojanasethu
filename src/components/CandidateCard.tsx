'use client';

import React from 'react';
import { CandidateEvaluation } from '@/types';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  candidate: CandidateEvaluation;
  rank: number;
}

export default function CandidateCard({ candidate, rank }: Props) {
  const { student, match_score, is_eligible, skill_breakdown, explanation } = candidate;

  return (
    <div
      className={`p-5 rounded-2xl glass-card transition-all ${
        is_eligible
          ? 'border-slate-200 dark:border-slate-800/80 hover:border-indigo-500/40 bg-white dark:bg-slate-900/60'
          : 'border-rose-200 dark:border-rose-950/40 bg-rose-50/50 dark:bg-rose-950/10 opacity-80'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Student Information */}
        <div className="flex items-start gap-3.5">
          {/* Rank Badge */}
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
              rank === 1 && is_eligible
                ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 shadow-sm'
                : rank === 2 && is_eligible
                ? 'bg-slate-200 dark:bg-slate-400/20 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-400/40'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}
          >
            #{rank}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {student.profile.full_name}
              </h4>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {student.profile.usn}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                {student.profile.department_code} • Sem {student.profile.semester}
              </span>
              {student.academic_record?.is_verified_by_exam_cell && (
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-medium bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" /> Contineo Verified
                </span>
              )}
            </div>

            {/* Academic stats */}
            {student.academic_record ? (
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span>
                  CGPA:{' '}
                  <strong className="text-slate-900 dark:text-white font-mono">
                    {student.academic_record.cgpa.toFixed(2)}
                  </strong>
                </span>
                <span>
                  Backlogs:{' '}
                  <strong
                    className={
                      student.academic_record.active_backlogs > 0
                        ? 'text-rose-600 dark:text-rose-400 font-mono'
                        : 'text-emerald-600 dark:text-emerald-400 font-mono'
                    }
                  >
                    {student.academic_record.active_backlogs}
                  </strong>
                </span>
                <span>
                  Earned Credits:{' '}
                  <strong className="text-slate-700 dark:text-slate-300 font-mono">
                    {student.academic_record.total_earned_credits}
                  </strong>
                </span>
              </div>
            ) : (
              <div className="text-xs text-slate-400 mt-1 italic">
                No Contineo academic record linked
              </div>
            )}
          </div>
        </div>

        {/* Right: Match Score Dial */}
        <div className="flex items-center gap-4 self-end md:self-center shrink-0">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block">
              Evidence Match
            </span>
            <div className="flex items-baseline gap-1 justify-end">
              <span
                className={`text-2xl font-bold font-mono ${
                  match_score >= 80
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : match_score >= 50
                    ? 'text-sky-600 dark:text-sky-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {match_score}%
              </span>
            </div>
          </div>

          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm border ${
              is_eligible
                ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30'
                : 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30'
            }`}
          >
            {is_eligible ? 'PASS' : 'FAIL'}
          </div>
        </div>
      </div>

      {/* Skill Breakdown Badges */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
          Required Skill Verification Audit:
        </span>
        <div className="flex flex-wrap gap-2">
          {skill_breakdown.map((sb, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                sb.status === 'verified'
                  ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                  : sb.status === 'claimed'
                  ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800'
              }`}
            >
              {sb.status === 'verified' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : sb.status === 'claimed' ? (
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600" />
              )}
              <span>{sb.skill_name}</span>

              {sb.status === 'verified' && (
                <span className="text-[9px] uppercase font-bold text-emerald-600 dark:text-emerald-400 ml-1">
                  Mentor Verified
                </span>
              )}

              {sb.evidence_url && (
                <a
                  href={sb.evidence_url}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  title="Inspect Proof Repository"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Decision Rationale */}
      <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 text-xs">
        <span className="font-semibold text-slate-500 dark:text-slate-400 mr-1.5">Decision Rationale:</span>
        <span className={is_eligible ? 'text-slate-700 dark:text-slate-300' : 'text-rose-600 dark:text-rose-300'}>
          {explanation}
        </span>
      </div>
    </div>
  );
}
