'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { PlacementStats, PlacementDrive, ApplicationStage } from '@/types';
import PlacementCharts from '@/components/PlacementCharts';
import EligibleStudentModal from '@/components/EligibleStudentModal';
import AnnouncementFormModal from '@/components/AnnouncementFormModal';
import AddRecruiterModal from '@/components/AddRecruiterModal';
import AssignMentorModal from '@/components/AssignMentorModal';
import { RecruiterProfile } from '@/types';
import Link from 'next/link';
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
  Download,
  Filter,
  Calendar,
  RotateCcw,
  UserPlus,
  Globe,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

export default function PlacementDashboardPage() {
  const [stats, setStats] = useState<PlacementStats | null>(null);
  const [drives, setDrives] = useState<any[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState<string>('all');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Enhancement 2: Filter States
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Enhancement 3: Eligible Student Viewer State
  const [auditDrive, setAuditDrive] = useState<PlacementDrive | null>(null);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isAddRecruiterModalOpen, setIsAddRecruiterModalOpen] = useState(false);
  const [isAssignMentorModalOpen, setIsAssignMentorModalOpen] = useState(false);
  const [recruiters, setRecruiters] = useState<RecruiterProfile[]>([]);
  const [placementTab, setPlacementTab] = useState<'drives' | 'recruiters'>('drives');
  const [recruiterSearch, setRecruiterSearch] = useState('');

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
      const [statsRes, drivesRes, appsRes, recsRes] = await Promise.all([
        fetch('/api/placement/stats'),
        fetch('/api/placement/drives'),
        fetch(`/api/placement/applications${selectedDriveId !== 'all' ? `?driveId=${selectedDriveId}` : ''}`),
        fetch('/api/placement/recruiters'),
      ]);

      const [statsData, drivesData, appsData, recsData] = await Promise.all([
        statsRes.json(),
        drivesRes.json(),
        appsRes.json(),
        recsRes.json(),
      ]);

      if (statsData.stats) setStats(statsData.stats);
      if (drivesData.drives) setDrives(drivesData.drives);
      if (appsData.applications) setApplications(appsData.applications);
      if (recsData.recruiters) setRecruiters(recsData.recruiters);
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

  // Available filter options
  const availableBatches = useMemo(() => {
    const years = new Set<string>();
    drives.forEach((d) => {
      if (d.batch_year) years.add(String(d.batch_year));
    });
    years.add('2026');
    years.add('2025');
    return Array.from(years).sort().reverse();
  }, [drives]);

  const availableBranches = useMemo(() => {
    const branches = new Set<string>();
    if (stats?.department_stats) {
      stats.department_stats.forEach((ds) => branches.add(ds.department_code));
    }
    drives.forEach((d) => {
      if (Array.isArray(d.eligible_branches)) {
        d.eligible_branches.forEach((b: string) => branches.add(b));
      }
    });
    return Array.from(branches).sort();
  }, [stats, drives]);

  // Reactive filtering across drives
  const filteredDrives = useMemo(() => {
    return drives.filter((d) => {
      if (selectedBatch !== 'all' && String(d.batch_year) !== selectedBatch) {
        return false;
      }
      if (
        selectedBranch !== 'all' &&
        Array.isArray(d.eligible_branches) &&
        !d.eligible_branches.includes(selectedBranch)
      ) {
        return false;
      }
      if (selectedStatus !== 'all' && d.recruitment_status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [drives, selectedBatch, selectedBranch, selectedStatus]);

  // Reactive filtering across applications
  const filteredApplications = useMemo(() => {
    const validDriveIds = new Set(filteredDrives.map((d) => d.id));

    return applications.filter((app) => {
      // If a specific drive is selected in the UI
      if (selectedDriveId !== 'all' && app.drive_id !== selectedDriveId) {
        return false;
      }
      // If general filters are active, ensure application belongs to a filtered drive
      if (selectedBatch !== 'all' || selectedStatus !== 'all') {
        if (!validDriveIds.has(app.drive_id)) {
          return false;
        }
      }
      // Branch filter on applicant's own department
      if (selectedBranch !== 'all' && app.student_department !== selectedBranch) {
        return false;
      }
      return true;
    });
  }, [applications, filteredDrives, selectedDriveId, selectedBatch, selectedBranch, selectedStatus]);

  // Reactive department statistics
  const filteredDeptStats = useMemo(() => {
    if (!stats?.department_stats) return [];
    if (selectedBranch === 'all') return stats.department_stats;
    return stats.department_stats.filter((ds) => ds.department_code === selectedBranch);
  }, [stats, selectedBranch]);

  // Recomputed metric card values reflecting active filters
  const computedMetrics = useMemo(() => {
    const activeDrivesCount = filteredDrives.filter(
      (d) => d.recruitment_status !== 'cancelled' && d.recruitment_status !== 'completed'
    ).length;

    const offersCount = filteredApplications.filter((a) => a.stage === 'selected').length;

    const ctcValues = filteredDrives
      .map((d) => Number(d.ctc_lpa))
      .filter((c) => !isNaN(c) && c > 0);

    const highestCtc = ctcValues.length > 0 ? Math.max(...ctcValues) : 0;
    const avgCtc = ctcValues.length > 0 ? ctcValues.reduce((a, b) => a + b, 0) / ctcValues.length : 0;

    const eligibleSum = filteredDeptStats.reduce((sum, d) => sum + d.eligible_students, 0);
    const placedSum = filteredDeptStats.reduce((sum, d) => sum + d.placed_students, 0);
    const placementRate = eligibleSum > 0 ? ((placedSum / eligibleSum) * 100).toFixed(1) : '0.0';

    return {
      activeDrivesCount: filteredDrives.length,
      offersCount: offersCount || (stats?.total_offers ?? 0),
      highestCtc: Number(highestCtc.toFixed(1)) || (stats?.highest_package_lpa ?? 0),
      averageCtc: Number(avgCtc.toFixed(1)) || (stats?.average_package_lpa ?? 0),
      placementRate: stats?.placement_percentage ?? placementRate,
    };
  }, [filteredDrives, filteredApplications, filteredDeptStats, stats]);

  const activeSelectedDrive = useMemo(() => {
    if (selectedDriveId === 'all') return null;
    return drives.find((d) => d.id === selectedDriveId) || null;
  }, [drives, selectedDriveId]);

  const handleSelectDrive = (driveId: string) => {
    if (selectedDriveId === driveId) {
      setSelectedDriveId('all');
    } else {
      setSelectedDriveId(driveId);
      setTimeout(() => {
        document.getElementById('student-offers')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  const hasActiveFilters =
    selectedBatch !== 'all' || selectedBranch !== 'all' || selectedStatus !== 'all' || selectedDriveId !== 'all';

  const resetFilters = () => {
    setSelectedBatch('all');
    setSelectedBranch('all');
    setSelectedStatus('all');
    setSelectedDriveId('all');
  };

  // Enhancement 4: CSV Export with RFC 4180 Escaping and Security Safeguards
  const handleExportCsv = () => {
    const escapeCsvCell = (val: any): string => {
      if (val === null || val === undefined) return '';
      const str = String(val).trim();
      if (
        str.includes(',') ||
        str.includes('"') ||
        str.includes('\n') ||
        str.includes('\r')
      ) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    let headers: string[];
    let dataRows: string[][];
    let filePrefix: string;

    if (filteredApplications.length > 0) {
      // Columns: Authorized Institutional Placement Applications
      headers = [
        'Student Full Name',
        'USN',
        'Department / Branch',
        'Contineo CGPA',
        'Exam Cell Verified',
        'Recruitment Drive Company',
        'Role Title',
        'Package CTC (LPA)',
        'Application Stage',
        'Submission Timestamp',
      ];

      dataRows = filteredApplications.map((app) => [
        escapeCsvCell(app.student_name || 'Student'),
        escapeCsvCell(app.student_usn || ''),
        escapeCsvCell(app.student_department || ''),
        escapeCsvCell(typeof app.cgpa === 'number' ? app.cgpa.toFixed(2) : app.cgpa || ''),
        escapeCsvCell(app.is_contineo_verified ? 'Yes' : 'No'),
        escapeCsvCell(app.company_name || ''),
        escapeCsvCell(app.role_title || ''),
        escapeCsvCell(app.ctc_lpa || ''),
        escapeCsvCell(app.stage || 'applied'),
        escapeCsvCell(app.applied_at ? new Date(app.applied_at).toLocaleString() : ''),
      ]);
      filePrefix = 'Applications';
    } else if (filteredDrives.length > 0) {
      // Columns: Filtered Campus Recruitment Drives Summary
      headers = [
        'Company Name',
        'Role Title',
        'Package CTC (LPA)',
        'Min CGPA Cutoff',
        'Max Backlogs Allowed',
        'Eligible Branches',
        'Batch Year',
        'Eligible Students Count',
        'Recruitment Status',
      ];

      dataRows = filteredDrives.map((d) => [
        escapeCsvCell(d.company_name || ''),
        escapeCsvCell(d.role_title || ''),
        escapeCsvCell(d.ctc_lpa || ''),
        escapeCsvCell(typeof d.min_cgpa === 'number' ? d.min_cgpa.toFixed(2) : d.min_cgpa || ''),
        escapeCsvCell(d.max_active_backlogs ?? 0),
        escapeCsvCell(Array.isArray(d.eligible_branches) ? d.eligible_branches.join('; ') : ''),
        escapeCsvCell(d.batch_year || ''),
        escapeCsvCell(d.eligible_students_count ?? 0),
        escapeCsvCell(d.recruitment_status || 'published'),
      ]);
      filePrefix = 'Drives_Summary';
    } else {
      return;
    }

    const csvContent = [headers.join(','), ...dataRows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const batchLabel = selectedBatch !== 'all' ? selectedBatch : 'AllBatches';
    const branchLabel = selectedBranch !== 'all' ? selectedBranch : 'AllBranches';
    link.setAttribute(
      'download',
      `NMAMIT_Placement_${filePrefix}_${batchLabel}_${branchLabel}_${Date.now()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Ensure browser download lifecycle completes before revoking blob URL
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Placement Hero Banner */}
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
              onClick={() => setIsAnnouncementModalOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Publish Placement Announcement</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddRecruiterModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02]"
                title="Add recruiter with corporate email, password, and company profile"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Recruiter</span>
              </button>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold border border-white/20 transition-all backdrop-blur-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post Drive</span>
              </button>

              <Link
                href="/student/placement-hub"
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all backdrop-blur-md"
                title="View Student Transparency Hub as viewed by all academic batches"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Hub View</span>
              </Link>

              <button
                onClick={fetchPlacementData}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all backdrop-blur-md"
                title="Refresh placement data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhancement 2: Placement Control Toolbar (Filters & CSV Export) */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-semibold pr-1">
            <Filter className="w-4 h-4 text-indigo-500" />
            <span>Filters:</span>
          </div>

          {/* Batch Year Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-slate-600 dark:text-slate-400 text-[11px] font-medium">Batch:</label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Batches</option>
              {availableBatches.map((batch) => (
                <option key={batch} value={batch}>
                  Batch {batch}
                </option>
              ))}
            </select>
          </div>

          {/* Branch / Department Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-slate-600 dark:text-slate-400 text-[11px] font-medium">Branch:</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Branches</option>
              {availableBranches.map((br) => (
                <option key={br} value={br}>
                  {br}
                </option>
              ))}
            </select>
          </div>

          {/* Drive Status Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-slate-600 dark:text-slate-400 text-[11px] font-medium">Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Enhancement 4: CSV Export Button */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <button
            onClick={handleExportCsv}
            disabled={filteredApplications.length === 0 && filteredDrives.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
            title="Download CSV containing authorized placement records"
          >
            <Download className="w-4 h-4" />
            <span>
              Export Filtered CSV (
              {filteredApplications.length > 0
                ? `${filteredApplications.length} Apps`
                : `${filteredDrives.length} Drives`}
              )
            </span>
          </button>
        </div>
      </div>

      {/* 2. Side-by-Side Metric Cards (Reactively updated from computedMetrics) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-400 dark:hover:border-slate-700">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
            ACTIVE DRIVES
          </span>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
            {computedMetrics.activeDrivesCount} <span className="text-xs font-normal text-slate-400">Drives</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block truncate">
            {filteredDrives.length > 0
              ? filteredDrives.map((d) => d.company_name).slice(0, 3).join(', ')
              : 'No matching drives'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-400 dark:hover:border-slate-700">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
            OFFERS GENERATED
          </span>
          <div className="text-2xl md:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {computedMetrics.offersCount} <span className="text-xs font-normal text-slate-400">Offers</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
            Placement Rate: {computedMetrics.placementRate}%
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-400 dark:hover:border-slate-700">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
            HIGHEST PACKAGE
          </span>
          <div className="text-2xl md:text-3xl font-extrabold text-purple-600 dark:text-purple-400">
            {computedMetrics.highestCtc} <span className="text-xs font-normal text-slate-400">LPA</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
            Avg CTC: {computedMetrics.averageCtc} LPA
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

      {/* Enhancement 1: Placement Analytics (Department Progress, CTC Distribution, Application Funnel) */}
      <PlacementCharts
        departmentStats={filteredDeptStats}
        drives={filteredDrives}
        applications={filteredApplications}
      />

      {/* View Switcher: Placement Drives vs Corporate Partner Recruiters */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80">
          <button
            onClick={() => setPlacementTab('drives')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              placementTab === 'drives'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Placement Drives & Applications ({filteredDrives.length})</span>
          </button>

          <button
            onClick={() => setPlacementTab('recruiters')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              placementTab === 'recruiters'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Corporate Partner Recruiters ({recruiters.length})</span>
          </button>
        </div>

        {placementTab === 'recruiters' && (
          <button
            onClick={() => setIsAddRecruiterModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all hover:scale-[1.02]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Onboard New Recruiter</span>
          </button>
        )}
      </div>

      {/* Recruiter Management View */}
      {placementTab === 'recruiters' && (
        <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>Onboarded Corporate Recruiters & Talent Partners</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Talent acquisition leads with verified recruiter access to evaluate student skill passports.
              </p>
            </div>

            <div className="w-full sm:w-72">
              <input
                type="search"
                placeholder="Search by recruiter, company, or domain..."
                value={recruiterSearch}
                onChange={(e) => setRecruiterSearch(e.target.value)}
                className="w-full px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Recruiters Cards Grid */}
          {recruiters.filter((r) => {
            const q = recruiterSearch.toLowerCase();
            return (
              !q ||
              r.full_name.toLowerCase().includes(q) ||
              r.email.toLowerCase().includes(q) ||
              r.company_name.toLowerCase().includes(q) ||
              (r.industry && r.industry.toLowerCase().includes(q))
            );
          }).length === 0 ? (
            <div className="py-14 text-center text-xs text-slate-400 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
              <Users className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No recruiters match your search.</p>
              <button
                onClick={() => setIsAddRecruiterModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm"
              >
                Add Recruiter Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recruiters
                .filter((r) => {
                  const q = recruiterSearch.toLowerCase();
                  return (
                    !q ||
                    r.full_name.toLowerCase().includes(q) ||
                    r.email.toLowerCase().includes(q) ||
                    r.company_name.toLowerCase().includes(q) ||
                    (r.industry && r.industry.toLowerCase().includes(q))
                  );
                })
                .map((rec) => (
                  <div
                    key={rec.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 hover:border-purple-300 dark:hover:border-purple-800 transition-all space-y-3.5 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={rec.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(rec.full_name)}`}
                            alt={rec.full_name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-white"
                          />
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                              {rec.full_name}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {rec.designation || 'Talent Acquisition Partner'}
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                          {rec.tier || 'Tier 1'}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                          <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="truncate">{rec.company_name}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-[11px]">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate font-mono">{rec.email}</span>
                        </div>

                        {rec.phone && (
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-[11px]">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{rec.phone}</span>
                          </div>
                        )}

                        {rec.headquarters && (
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-[11px]">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{rec.headquarters}</span>
                          </div>
                        )}

                        {rec.industry && (
                          <div className="text-[10px] text-slate-400 italic pt-0.5">
                            Domain: {rec.industry}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Active Recruiter
                      </span>

                      <div className="flex items-center gap-2">
                        {rec.website && (
                          <a
                            href={rec.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                            title="Visit Corporate Website"
                          >
                            <Globe className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          onClick={() => {
                            setNewCompany(rec.company_name);
                            setIsCreateModalOpen(true);
                          }}
                          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Host Drive →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Active Campus Recruitment Drives Grid */}
      <div id="drives-list" className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Campus Drives & Cutoff Rules ({filteredDrives.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Real-time Contineo CGPA & Backlog Cutoff Math
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDrives.length === 0 ? (
            <div className="col-span-full py-10 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              No placement drives found matching the selected filters.
            </div>
          ) : (
            filteredDrives.map((d) => (
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
                <div className="flex justify-between">
                  <span>Batch Year:</span>
                  <strong className="text-slate-900 dark:text-white font-mono">{d.batch_year || 2026}</strong>
                </div>
              </div>

              {/* Dynamically calculated live counts + Enhancement 3: Check Eligibility Button */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/80 dark:border-slate-800/80 gap-1.5 flex-wrap">
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {d.eligible_students_count} Eligible
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Enhancement 3: Trigger for EligibleStudentModal */}
                  <button
                    onClick={() => setAuditDrive(d)}
                    className="text-[11px] px-2.5 py-1 rounded-lg font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-1"
                    title="Audit student cohort against this drive's mandatory criteria"
                  >
                    <ShieldCheck className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                    <span>Audit Eligibility</span>
                  </button>

                  <button
                    onClick={() => handleSelectDrive(d.id)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all ${
                      selectedDriveId === d.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {selectedDriveId === d.id ? 'Viewing Roster' : 'View Applicants'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
        </div>
      </div>

      {/* 4. Department Placement Readiness Matrix */}
      {filteredDeptStats.length > 0 && (
        <div id="department-stats" className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Department Placement Distribution & Batch Readiness
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredDeptStats.map((dept) => (
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
              Candidate Drive Roster & Status Management ({filteredApplications.length})
            </h3>
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            {selectedDriveId !== 'all' ? `Filtered by Selected Drive` : 'All Campus Drive Applicants'}
          </span>
        </div>

        {/* Active Selected Drive Banner */}
        {activeSelectedDrive && (
          <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-600 text-white">
                Active Drive
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {activeSelectedDrive.company_name} — {activeSelectedDrive.role_title}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                ({activeSelectedDrive.ctc_lpa} LPA • Min CGPA {activeSelectedDrive.min_cgpa.toFixed(2)})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAuditDrive(activeSelectedDrive)}
                className="text-xs px-3 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Audit Eligibility</span>
              </button>
              <button
                onClick={() => setSelectedDriveId('all')}
                className="text-xs px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Filter</span>
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {filteredApplications.length === 0 ? (
            activeSelectedDrive ? (
              <div className="py-12 px-4 text-center bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                <div className="max-w-md mx-auto space-y-1">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    No candidate applications recorded yet for {activeSelectedDrive.company_name} ({activeSelectedDrive.role_title})
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Students have not submitted profiles for this drive yet.
                    {typeof activeSelectedDrive.eligible_students_count === 'number' && (
                      <> {activeSelectedDrive.eligible_students_count} students in the cohort meet the Contineo ERP criteria.</>
                    )}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    onClick={() => setAuditDrive(activeSelectedDrive)}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Audit Eligible Students for This Drive</span>
                  </button>
                  <button
                    onClick={() => setSelectedDriveId('all')}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
                  >
                    Show All Applicants
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                No candidate applications found matching the selected filters.
              </div>
            )
          ) : (
            filteredApplications.map((app) => (
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
                    {app.student_department} • CGPA {typeof app.cgpa === 'number' ? app.cgpa.toFixed(2) : app.cgpa}
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

      {/* Enhancement 3: Eligible Student Viewer Modal */}
      <EligibleStudentModal
        isOpen={Boolean(auditDrive)}
        onClose={() => setAuditDrive(null)}
        drive={auditDrive}
      />

      {/* Placement Transparency Hub: Announcement Creator Modal */}
      <AnnouncementFormModal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        onSaved={fetchPlacementData}
      />

      {/* Placements Dept: Onboard Corporate Recruiter Modal */}
      <AddRecruiterModal
        isOpen={isAddRecruiterModalOpen}
        onClose={() => setIsAddRecruiterModalOpen(false)}
        onRecruiterAdded={(newRec) => {
          setRecruiters((prev) => [newRec, ...prev]);
          fetchPlacementData();
        }}
      />
    </div>
  );
}
