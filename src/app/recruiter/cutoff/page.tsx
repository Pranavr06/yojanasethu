'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Layers,
  Briefcase,
  Users,
  ChevronRight,
  Filter,
  Sliders,
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  RefreshCw,
  Search,
  Building2,
  ShieldCheck,
  FileText,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { PlacementDrive, CandidateEvaluation } from '@/types';

function CutoffContent() {
  const searchParams = useSearchParams();
  const initialDriveId = searchParams.get('driveId');

  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState<string>(initialDriveId || '');
  const [candidates, setCandidates] = useState<CandidateEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interactive Cutoff Filter Controls
  const [cgpaCutoff, setCgpaCutoff] = useState<number>(7.5);
  const [maxBacklogs, setMaxBacklogs] = useState<number>(0);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [requireResume, setRequireResume] = useState(false);
  const [minVerifiedSkills, setMinVerifiedSkills] = useState<number>(0);
  const [previewSearch, setPreviewSearch] = useState('');

  // 1. Fetch Drives
  useEffect(() => {
    async function loadDrives() {
      try {
        const res = await fetch('/api/recruiter/jobs');
        const data = await res.json();
        if (data.drives && data.drives.length > 0) {
          setDrives(data.drives);
          const targetDriveId = initialDriveId || data.drives[0].id;
          setSelectedDriveId(targetDriveId);
          const drive = data.drives.find((d: any) => d.id === targetDriveId) || data.drives[0];
          setCgpaCutoff(drive.min_cgpa || 7.5);
          setMaxBacklogs(drive.max_active_backlogs ?? 0);
          setSelectedBranches(drive.eligible_branches || []);
        } else {
          setLoading(false);
        }
      } catch (e: any) {
        console.error('Failed to load drives:', e);
        setError('Failed to load recruitment drives.');
        setLoading(false);
      }
    }
    loadDrives();
  }, [initialDriveId]);

  // 2. Fetch all candidates for the selected drive
  const fetchCandidates = async (driveId: string) => {
    if (!driveId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/recruiter/candidates?driveId=${driveId}`);
      const data = await res.json();
      if (res.ok && data.eligible_candidates) {
        // Combine both to run arbitrary cutoffs across entire student pool
        const combined = [...(data.eligible_candidates || []), ...(data.ineligible_candidates || [])];
        setCandidates(combined);
      } else {
        setError(data.error || 'Failed to load candidates.');
      }
    } catch (e: any) {
      console.error('Candidate fetch error:', e);
      setError(e.message || 'Error fetching student records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDriveId) {
      fetchCandidates(selectedDriveId);
    }
  }, [selectedDriveId]);

  const currentDrive = drives.find((d) => d.id === selectedDriveId) || drives[0];

  // When user switches drive from dropdown, update baseline thresholds
  const handleDriveChange = (driveId: string) => {
    setSelectedDriveId(driveId);
    const drive = drives.find((d) => d.id === driveId);
    if (drive) {
      setCgpaCutoff(drive.min_cgpa || 7.5);
      setMaxBacklogs(drive.max_active_backlogs ?? 0);
      setSelectedBranches(drive.eligible_branches || []);
    }
  };

  // All available branches in cohort
  const allBranches = useMemo(() => {
    const set = new Set<string>();
    candidates.forEach((c) => {
      const code = c.student.profile.department_code;
      if (code) set.add(code);
    });
    return Array.from(set).sort();
  }, [candidates]);

  // Handle branch checkbox toggle
  const toggleBranch = (branch: string) => {
    setSelectedBranches((prev) =>
      prev.includes(branch) ? prev.filter((b) => b !== branch) : [...prev, branch]
    );
  };

  const handleSelectAllBranches = () => {
    setSelectedBranches(allBranches);
  };

  const handleClearBranches = () => {
    setSelectedBranches([]);
  };

  // Evaluate candidate against interactive cutoffs
  const evaluatedResults = useMemo(() => {
    const qualified: CandidateEvaluation[] = [];
    const disqualified: { candidate: CandidateEvaluation; reason: string }[] = [];

    candidates.forEach((c) => {
      const cgpa = c.student.academic_record?.cgpa || 0;
      const backlogs = c.student.academic_record?.active_backlogs || 0;
      const branch = c.student.profile.department_code || '';
      const verifiedSkillsCount = (c.student.skills || []).filter(
        (s) => s.verification_badge || s.tier === 'faculty_verified' || s.tier === 'expert'
      ).length;
      const hasResume = Boolean(c.student.profile.resume_storage_path);

      if (cgpa < cgpaCutoff) {
        disqualified.push({
          candidate: c,
          reason: `CGPA ${cgpa.toFixed(2)} below cutoff ${cgpaCutoff.toFixed(2)}`,
        });
        return;
      }

      if (maxBacklogs !== -1 && backlogs > maxBacklogs) {
        disqualified.push({
          candidate: c,
          reason: `Active backlogs (${backlogs}) exceeds threshold (${maxBacklogs})`,
        });
        return;
      }

      if (selectedBranches.length > 0 && !selectedBranches.includes(branch)) {
        disqualified.push({
          candidate: c,
          reason: `Department ${branch} not in selected branches`,
        });
        return;
      }

      if (requireResume && !hasResume) {
        disqualified.push({
          candidate: c,
          reason: `Resume PDF not uploaded`,
        });
        return;
      }

      if (minVerifiedSkills > 0 && verifiedSkillsCount < minVerifiedSkills) {
        disqualified.push({
          candidate: c,
          reason: `Verified skills (${verifiedSkillsCount}) below requirement (${minVerifiedSkills})`,
        });
        return;
      }

      qualified.push(c);
    });

    return { qualified, disqualified };
  }, [candidates, cgpaCutoff, maxBacklogs, selectedBranches, requireResume, minVerifiedSkills]);

  // Branch breakdown of qualified candidates
  const branchBreakdown = useMemo(() => {
    const counts: Record<string, { total: number; qualified: number }> = {};
    allBranches.forEach((b) => {
      counts[b] = { total: 0, qualified: 0 };
    });

    candidates.forEach((c) => {
      const b = c.student.profile.department_code || 'Other';
      if (!counts[b]) counts[b] = { total: 0, qualified: 0 };
      counts[b].total += 1;
    });

    evaluatedResults.qualified.forEach((c) => {
      const b = c.student.profile.department_code || 'Other';
      if (counts[b]) counts[b].qualified += 1;
    });

    return counts;
  }, [allBranches, candidates, evaluatedResults.qualified]);

  // Filter preview qualified candidates by name/USN
  const previewCandidates = useMemo(() => {
    if (!previewSearch.trim()) return evaluatedResults.qualified;
    const q = previewSearch.toLowerCase().trim();
    return evaluatedResults.qualified.filter(
      (c) =>
        (c.student.profile.full_name || '').toLowerCase().includes(q) ||
        (c.student.profile.usn || '').toLowerCase().includes(q) ||
        (c.student.profile.department_code || '').toLowerCase().includes(q)
    );
  }, [evaluatedResults.qualified, previewSearch]);

  const totalCohort = candidates.length;
  const qualifiedCount = evaluatedResults.qualified.length;
  const disqualifiedCount = evaluatedResults.disqualified.length;
  const qualificationRate = totalCohort > 0 ? ((qualifiedCount / totalCohort) * 100).toFixed(1) : '0';

  const avgQualifiedCgpa =
    qualifiedCount > 0
      ? (
          evaluatedResults.qualified.reduce(
            (acc, c) => acc + (c.student.academic_record?.cgpa || 0),
            0
          ) / qualifiedCount
        ).toFixed(2)
      : '0.00';

  return (
    <div className="space-y-6">
      {/* Breadcrumb Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Link href="/recruiter" className="hover:text-purple-600 dark:hover:text-purple-400 font-medium">
              Recruiter Desk
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800 dark:text-slate-200 font-semibold">Contineo Cutoff Filter</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span>Contineo Cutoff & Eligibility Simulator</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Simulate academic cutoffs, adjust CGPA thresholds, backlogs limits, and analyze real-time cohort qualification.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/recruiter/drives"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Placement Drives</span>
          </Link>

          <Link
            href={`/recruiter/candidates?driveId=${selectedDriveId}&minCgpa=${cgpaCutoff}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Apply to Candidate Desk</span>
          </Link>
        </div>
      </div>

      {/* Drive Selector */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
            Base Drive Preset:
          </label>
          <select
            value={selectedDriveId}
            onChange={(e) => handleDriveChange(e.target.value)}
            disabled={drives.length === 0}
            className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 w-full max-w-md"
          >
            {drives.length === 0 ? (
              <option value="">No Placement Drives Available</option>
            ) : (
              drives.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.company_name} — {d.role_title} ({d.ctc_lpa} LPA)
                </option>
              ))
            )}
          </select>
        </div>

        {currentDrive && (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Original Criteria: Min CGPA {currentDrive.min_cgpa.toFixed(2)} • Max Backlogs {currentDrive.max_active_backlogs}
          </div>
        )}
      </div>

      {/* Analytics KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Cohort</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalCohort}
          </div>
          <span className="text-[11px] text-slate-500">Students in institution</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Qualified</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {qualifiedCount} <span className="text-xs font-bold font-mono">({qualificationRate}%)</span>
          </div>
          <span className="text-[11px] text-slate-500">Meets cutoff rules</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Disqualified</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {disqualifiedCount}
          </div>
          <span className="text-[11px] text-slate-500">Fails one or more rules</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Avg CGPA</span>
            <Award className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
            {avgQualifiedCgpa}
          </div>
          <span className="text-[11px] text-slate-500">Of qualified student pool</span>
        </div>
      </div>

      {/* Main Grid: Controls vs Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Simulation Sliders & Controls */}
        <div className="lg:col-span-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Simulation Sliders</span>
            </h3>

            <button
              onClick={() => {
                setCgpaCutoff(currentDrive?.min_cgpa || 7.5);
                setMaxBacklogs(currentDrive?.max_active_backlogs ?? 0);
                setSelectedBranches(currentDrive?.eligible_branches || allBranches);
                setRequireResume(false);
                setMinVerifiedSkills(0);
              }}
              className="text-xs text-purple-600 dark:text-purple-400 font-semibold hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* 1. CGPA Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Minimum CGPA Cutoff:
              </label>
              <span className="px-2.5 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-mono font-extrabold text-sm">
                {cgpaCutoff.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="5.0"
              max="9.5"
              step="0.05"
              value={cgpaCutoff}
              onChange={(e) => setCgpaCutoff(parseFloat(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>5.0</span>
              <span>6.5</span>
              <span>7.5</span>
              <span>8.5</span>
              <span>9.5</span>
            </div>
          </div>

          {/* 2. Active Backlogs Limit */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Max Active Backlogs Allowed:
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: '0 (Strict)', val: 0 },
                { label: '≤ 1', val: 1 },
                { label: '≤ 2', val: 2 },
                { label: 'Any', val: -1 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setMaxBacklogs(opt.val)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                    maxBacklogs === opt.val
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Department / Branch Checkboxes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Eligible Departments:
              </label>
              <div className="flex items-center gap-2 text-[10px]">
                <button
                  onClick={handleSelectAllBranches}
                  className="text-purple-600 dark:text-purple-400 font-bold hover:underline"
                >
                  All
                </button>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <button
                  onClick={handleClearBranches}
                  className="text-slate-500 hover:underline"
                >
                  None
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {allBranches.map((branch) => {
                const checked = selectedBranches.includes(branch);
                return (
                  <label
                    key={branch}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      checked
                        ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-200'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleBranch(branch)}
                      className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5"
                    />
                    <span>{branch}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 4. Additional Quality Filters */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* Require Resume */}
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={requireResume}
                onChange={(e) => setRequireResume(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5"
              />
              <FileText className="w-3.5 h-3.5 text-purple-500" />
              <span>Require Uploaded Resume PDF</span>
            </label>

            {/* Min Verified Skills */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Min Verified Skills Required:
              </label>
              <select
                value={minVerifiedSkills}
                onChange={(e) => setMinVerifiedSkills(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-purple-500"
              >
                <option value={0}>0 (No Skill Gate)</option>
                <option value={1}>1+ Verified Skill</option>
                <option value={2}>2+ Verified Skills</option>
                <option value={3}>3+ Verified Skills</option>
                <option value={5}>5+ Verified Skills</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Branch Qualification Breakdown & Visual Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Department Breakdown Card */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Department Qualification Distribution</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  How candidate eligibility distributes across campus branches under current simulation.
                </p>
              </div>

              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 font-mono">
                {qualifiedCount} / {totalCohort} Total
              </span>
            </div>

            <div className="space-y-3">
              {Object.entries(branchBreakdown).map(([branch, stat]) => {
                const pct = stat.total > 0 ? (stat.qualified / stat.total) * 100 : 0;
                return (
                  <div key={branch} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {branch}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          ({stat.qualified} of {stat.total} eligible)
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {pct.toFixed(0)}%
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          pct >= 75
                            ? 'bg-emerald-500'
                            : pct >= 40
                            ? 'bg-purple-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Qualified Candidates Roster Preview */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Qualified Candidates Preview ({previewCandidates.length})</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Students meeting CGPA ≥ {cgpaCutoff.toFixed(2)} and all active criteria.
                </p>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={previewSearch}
                  onChange={(e) => setPreviewSearch(e.target.value)}
                  placeholder="Filter name or USN..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {previewCandidates.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No students qualify under current simulation rules. Try lowering the CGPA slider.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                      <th className="pb-2">Student</th>
                      <th className="pb-2">Dept</th>
                      <th className="pb-2">CGPA</th>
                      <th className="pb-2">Backlogs</th>
                      <th className="pb-2">Skills</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {previewCandidates.slice(0, 10).map((c) => {
                      const cgpa = c.student.academic_record?.cgpa || 0;
                      const verifiedSkills = (c.student.skills || []).filter(
                        (s) => s.verification_badge || s.tier === 'faculty_verified' || s.tier === 'expert'
                      ).length;

                      return (
                        <tr key={c.student.profile.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-2.5">
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {c.student.profile.full_name}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              {c.student.profile.usn}
                            </span>
                          </td>
                          <td className="py-2.5 text-slate-600 dark:text-slate-300">
                            {c.student.profile.department_code || 'N/A'}
                          </td>
                          <td className="py-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {cgpa.toFixed(2)}
                          </td>
                          <td className="py-2.5 font-mono text-slate-600 dark:text-slate-300">
                            {c.student.academic_record?.active_backlogs || 0}
                          </td>
                          <td className="py-2.5">
                            <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold text-[11px]">
                              {verifiedSkills} verified
                            </span>
                          </td>
                          <td className="py-2.5 text-right">
                            <Link
                              href={`/recruiter/candidates?driveId=${selectedDriveId}&branch=${c.student.profile.department_code || ''}&minCgpa=${cgpaCutoff}`}
                              className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                            >
                              <span>Inspect</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {previewCandidates.length > 10 && (
                  <div className="pt-3 text-center border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                    Showing top 10 of {previewCandidates.length} qualified candidates.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecruiterCutoffPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading cutoff simulation desk...</p>
        </div>
      }
    >
      <CutoffContent />
    </Suspense>
  );
}
