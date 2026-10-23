'use client';

import React, { useEffect, useState } from 'react';
import MentorApprovalDesk from '@/components/MentorApprovalDesk';
import MentorCorrectionDesk from '@/components/MentorCorrectionDesk';
import MentorMenteeDirectory from '@/components/MentorMenteeDirectory';
import CohortCharts from '@/components/CohortCharts';
import { CohortSkillMetric, EvidenceSubmission, AcademicCorrectionRequest } from '@/types';
import { useAuth } from '@/lib/authContext';
import {
  Building2,
  RefreshCw,
  ShieldCheck,
  FileCheck2,
  Users,
  BarChart3,
  GraduationCap,
  Sparkles,
  AlertCircle,
  Filter,
} from 'lucide-react';

export default function MentorDashboardPage() {
  const { user } = useAuth();
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [departments, setDepartments] = useState<{ code: string; name: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'approvals' | 'corrections' | 'mentees' | 'analytics'>('approvals');

  // Live Data States
  const [cohortSummary, setCohortSummary] = useState<any>(null);
  const [metrics, setMetrics] = useState<CohortSkillMetric[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<EvidenceSubmission[]>([]);
  const [corrections, setCorrections] = useState<AcademicCorrectionRequest[]>([]);
  const [mentees, setMentees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMentorData = async () => {
    setLoading(true);
    try {
      // 1. Fetch departments
      const deptsRes = await fetch('/api/mentor/departments');
      const deptsData = await deptsRes.json();
      if (deptsData.departments) {
        setDepartments(deptsData.departments);
      }

      // 2. Fetch cohort summary & skill gap analytics
      const analyticsRes = await fetch('/api/college/cohort-analytics');
      const analyticsData = await analyticsRes.json();
      if (analyticsData.cohort_summary) {
        setCohortSummary(analyticsData.cohort_summary);
        setMetrics(analyticsData.skill_gap_analytics || []);
        setInterventions(analyticsData.recommended_interventions || []);
      }

      // 3. Fetch submissions (all for mentor review)
      const subRes = await fetch(`/api/mentor/submissions?status=all&dept=${selectedDept}`);
      const subData = await subRes.json();
      if (subData.submissions) {
        setSubmissions(subData.submissions);
      }

      // 4. Fetch academic correction requests
      const corrRes = await fetch('/api/mentor/corrections');
      const corrData = await corrRes.json();
      if (corrData.requests) {
        setCorrections(corrData.requests);
      }

      // 5. Fetch mentees
      const menteesRes = await fetch(`/api/mentor/mentees?dept=${selectedDept}`);
      const menteesData = await menteesRes.json();
      if (menteesData.mentees) {
        setMentees(menteesData.mentees);
      }
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
              Review student codebase proofs, synchronize grade correction claims with Autonomous Exam Cell, and guide cohort placement readiness.
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

      {/* 2. Top Metric Cards */}
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
              {mentees.filter((m) => m.is_placement_ready).length || cohortSummary.placement_ready_count}
              <span className="text-xs font-normal text-slate-400"> / {mentees.length || cohortSummary.total_students}</span>
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
              CGPA ≥ 7.0 & 0 Backlogs
            </span>
          </div>

          <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
              EVIDENCE VERIFICATION
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

      {/* 3. Navigation Workspace Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 ${
            activeTab === 'approvals'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Evidence Verification Desk</span>
          {pendingApprovalsCount > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === 'approvals'
                  ? 'bg-white text-indigo-700'
                  : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
              }`}
            >
              {pendingApprovalsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('corrections')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 ${
            activeTab === 'corrections'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Contineo ERP Corrections</span>
          {pendingCorrectionsCount > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === 'corrections'
                  ? 'bg-white text-indigo-700'
                  : 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300'
              }`}
            >
              {pendingCorrectionsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('mentees')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 ${
            activeTab === 'mentees'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Mentee Academic Directory</span>
          <span className="text-[10px] opacity-70">({mentees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 ${
            activeTab === 'analytics'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Skill Gap Analytics & AI</span>
        </button>
      </div>

      {/* 4. Active Tab Content */}
      {activeTab === 'approvals' && (
        <div id="verification-desk" className="animate-in fade-in duration-200">
          <MentorApprovalDesk
            pendingSubmissions={submissions}
            onRefresh={fetchMentorData}
            reviewerName={user?.full_name ? `${user.full_name} (Faculty Mentor)` : undefined}
          />
        </div>
      )}

      {activeTab === 'corrections' && (
        <div id="correction-desk" className="animate-in fade-in duration-200">
          <MentorCorrectionDesk
            requests={corrections}
            onRefresh={fetchMentorData}
          />
        </div>
      )}

      {activeTab === 'mentees' && (
        <div id="mentee-roster" className="animate-in fade-in duration-200">
          <MentorMenteeDirectory
            mentees={mentees}
            departments={departments}
            selectedDept={selectedDept}
            onSelectDept={setSelectedDept}
          />
        </div>
      )}

      {activeTab === 'analytics' && (
        <div id="cohort-analytics" className="animate-in fade-in duration-200">
          <CohortCharts metrics={metrics} interventions={interventions} />
        </div>
      )}
    </div>
  );
}
