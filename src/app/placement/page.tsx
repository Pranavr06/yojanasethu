'use client';

import React, { useEffect, useState } from 'react';
import { PlacementStats, PlacementDrive, ApplicationStage } from '@/types';
import {
  Briefcase,
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Award,
  Layers,
  Sparkles,
  TrendingUp,
  X,
  Loader2,
} from 'lucide-react';

export default function PlacementDashboardPage() {
  const [stats, setStats] = useState<PlacementStats | null>(null);
  const [drives, setDrives] = useState<any[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState<string>('all');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form states for creating new drive
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newCtc, setNewCtc] = useState('12.0');
  const [newStipend, setNewStipend] = useState('40000');
  const [newMinCgpa, setNewMinCgpa] = useState('7.0');
  const [newMaxBacklogs, setNewMaxBacklogs] = useState('0');
  const [newLocation, setNewLocation] = useState('Bengaluru');
  const [newBranches, setNewBranches] = useState<string[]>(['ISE', 'CSE', 'AIML']);
  const [submittingDrive, setSubmittingDrive] = useState(false);

  const fetchPlacementData = async () => {
    try {
      setLoading(true);
      const [statsRes, drivesRes, appsRes] = await Promise.all([
        fetch('/api/placement/stats'),
        fetch('/api/placement/drives'),
        fetch(`/api/placement/applications${selectedDriveId !== 'all' ? `?driveId=${selectedDriveId}` : ''}`),
      ]);

      const [statsData, drivesData, appsData] = await Promise.all([
        statsRes.json(),
        drivesRes.json(),
        appsRes.json(),
      ]);

      if (statsData.stats) setStats(statsData.stats);
      if (drivesData.drives) setDrives(drivesData.drives);
      if (appsData.applications) setApplications(appsData.applications);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacementData();
  }, [selectedDriveId]);

  const handleStageChange = async (applicationId: string, stage: ApplicationStage) => {
    setUpdatingId(applicationId);
    try {
      const res = await fetch('/api/placement/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, stage }),
      });
      if (res.ok) {
        setApplications((prev) =>
          prev.map((app) => (app.id === applicationId ? { ...app, stage } : app))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingDrive(true);
    try {
      const res = await fetch('/api/placement/drives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: newCompany,
          role_title: newRole,
          ctc_lpa: parseFloat(newCtc),
          stipend_per_month: parseFloat(newStipend),
          min_cgpa: parseFloat(newMinCgpa),
          max_active_backlogs: parseInt(newMaxBacklogs),
          job_location: newLocation,
          eligible_branches: newBranches,
        }),
      });

      if (res.ok) {
        setIsCreateModalOpen(false);
        setNewCompany('');
        setNewRole('');
        fetchPlacementData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingDrive(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Placement Hero Banner (Matching reference image UDP 22 style) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1B4B] via-[#0F172A] to-[#1E1B4B] border border-indigo-500/30 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Building2 className="w-3.5 h-3.5" />
              <span>TRAINING & PLACEMENT CELL (TPO)</span>
              <span>•</span>
              <span>NMAMIT Autonomous</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Campus Placement & Corporate Relations Desk
            </h1>

            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Autonomous Contineo ERP Cutoff Verification Gateway. Orchestrates campus recruitment drives, real-time candidate eligibility gates, and multi-round student offer tracking.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Campus Drive</span>
            </button>

            <button
              onClick={fetchPlacementData}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all backdrop-blur-md"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Placement Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Side-by-Side Metric Cards (Matching reference picture COMMUTERS & BOARDING STOPS) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-400 dark:hover:border-slate-700">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
            ACTIVE DRIVES
          </span>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
            {drives.length} <span className="text-xs font-normal text-slate-400">Companies</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block truncate">
            {drives.length > 0 ? drives.map((d) => d.company_name).slice(0, 3).join(', ') : 'No Active Drives'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-400 dark:hover:border-slate-700">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
            OFFERS GENERATED
          </span>
          <div className="text-2xl md:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {stats ? stats.total_offers : 0} <span className="text-xs font-normal text-slate-400">Offers</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
            Placement Rate: {stats ? `${stats.placement_percentage}%` : 'N/A'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-400 dark:hover:border-slate-700">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
            HIGHEST PACKAGE
          </span>
          <div className="text-2xl md:text-3xl font-extrabold text-purple-600 dark:text-purple-400">
            {stats ? stats.highest_package_lpa : 0} <span className="text-xs font-normal text-slate-400">LPA</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
            Avg CTC: {stats ? `${stats.average_package_lpa} LPA` : 'N/A'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-400 dark:hover:border-slate-700">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
            ELIGIBILITY GATE
          </span>
          <div className="text-2xl md:text-3xl font-extrabold text-sky-600 dark:text-sky-400">
            Contineo
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
            100% Exam Cell Enforced
          </span>
        </div>
      </div>

      {/* 3. Active Campus Recruitment Drives Grid */}
      <div id="drives-list" className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Active & Published Campus Drives ({drives.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Real-time Contineo CGPA & Backlog Cutoff Math
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drives.length === 0 ? (
            <div className="col-span-full py-10 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              No placement drives found in database. Click &quot;Post New Campus Drive&quot; to publish a new drive.
            </div>
          ) : (
            drives.map((d) => (
            <div
              key={d.id}
              className={`p-4 rounded-xl border transition-all ${
                selectedDriveId === d.id
                  ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {d.company_name}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {d.role_title}
                  </span>
                </div>
                <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
                  {d.ctc_lpa} LPA
                </span>
              </div>

              {/* Cutoffs & Rules */}
              <div className="space-y-1 my-3 text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-950/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between">
                  <span>Min CGPA Cutoff:</span>
                  <strong className="text-slate-900 dark:text-white font-mono">{d.min_cgpa.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Max Backlogs Allowed:</span>
                  <strong className="text-slate-900 dark:text-white font-mono">{d.max_active_backlogs}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Eligible Branches:</span>
                  <strong className="text-slate-900 dark:text-white">{d.eligible_branches.join(', ')}</strong>
                </div>
              </div>

              {/* Dynamically calculated live counts */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {d.eligible_students_count} Eligible
                </span>

                <button
                  onClick={() => setSelectedDriveId(selectedDriveId === d.id ? 'all' : d.id)}
                  className={`text-[11px] px-3 py-1 rounded-lg font-bold transition-all ${
                    selectedDriveId === d.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {selectedDriveId === d.id ? 'Viewing Roster' : 'View Applicants'}
                </button>
              </div>
            </div>
          ))
        )}
        </div>
      </div>

      {/* 4. Department Placement Readiness Matrix */}
      {stats && stats.department_stats && (
        <div id="department-stats" className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Department Placement Distribution & Batch Readiness
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.department_stats.map((dept) => (
              <div
                key={dept.department_code}
                className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {dept.department_name} ({dept.department_code})
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {dept.placement_rate}% Placed
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${dept.placement_rate}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-400 block">Cohort</span>
                    <strong className="text-slate-800 dark:text-slate-200">{dept.total_students}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Eligible</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">{dept.eligible_students}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Offers</span>
                    <strong className="text-indigo-600 dark:text-indigo-400">{dept.placed_students}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Student Application Roster & Stage Management */}
      <div id="student-offers" className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Candidate Drive Roster & Status Management ({applications.length})
            </h3>
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            {selectedDriveId !== 'all' ? `Filtered by Selected Drive` : 'All Campus Drive Applicants'}
          </span>
        </div>

        <div className="space-y-3">
          {applications.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              No candidate applications found in database for this drive.
            </div>
          ) : (
            applications.map((app) => (
            <div
              key={app.id}
              className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {app.student_name}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {app.student_usn}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                    {app.student_department} • CGPA {app.cgpa.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-medium bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                    <ShieldCheck className="w-3 h-3" /> Contineo Verified
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Applied For:{' '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {app.company_name} — {app.role_title}
                  </strong>
                  {app.notes && (
                    <span className="text-slate-500 block text-[11px] mt-0.5">{app.notes}</span>
                  )}
                </p>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <div className="flex items-center gap-1.5">
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Recruitment Stage:
                  </label>
                  <select
                    value={app.stage}
                    disabled={updatingId === app.id}
                    onChange={(e) => handleStageChange(app.id, e.target.value as ApplicationStage)}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="applied">Applied</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="interview_scheduled">Interview Scheduled</option>
                    <option value="selected">Selected (Offer Released)</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {app.stage === 'selected' && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                    Offer Released
                  </span>
                )}
              </div>
            </div>
          ))
        )}
        </div>
      </div>

      {/* Modal: Create Campus Placement Drive */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg glass-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    Post New Campus Placement Drive
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Publishes campus recruitment drive with Contineo eligibility rules
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDrive} className="space-y-3.5 my-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Goldman Sachs India"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  Role Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Software Development Analyst"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    CTC Package (LPA)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newCtc}
                    onChange={(e) => setNewCtc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Minimum CGPA Cutoff
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={newMinCgpa}
                    onChange={(e) => setNewMinCgpa(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Max Active Backlogs Allowed
                  </label>
                  <input
                    type="number"
                    value={newMaxBacklogs}
                    onChange={(e) => setNewMaxBacklogs(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDrive}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-medium shadow-md shadow-indigo-600/20 disabled:opacity-60"
                >
                  {submittingDrive ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <span>Publish Campus Drive</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
