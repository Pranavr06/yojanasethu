'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Users,
  Layers,
  Building2,
  CheckCircle2,
  BookmarkCheck,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Clock,
  Check,
  Calendar,
} from 'lucide-react';
import { PlacementDrive, CandidateEvaluation } from '@/types';

export default function RecruiterOverviewDashboard() {
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<CandidateEvaluation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const drivesRes = await fetch('/api/recruiter/jobs');
      const drivesData = await drivesRes.json();
      const loadedDrives: PlacementDrive[] = drivesData.drives || [];
      setDrives(loadedDrives);

      if (loadedDrives.length > 0) {
        const firstDriveId = loadedDrives[0].id;
        const [candRes, appsRes] = await Promise.all([
          fetch(`/api/recruiter/candidates?driveId=${firstDriveId}`),
          fetch(`/api/recruiter/applications?driveId=${firstDriveId}`),
        ]);

        const candData = await candRes.json();
        const appsData = await appsRes.json();

        setCandidates(candData.eligible_candidates || []);
        setApplications(appsData.applications || []);
      }
    } catch (e) {
      console.error('Error fetching recruiter dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const topCtc = drives.length > 0 ? Math.max(...drives.map((d) => d.ctc_lpa)) : 0;
  const avgCgpa =
    drives.length > 0
      ? (drives.reduce((acc, d) => acc + d.min_cgpa, 0) / drives.length).toFixed(2)
      : '0.00';

  const shortlistedCount = applications.filter(
    (a) => a.stage === 'shortlisted' || a.stage === 'interview_scheduled' || a.stage === 'interview_completed'
  ).length;

  const selectedCount = applications.filter(
    (a) => a.stage === 'selected' || a.stage === 'offered' || a.stage === 'placed'
  ).length;

  return (
    <div className="space-y-6">
      {/* 1. HERO HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-purple-200">
              <Building2 className="w-3.5 h-3.5 text-purple-300" />
              <span>Campus Recruitment Desk • NMAM Institute of Technology</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Recruiter Talent Intelligence Center
            </h1>
            <p className="text-xs md:text-sm text-purple-200/90 max-w-2xl leading-relaxed">
              Evidence-based hiring portal with verified student skill passports, Contineo ERP academic truth, and streamlined shortlist workflows.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all backdrop-blur-md"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Desk</span>
            </button>

            <Link
              href="/recruiter/candidates"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg transition-all"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Search Talent</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. SUMMARY METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              ACTIVE DRIVES
            </span>
            <Briefcase className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
            {drives.length} <span className="text-xs font-normal text-slate-400">Roles</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Top CTC: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{topCtc} LPA</strong>
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              QUALIFIED CANDIDATES
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {candidates.length} <span className="text-xs font-normal text-slate-400">Students</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Passed CGPA & Cutoff Gate
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              IN SHORTLIST PIPELINE
            </span>
            <BookmarkCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-purple-600 dark:text-purple-400">
            {shortlistedCount} <span className="text-xs font-normal text-slate-400">In Pipeline</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Under active review
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              OFFERS EXTENDED
            </span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {selectedCount} <span className="text-xs font-normal text-slate-400">Placed</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Final job selections
          </span>
        </div>
      </div>

      {/* 3. CORE MODULE CARDS (THE 3 DEDICATED RECRUITER PAGES) */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
          Recruitment Workspace Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Placement Drives */}
          <Link
            href="/recruiter/drives"
            className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 shadow-sm hover:border-purple-500 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
                <Briefcase className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Placement Drives & Criteria
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  View and manage corporate campus drives, explore CTC packages, minimum CGPA gates, and branch requirements.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>{drives.length} Active Drives</span>
                <span>•</span>
                <span>Batch {drives[0]?.batch_year || 2026}</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400">
              <span>Open Placement Drives</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Ranked Candidates */}
          <Link
            href="/recruiter/candidates"
            className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 shadow-sm hover:border-purple-500 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Ranked Candidates & Pipeline
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Search talent with keyword & skill discovery (Python, AWS, React), ATS match scoring, compare candidates, and manage shortlist stages.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>Keyword & Skill Search</span>
                <span>•</span>
                <span>ATS Scoring</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <span>Search Ranked Candidates</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Contineo Cutoff Filter */}
          <Link
            href="/recruiter/cutoff"
            className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 shadow-sm hover:border-purple-500 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Contineo Cutoff Filter
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Simulate cutoff thresholds, adjust minimum CGPA sliders, backlogs limits, and analyze real-time cohort qualification distributions.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>Interactive Sliders</span>
                <span>•</span>
                <span>Cohort Distribution</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span>Simulate Cutoffs</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* 4. ACTIVE DRIVES SNAPSHOT */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Active Placement Drives Snapshot</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Current campus recruitment drives active in the YojanaSethu database.
            </p>
          </div>

          <Link
            href="/recruiter/drives"
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            <span>View All Drives</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-10 text-center">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading placement drives...</p>
          </div>
        ) : drives.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No active placement drives found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="pb-2">Company & Role</th>
                  <th className="pb-2">Package</th>
                  <th className="pb-2">Cutoffs</th>
                  <th className="pb-2">Branches</th>
                  <th className="pb-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {drives.slice(0, 5).map((drive) => (
                  <tr key={drive.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {drive.company_name}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {drive.role_title}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-extrabold font-mono">
                        {drive.ctc_lpa} LPA
                      </span>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">
                      <span>Min CGPA: <strong className="font-mono">{drive.min_cgpa.toFixed(2)}</strong></span>
                      <span className="block text-[10px] text-slate-400">Max Backlogs: {drive.max_active_backlogs}</span>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {drive.eligible_branches.slice(0, 3).map((b) => (
                          <span
                            key={b}
                            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300"
                          >
                            {b}
                          </span>
                        ))}
                        {drive.eligible_branches.length > 3 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{drive.eligible_branches.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/recruiter/candidates?driveId=${drive.id}`}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all inline-flex items-center gap-1"
                        >
                          <Users className="w-3 h-3" />
                          <span>Rank</span>
                        </Link>
                        <Link
                          href={`/recruiter/cutoff?driveId=${drive.id}`}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all inline-flex items-center"
                          title="Simulate Cutoff"
                        >
                          <Layers className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
