'use client';

import React, { useEffect, useState } from 'react';
import { GeminiDriveSkillGapAnalysis } from '@/types';
import {
  Sparkles,
  Bot,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Building2,
  Users,
  Award,
  BookOpen,
  ArrowRight,
  TrendingDown,
  RefreshCw,
  X,
  ShieldCheck,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import Link from 'next/link';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  driveId: string;
  studentIdOrUsn?: string;
  initialAnalysis?: GeminiDriveSkillGapAnalysis | null;
}

export default function GeminiDriveSkillGapModal({
  isOpen,
  onClose,
  driveId,
  studentIdOrUsn,
  initialAnalysis,
}: Props) {
  const [analysis, setAnalysis] = useState<GeminiDriveSkillGapAnalysis | null>(initialAnalysis || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');

  const fetchAnalysis = async (refresh: boolean = false) => {
    if (!driveId) return;
    setLoading(true);
    setError(null);
    try {
      const url = `/api/placement/ai-drive-analysis?driveId=${encodeURIComponent(driveId)}${
        studentIdOrUsn ? `&studentId=${encodeURIComponent(studentIdOrUsn)}` : ''
      }`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.analysis) {
        setAnalysis(data.analysis);
      } else {
        setError(data.error || 'Failed to generate Gemini AI drive analysis.');
      }
    } catch (e: any) {
      console.error('Error fetching Gemini AI drive analysis:', e);
      setError(e.message || 'Network error fetching Gemini analysis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && driveId) {
      if (!initialAnalysis || initialAnalysis.drive_id !== driveId) {
        fetchAnalysis();
      } else {
        setAnalysis(initialAnalysis);
      }
    }
  }, [isOpen, driveId, initialAnalysis]);

  if (!isOpen) return null;

  // Filter candidates
  const filteredCandidates = (analysis?.eligible_candidates || []).filter((c) => {
    const q = filterQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.student_name.toLowerCase().includes(q) ||
      c.student_usn.toLowerCase().includes(q) ||
      c.department_code.toLowerCase().includes(q) ||
      c.lacking_skills.some((ls) => ls.skill_name.toLowerCase().includes(q))
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 border border-white/20 text-purple-200">
                <Bot className="w-3.5 h-3.5 text-amber-300" />
                <span>GOOGLE GEMINI AI PLACEMENT ENGINE</span>
                <span>•</span>
                <span>Campus Recruiter Skill Audit</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white">
                {analysis?.company_name || 'Campus Recruiter'} — {analysis?.role_title || 'Placement Drive'}
              </h2>

              <p className="text-xs text-purple-200/80">
                AI evaluation of eligible campus candidates and the exact skill sets they are lacking for this recruiter.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                Gemini AI is analyzing candidate skill sets against recruiter requirements...
              </p>
              <p className="text-slate-400 text-[11px] mt-1">
                Comparing verified skill passports with campus drive specifications.
              </p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => fetchAnalysis(true)}
                className="px-3 py-1 rounded-lg bg-rose-600 text-white font-semibold"
              >
                Retry
              </button>
            </div>
          ) : analysis ? (
            <>
              {/* Executive Summary Card */}
              <div className="p-5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Gemini AI Assessment & Talent Readiness</span>
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300">
                    {analysis.ai_provider === 'gemini' ? 'Live Gemini AI' : 'Deterministic AI Fallback'}
                  </span>
                </div>

                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                  {analysis.executive_summary}
                </p>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>Preparation Advisory for Candidates:</span>
                  </div>
                  <p>{analysis.preparation_advisory}</p>
                </div>
              </div>

              {/* Cohort Skill Gap Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Top Skill Sets Lacking in Eligible Cohort
                    </h3>
                    <p className="text-slate-500 text-[11px]">
                      Required skills where candidates demonstrate deficit or missing verified credentials.
                    </p>
                  </div>

                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                    {analysis.eligible_candidates_count} Eligible Students
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {analysis.top_lacking_skills.map((s) => (
                    <div
                      key={s.skill_name}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          {s.skill_name}
                        </span>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                            s.importance === 'mandatory'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {s.importance}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span>Missing in:</span>
                          <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                            {s.missing_count} of {analysis.eligible_candidates_count} ({s.percentage}%)
                          </span>
                        </div>

                        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-rose-500 rounded-full"
                            style={{ width: `${s.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Eligible Candidates Roster with Missing Skill Sets */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Eligible Candidates & Missing Skill Sets ({filteredCandidates.length})</span>
                    </h3>
                    <p className="text-slate-500 text-[11px]">
                      Candidates who meet academic cutoffs (CGPA & Backlogs) and their exact skill deficits.
                    </p>
                  </div>

                  <input
                    type="search"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Search candidate or lacking skill..."
                    className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-purple-500 max-w-xs"
                  />
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {filteredCandidates.map((candidate) => (
                    <div
                      key={candidate.student_id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-purple-300 dark:hover:border-slate-700 transition-colors"
                    >
                      {/* Candidate Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {candidate.student_name}
                          </span>
                          <span className="font-mono text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {candidate.student_usn}
                          </span>
                          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                            {candidate.department_code}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs">
                          <span>
                            CGPA: <strong className="font-mono text-slate-900 dark:text-white">{candidate.cgpa.toFixed(2)}</strong>
                          </span>
                          <span>•</span>
                          <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                            {candidate.match_score}% Skill Match
                          </span>
                        </div>
                      </div>

                      {/* Lacking Skill Sets */}
                      {candidate.lacking_skills.length > 0 ? (
                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase font-bold text-rose-500 tracking-wider block">
                            Skill Sets Lacking for this Drive:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {candidate.lacking_skills.map((ls) => (
                              <div
                                key={ls.skill_name}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 text-[11px] flex items-center gap-1.5"
                                title={ls.reason}
                              >
                                <XCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                <span className="font-bold">{ls.skill_name}</span>
                                <span className="text-[9px] uppercase opacity-75">
                                  ({ls.importance})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Candidate possesses all required technical skills for this recruiter!</span>
                        </div>
                      )}

                      {/* Possessed Skills */}
                      {candidate.possessed_skills.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                          <span className="text-slate-400">Verified Strengths:</span>
                          {candidate.possessed_skills.map((ps) => (
                            <span
                              key={ps}
                              className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium"
                            >
                              ✓ {ps}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Gemini Recommendation */}
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 text-[11px] text-slate-600 dark:text-slate-400 italic flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span>{candidate.gemini_recommendation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shrink-0">
          <div className="text-slate-500 text-[11px]">
            Analysis performed using Google Gemini AI and Contineo Examination Truth.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchAnalysis(true)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-1.5 hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Re-Analyze</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-sm transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
