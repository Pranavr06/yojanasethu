'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/authContext';
import {
  BrainCircuit,
  Target,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  BookOpen,
  Award,
  ShieldCheck,
  Briefcase,
  Zap,
  HelpCircle,
  AlertTriangle,
  RefreshCw,
  BookmarkCheck,
  Code2,
} from 'lucide-react';
import Link from 'next/link';
import {
  TargetCareerRole,
  SkillGapAnalysisResult,
  EvaluatedSkill,
} from '@/types';

const ROLES: {
  key: TargetCareerRole;
  title: string;
  category: string;
  salaryRange: string;
  demandLevel: 'High' | 'Very High' | 'Critical';
  summary: string;
}[] = [
  {
    key: 'Software Developer',
    title: 'Software Developer / SDE',
    category: 'Software Engineering & Cloud',
    salaryRange: '10 – 24 LPA',
    demandLevel: 'Critical',
    summary:
      'Core software development focus spanning full-stack systems, algorithmic problem solving, clean architectures, and database design.',
  },
  {
    key: 'AI/ML Engineer',
    title: 'AI & Machine Learning Engineer',
    category: 'Artificial Intelligence & Data',
    salaryRange: '12 – 28 LPA',
    demandLevel: 'Critical',
    summary:
      'Designing and deploying deep learning models, transformer architectures, vector embeddings, and generative AI pipelines.',
  },
  {
    key: 'Cybersecurity Analyst',
    title: 'Cybersecurity & Defense Analyst',
    category: 'Security & Systems Defense',
    salaryRange: '9 – 22 LPA',
    demandLevel: 'Very High',
    summary:
      'Network security operations, cryptography, vulnerability assessment, Linux systems hardening, and SIEM monitoring.',
  },
];

