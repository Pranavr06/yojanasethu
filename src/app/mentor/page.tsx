'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { EvidenceSubmission, AcademicCorrectionRequest } from '@/types';
import {
  Building2,
  RefreshCw,
  ShieldCheck,
  FileCheck2,
  Users,
  BarChart3,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Github,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';

export default function MentorDashboardPage() {
  const { user } = useAuth();
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [departments, setDepartments] = useState<{ code: string; name: string }[]>([]);

  // Live Data States
  const [cohortSummary, setCohortSummary] = useState<any>(null);
  const [submissions, setSubmissions] = useState<EvidenceSubmission[]>([]);
  const [corrections, setCorrections] = useState<AcademicCorrectionRequest[]>([]);
  const [mentees, setMentees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMentorData = async () => {
    setLoading(true);
    try {
      const [deptRes, analyticsRes, subRes, corrRes, menteeRes] = await Promise.all([
        fetch('/api/mentor/departments'),
        fetch('/api/college/cohort-analytics'),
        fetch(`/api/mentor/submissions?status=all&dept=${selectedDept}`),
        fetch('/api/mentor/corrections'),
        fetch(`/api/mentor/mentees?dept=${selectedDept}`),
      ]);

      const [deptData, analyticsData, subData, corrData, menteeData] = await Promise.all([
        deptRes.json(),
        analyticsRes.json(),
        subRes.json(),
        corrRes.json(),
        menteeRes.json(),
      ]);

      if (deptData.departments) setDepartments(deptData.departments);
      if (analyticsData.cohort_summary) setCohortSummary(analyticsData.cohort_summary);
      if (subData.submissions) setSubmissions(subData.submissions);
      if (corrData.requests) setCorrections(corrData.requests);
      if (menteeData.mentees) setMentees(menteeData.mentees);
    } catch (e) {
      console.error('Failed to fetch mentor dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorData();
  }, [selectedDept]);

  const pendingApprovalsCount = submissions.filter((s) => s.status === 'pending').length;
  const pendingCorrectionsCount = corrections.filter((c) => c.status === 'pending').length;
  const placementReadyCount = mentees.filter((m) => m.is_placement_ready).length;

  return (
    <div className="space-y-6">
      {/* 1. Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1B4B] via-[#0F172A] to-[#1E1B4B] border border-indigo-500/30 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Building2 className="w-3.5 h-3.5" />
              <span>NMAMIT AUTONOMOUS FACULTY DESK</span>
              <span>•</span>
              <span>Contineo ERP & Verification Engine</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Faculty & Mentor Readiness Gateway
            </h1>

            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Welcome, <strong className="text-white">{user?.full_name || 'Dr. K. Sharma'}</strong>.
              Review student codebase proofs, synchronize grade correction claims with Autonomous Exam Cell, and track mentee academic readiness.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            {/* Department Filter */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs">
              <Filter className="w-3.5 h-3.5 text-indigo-300" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900 text-white">
                  All 15 Branches
                </option>
                {departments.map((d) => (
                  <option key={d.code} value={d.code} className="bg-slate-900 text-white">
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sync Live ERP Data */}
            <button
              onClick={fetchMentorData}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all backdrop-blur-md shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Live ERP</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Real-Time Metric KPI Cards */}
      {cohortSummary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
              TOTAL MENTEES
            </span>
            <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
              {mentees.length || cohortSummary.total_students}
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
              Registered 2026 Batch
            </span>
          </div>

          <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
              AVERAGE CGPA
            </span>
            <div className="text-2xl md:text-3xl font-extrabold text-sky-600 dark:text-sky-400">
              {cohortSummary.average_cgpa} <span className="text-xs font-normal text-slate-400">/ 10.0</span>
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
              Autonomous Exam Cell
            </span>
          </div>

          <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
              PLACEMENT READY
            </span>
            <div className="text-2xl md:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {placementReadyCount}
              <span className="text-xs font-normal text-slate-400"> / {mentees.length || cohortSummary.total_students}</span>
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
              CGPA ≥ 7.0 & 0 Backlogs
            </span>
          </div>

          <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
              PENDING PROOFS
            </span>
            <div className="text-2xl md:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {pendingApprovalsCount} <span className="text-xs font-normal text-slate-400">Proofs</span>
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
              Awaiting Code Review
            </span>
          </div>

          <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-400 col-span-2 md:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
              GRADE CORRECTIONS
            </span>
            <div className="text-2xl md:text-3xl font-extrabold text-purple-600 dark:text-purple-400">
              {pendingCorrectionsCount} <span className="text-xs font-normal text-slate-400">Claims</span>
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
              Exam Cell Sync Requests
            </span>
          </div>
        </div>
      )}

      {/* 3. Dedicated Workspace Navigation Cards (Each points to its dedicated PAGE!) */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Mentor Workspace Pages
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Evidence Verification Desk Page */}
          <Link
            href="/mentor/verifications"
            className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-lg transition-all group block"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              {pendingApprovalsCount > 0 && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
                  {pendingApprovalsCount} Action Required
                </span>
              )}
            </div>

            <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center justify-between">
              <span>Faculty Evidence Verification Desk</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Dedicated page to review submitted GitHub code repositories, live projects, and certificate PDFs from Supabase Storage. Endorsements unlock recruiter points.
            </p>
          </Link>

          {/* Card 2: Contineo ERP Correction Desk Page */}
          <Link
            href="/mentor/corrections"
            className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 hover:shadow-lg transition-all group block"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                <FileCheck2 className="w-6 h-6" />
              </div>
              {pendingCorrectionsCount > 0 && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30">
                  {pendingCorrectionsCount} Pending
                </span>
              )}
            </div>

            <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex items-center justify-between">
              <span>Academic ERP Correction Desk</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Dedicated page to validate student revaluation claims, makeup exam backlog clearances, and synchronize Contineo ERP records with Autonomous Exam Cell.
            </p>
          </Link>

          {/* Card 3: Mentee Student Directory Page */}
          <Link
            href="/mentor/mentees"
            className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:shadow-lg transition-all group block"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                <Users className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30">
                {mentees.length} Students
              </span>
            </div>

            <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center justify-between">
              <span>Mentee Student Directory & Academic Standings</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Dedicated page to search, filter, and track all mentees across 15 engineering branches with Contineo CGPA, active backlogs, and verified skill counts.
            </p>
          </Link>

          {/* Card 4: Cohort Skill Gap Analytics Page */}
          <Link
            href="/mentor/analytics"
            className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:shadow-lg transition-all group block"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                <BarChart3 className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/30">
                Live Recharts
              </span>
            </div>

            <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center justify-between">
              <span>Cohort Skill Gap Analytics & Interventions</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Dedicated page displaying automated skill gap percentage bar charts across the batch and recommended faculty workshops.
            </p>
          </Link>
        </div>
      </div>

      {/* 4. Live Queues Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Pending Evidence */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Pending Code & Credential Proofs ({pendingApprovalsCount})
              </h4>
            </div>
            <Link
              href="/mentor/verifications"
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {submissions.filter((s) => s.status === 'pending').slice(0, 3).map((sub) => (
              <div
                key={sub.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {sub.student_name} ({sub.student_usn})
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                    {sub.title}
                  </div>
                </div>
                <Link
                  href="/mentor/verifications"
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors shrink-0"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Academic Corrections */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-purple-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Pending Contineo Grade Corrections ({pendingCorrectionsCount})
              </h4>
            </div>
            <Link
              href="/mentor/corrections"
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {corrections.filter((c) => c.status === 'pending').slice(0, 3).map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {c.student_name} ({c.student_usn})
                  </div>
                  <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium line-clamp-1">
                    {c.subject_or_semester}
                  </div>
                </div>
                <Link
                  href="/mentor/corrections"
                  className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] transition-colors shrink-0"
                >
                  Verify
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
