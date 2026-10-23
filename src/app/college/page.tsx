'use client';

import React, { useEffect, useState } from 'react';
import MentorApprovalDesk from '@/components/MentorApprovalDesk';
import CohortCharts from '@/components/CohortCharts';
import { CohortSkillMetric, EvidenceSubmission } from '@/types';
import {
  Building2,
  RefreshCw,
} from 'lucide-react';

export default function CollegePage() {
  const [cohortSummary, setCohortSummary] = useState<any>(null);
  const [metrics, setMetrics] = useState<CohortSkillMetric[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<EvidenceSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCollegeData = async () => {
    try {
      // 1. Fetch cohort analytics
      const analyticsRes = await fetch('/api/college/cohort-analytics');
      const analyticsData = await analyticsRes.json();
      if (analyticsData.cohort_summary) {
        setCohortSummary(analyticsData.cohort_summary);
        setMetrics(analyticsData.skill_gap_analytics || []);
        setInterventions(analyticsData.recommended_interventions || []);
      }

      // 2. Fetch pending approvals queue
      const approvalsRes = await fetch('/api/mentor/approvals');
      const approvalsData = await approvalsRes.json();
      if (approvalsData.pending_submissions) {
        setPendingSubmissions(approvalsData.pending_submissions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollegeData();
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. College Hero Banner (Matching reference image UDP 22 style) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1B4B] via-[#0F172A] to-[#1E1B4B] border border-indigo-500/30 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Building2 className="w-3.5 h-3.5" />
              <span>NMAMIT AUTONOMOUS FACULTY DESK</span>
              <span>•</span>
              <span>ISE & CSE Departments</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Cohort Academic & Placement Readiness
            </h1>

            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              NMAM Institute of Technology, Nitte. Real-time academic synchronization with Contineo ERP and human-in-the-loop faculty verification desk for student project proofs.
            </p>
          </div>

          <button
            onClick={() => {
              setLoading(true);
              fetchCollegeData();
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all backdrop-blur-md self-start md:self-center shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Live ERP Data</span>
          </button>
        </div>
      </div>

      {/* 2. Side-by-Side Metric Cards (Matching reference picture COMMUTERS & BOARDING STOPS) */}
      {cohortSummary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-400 dark:hover:border-slate-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
              TOTAL COHORT
            </span>
            <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
              {cohortSummary.total_students}
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
              Registered 2022–2026 Batch
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-400 dark:hover:border-slate-700">
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

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-400 dark:hover:border-slate-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
              PLACEMENT READY
            </span>
            <div className="text-2xl md:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {cohortSummary.placement_ready_count} <span className="text-xs font-normal text-slate-400">/ {cohortSummary.total_students}</span>
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
              CGPA ≥ 7.0 & 0 Backlogs
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-400 dark:hover:border-slate-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
              PENDING VERIFICATIONS
            </span>
            <div className="text-2xl md:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {pendingSubmissions.length} <span className="text-xs font-normal text-slate-400">Proofs</span>
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
              Awaiting Faculty Review
            </span>
          </div>
        </div>
      )}

      {/* 3. Mentor Verification Desk */}
      <div id="verification-desk">
        <MentorApprovalDesk
          pendingSubmissions={pendingSubmissions}
          onRefresh={fetchCollegeData}
        />
      </div>

      {/* 4. Cohort Skill Gap Chart & Actionable Interventions */}
      <div id="cohort-analytics">
        <CohortCharts metrics={metrics} interventions={interventions} />
      </div>
    </div>
  );
}
