'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Search,
  RefreshCw,
  Building2,
  MapPin,
  Calendar,
  Award,
  ArrowRight,
  Filter,
  CheckCircle2,
  Users,
  Layers,
  ChevronRight,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { PlacementDrive } from '@/types';

export default function RecruiterDrivesPage() {
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [minCtcFilter, setMinCtcFilter] = useState<number>(0);

  const fetchDrives = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/recruiter/jobs');
      const data = await res.json();
      if (res.ok && data.drives) {
        setDrives(data.drives);
      } else {
        setError(data.error || 'Failed to load placement drives.');
      }
    } catch (e: any) {
      console.error('Error fetching drives:', e);
      setError(e.message || 'Failed to fetch drives from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  // Filter drives
  const filteredDrives = drives.filter((drive) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      (drive.company_name || '').toLowerCase().includes(q) ||
      drive.role_title.toLowerCase().includes(q) ||
      (drive.job_description && drive.job_description.toLowerCase().includes(q));

    const matchBranch =
      selectedBranch === 'all' ||
      drive.eligible_branches.some((b) => b.toLowerCase() === selectedBranch.toLowerCase());

    const matchCtc = minCtcFilter === 0 || drive.ctc_lpa >= minCtcFilter;

    return matchSearch && matchBranch && matchCtc;
  });

  // Unique branches across drives
  const allBranches = Array.from(
    new Set(drives.flatMap((d) => d.eligible_branches || []))
  ).sort();

  // Metrics
  const maxCtc = drives.length > 0 ? Math.max(...drives.map((d) => d.ctc_lpa)) : 0;
  const avgMinCgpa =
    drives.length > 0
      ? (drives.reduce((acc, d) => acc + d.min_cgpa, 0) / drives.length).toFixed(2)
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
            <span className="text-slate-800 dark:text-slate-200 font-semibold">Placement Drives</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span>Campus Placement Drives</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Explore corporate campus openings, CTC packages, academic eligibility, and branch filters.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchDrives}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/recruiter/candidates"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Ranked Candidates</span>
          </Link>

          <Link
            href="/recruiter/cutoff"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Cutoff Filter</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Drives</span>
            <Briefcase className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {drives.length}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Campus recruitment cycles</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Top CTC Package</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {maxCtc} <span className="text-xs font-bold">LPA</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Highest offered CTC</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Avg Min CGPA</span>
            <Award className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {avgMinCgpa}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Academic cutoff threshold</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Target Batch</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {drives[0]?.batch_year || 2026}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Graduating cohort</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company or role..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-purple-500"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-purple-500"
            >
              <option value="all">All Departments / Branches</option>
              {allBranches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Min CTC Filter */}
          <div>
            <select
              value={minCtcFilter}
              onChange={(e) => setMinCtcFilter(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-purple-500"
            >
              <option value={0}>All CTC Packages</option>
              <option value={10}>10+ LPA</option>
              <option value={15}>15+ LPA</option>
              <option value={20}>20+ LPA</option>
              <option value={25}>25+ LPA</option>
            </select>
          </div>
        </div>

        {(searchQuery || selectedBranch !== 'all' || minCtcFilter > 0) && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>
              Showing {filteredDrives.length} of {drives.length} drives
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedBranch('all');
                setMinCtcFilter(0);
              }}
              className="text-purple-600 dark:text-purple-400 font-semibold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchDrives}
            className="px-3 py-1 rounded-lg bg-rose-600 text-white font-semibold text-xs hover:bg-rose-500 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading placement drives...</p>
        </div>
      ) : filteredDrives.length === 0 ? (
        <div className="py-16 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <Briefcase className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Placement Drives Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
            No active placement drives match your filter criteria or no drives are currently configured in the database.
          </p>
        </div>
      ) : (
        /* Drive Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDrives.map((drive) => (
            <div
              key={drive.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 shadow-sm hover:border-purple-400 dark:hover:border-purple-500/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header: Company & CTC */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                        {drive.company_name}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                      {drive.role_title}
                    </h3>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-block px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-extrabold text-sm font-mono">
                      {drive.ctc_lpa} LPA
                    </span>
                    <span className="block text-[10px] text-slate-400 font-medium mt-0.5">Full-Time</span>
                  </div>
                </div>

                {/* Job Description excerpt */}
                {drive.job_description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {drive.job_description}
                  </p>
                )}

                {/* Criteria Grid */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Minimum CGPA:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {drive.min_cgpa.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Max Backlogs:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {drive.max_active_backlogs === 0 ? '0 (Clean Record)' : drive.max_active_backlogs}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Batch Year:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {drive.batch_year}
                    </span>
                  </div>

                  <div className="pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                    <span className="text-slate-500 dark:text-slate-400 block mb-1">Eligible Branches:</span>
                    <div className="flex flex-wrap gap-1">
                      {drive.eligible_branches.map((b) => (
                        <span
                          key={b}
                          className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-300"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Required Skills Tags */}
                {drive.required_skills && drive.required_skills.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
                      Required Skills
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {drive.required_skills.map((s: any, idx: number) => {
                        const name = typeof s === 'string' ? s : s?.name;
                        return (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40 text-[11px] font-semibold"
                          >
                            {name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Link
                  href={`/recruiter/candidates?driveId=${drive.id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-all text-center"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Rank Candidates</span>
                </Link>

                <Link
                  href={`/recruiter/cutoff?driveId=${drive.id}`}
                  className="flex items-center justify-center px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
                  title="Simulate Cutoff"
                >
                  <Layers className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