export default function CareerCoachPage() {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<TargetCareerRole>('Software Developer');
  const [analysis, setAnalysis] = useState<SkillGapAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingTarget, setSavingTarget] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch skill gap analysis from server
  const fetchAnalysis = useCallback(async (role: TargetCareerRole) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/student/skill-gap?targetRole=${encodeURIComponent(role)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.analysis) {
          setAnalysis(data.analysis);
          return;
        }
      }
      const err = await res.json().catch(() => ({}));
      setErrorMsg(err.error || 'Failed to analyze skill gap. Please try again.');
    } catch (err: any) {
      console.error('Skill gap fetch error:', err);
      setErrorMsg(err.message || 'Network error fetching skill gap.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch student career profile on mount to sync initial role
  useEffect(() => {
    async function loadInitialProfile() {
      try {
        const res = await fetch('/api/student/career-profile');
        if (res.ok) {
          const data = await res.json();
          if (data.target_career_role && ROLES.some((r) => r.key === data.target_career_role)) {
            setSelectedRole(data.target_career_role as TargetCareerRole);
            fetchAnalysis(data.target_career_role as TargetCareerRole);
            return;
          }
        }
      } catch {}
      fetchAnalysis('Software Developer');
    }
    loadInitialProfile();
  }, [fetchAnalysis]);

  const handleRoleChange = (role: TargetCareerRole) => {
    setSelectedRole(role);
    setSavedSuccess(false);
    fetchAnalysis(role);
  };

  const handleSetTargetRole = async () => {
    setSavingTarget(true);
    try {
      const res = await fetch('/api/student/career-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_career_role: selectedRole,
        }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Failed to set target role:', e);
    } finally {
      setSavingTarget(false);
    }
  };

  const verifiedStrengths = analysis ? analysis.skills.filter((s) => s.status === 'verified_strength') : [];
  const demonstratedGaps = analysis ? analysis.skills.filter((s) => s.status === 'demonstrated_gap') : [];
  const unassessedSkills = analysis ? analysis.skills.filter((s) => s.status === 'unassessed_missing') : [];

  const getTierLabel = (score: number) => {
    if (score >= 80) return 'Placement Ready (Super Dream / Tier 1)';
    if (score >= 60) return 'Competitive Contender (Product Core)';
    return 'Foundational / Active Up-skilling Required';
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <BrainCircuit className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              AI Career Coach & Skill Gap Analyzer
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
              Deterministic Intelligence
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Explainable placement readiness evaluated against verified campus credentials and actual algorithmic activity. Missing data is never treated as a gap.
          </p>
        </div>

        {/* Action Button: Set as active target */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={savingTarget || loading}
            onClick={handleSetTargetRole}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              savedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Target Saved!</span>
              </>
            ) : (
              <>
                <BookmarkCheck className="w-4 h-4" />
                <span>Set as Active Goal</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Role Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {ROLES.map((role) => {
          const isSelected = selectedRole === role.key;
          return (
            <button
              key={role.key}
              type="button"
              onClick={() => handleRoleChange(role.key)}
              className={`text-left p-4 rounded-2xl border transition-all ${
                isSelected
                  ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 shadow-md ring-2 ring-purple-400/20'
                  : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  {role.category}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {role.salaryRange}
                </span>
              </div>
              <h3 className="mt-2 font-bold text-sm text-slate-900 dark:text-white">
                {role.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                {role.summary}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Analyzing student records and role benchmarks...
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Evaluating verified credentials, Contineo transcript metrics, and DSA pattern accuracy.
          </p>
        </div>
      ) : errorMsg ? (
        <div className="p-8 text-center rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 text-xs">
          {errorMsg}
        </div>
      ) : analysis ? (
        <div className="space-y-6">
          {/* Readiness Score Card */}
          <div className="rounded-3xl border border-purple-200/80 dark:border-purple-900/30 bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-white dark:to-slate-900 p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                    Placement Readiness Audit
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Role: {analysis.target_role}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {getTierLabel(analysis.role_readiness_score)}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {analysis.transparency_note}
                </p>
              </div>

              {/* Big Score Radial/Pill */}
              <div className="flex items-center gap-5 shrink-0 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-black text-purple-600 dark:text-purple-400">
                    {analysis.role_readiness_score}%
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mt-1">
                    Readiness Score
                  </span>
                </div>

                <div className="h-12 w-px bg-slate-200 dark:bg-slate-800" />

                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{verifiedStrengths.length} Strengths</span>
                  </div>
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{demonstratedGaps.length} Gaps</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{unassessedSkills.length} Unassessed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Breakdown Bar */}
            <div className="mt-6 pt-5 border-t border-slate-200/60 dark:border-slate-800/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Verified Credentials</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {analysis.verified_strengths_count} Verified Competencies
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Unverified Claims</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {analysis.demonstrated_gaps_count} Pending Review
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">DSA Patterns Solved</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {analysis.dsa_metrics.solved_count} / {analysis.dsa_metrics.total_patterns} Patterns
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Algorithmic Accuracy</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {analysis.dsa_metrics.overall_accuracy}% Accuracy
                </span>
              </div>
            </div>
          </div>

          {/* DSA Weakness Callout if any */}
          {analysis.dsa_metrics.weak_categories && analysis.dsa_metrics.weak_categories.length > 0 && (
            <div className="rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20 p-4 text-xs flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-900 dark:text-amber-200">
                    Algorithmic Weakness Flagged: {analysis.dsa_metrics.weak_categories.map((w) => w.category).join(', ')}
                  </h4>
                  <p className="mt-0.5 text-amber-800 dark:text-amber-300">
                    Your demonstrated accuracy in these patterns falls below the 70% threshold. Technical interviewers frequently focus on these categories.
                  </p>
                </div>
              </div>
              <Link
                href="/student/dsa-tracker"
                className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors"
              >
                Practice in DSA Tracker
              </Link>
            </div>
          )}

          {/* 3-Column Skills Tri-State Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. Verified Strengths */}
            <div className="rounded-3xl border border-emerald-200/80 dark:border-emerald-900/30 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Verified Strengths ({verifiedStrengths.length})
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                  Evidence Backed
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Skills where your faculty-verified certificates or proctored assessments meet or exceed role expectations.
              </p>

              <div className="space-y-3">
                {verifiedStrengths.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No verified strengths yet for this role benchmark.</p>
                ) : (
                  verifiedStrengths.map((s) => (
                    <div
                      key={s.skill_name}
                      className="p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-950/10 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{s.skill_name}</span>
                        <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                          {s.demonstrated_level}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{s.reason}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 2. Demonstrated Gaps */}
            <div className="rounded-3xl border border-rose-200/80 dark:border-rose-900/30 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Demonstrated Gaps ({demonstratedGaps.length})
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400">
                  Needs Revision
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Areas where assessments or DSA practice showed a performance gap below the placement benchmark.
              </p>

              <div className="space-y-3">
                {demonstratedGaps.length === 0 ? (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    Zero demonstrated gaps found! Excellent baseline.
                  </p>
                ) : (
                  demonstratedGaps.map((s) => (
                    <div
                      key={s.skill_name}
                      className="p-3 rounded-xl border border-rose-100 dark:border-rose-900/30 bg-rose-50/30 dark:bg-rose-950/10 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{s.skill_name}</span>
                        <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">
                          {s.demonstrated_level}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{s.reason}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 3. Unassessed Skills (Missing Data, NOT treated as a gap) */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Unassessed Areas ({unassessedSkills.length})
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  No Exam / Proof
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Required role competencies not yet recorded. Missing data is <em>never</em> treated as proof of failure.
              </p>

              <div className="space-y-3">
                {unassessedSkills.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">All role skills have verified assessment or credential data.</p>
                ) : (
                  unassessedSkills.map((s) => (
                    <div
                      key={s.skill_name}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{s.skill_name}</span>
                        <Link
                          href="/student/certificates"
                          className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Verify Now →
                        </Link>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{s.reason}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Prioritized Recommendations Roadmap */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Prioritized Preparation Roadmap
                </h3>
                <p className="text-xs text-slate-500">
                  Targeted milestones ranked by recruiter impact to qualify for Tier 1 campus rounds.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 self-start sm:self-auto">
                {analysis.prioritized_roadmap.length} Actionable Steps
              </span>
            </div>

            <div className="space-y-4">
              {analysis.prioritized_roadmap.map((rec, index) => (
                <div
                  key={`${rec.skill_or_topic}-${index}`}
                  className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                          rec.priority === 'critical'
                            ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400'
                            : rec.priority === 'high'
                            ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                            : 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400'
                        }`}
                      >
                        {rec.priority}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {rec.skill_or_topic}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {rec.reason}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                      <Target className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>Completion criteria: <strong>{rec.measurable_completion_criterion}</strong></span>
                    </div>
                  </div>

                  {/* Action Link */}
                  {rec.resource_link && (
                    <div className="shrink-0 self-end md:self-auto">
                      <Link
                        href={rec.resource_link}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:white text-white dark:text-slate-900 hover:bg-indigo-600 dark:hover:bg-indigo-400 text-xs font-bold transition-all shadow-sm"
                      >
                        <span>Take Action</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
