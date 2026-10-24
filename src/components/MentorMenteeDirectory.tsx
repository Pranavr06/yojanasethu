'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Github,
  BookOpen,
  ArrowUpDown,
  TrendingUp,
} from 'lucide-react';

interface Mentee {
  id: string;
  full_name: string;
  email: string;
  usn: string;
  semester: number;
  department_code: string;
  department_name: string;
  cgpa: number;
  active_backlogs: number;
  total_earned_credits: number;
  is_verified_by_exam_cell: boolean;
  verified_skills_count: number;
  total_skills_count: number;
  is_placement_ready: boolean;
  github_username?: string;
  resume_storage_path?: string | null;
  resume_file_name?: string | null;
  resume_uploaded_at?: string | null;
  has_resume?: boolean;
}

interface Props {
  mentees: Mentee[];
  departments: { code: string; name: string }[];
  selectedDept: string;
  onSelectDept: (dept: string) => void;
}

export default function MentorMenteeDirectory({
  mentees,
  departments,
  selectedDept,
  onSelectDept,
}: Props) {
  const [search, setSearch] = useState('');
  const [readinessFilter, setReadinessFilter] = useState<'all' | 'ready' | 'attention'>('all');
  const [sortBy, setSortBy] = useState<'usn' | 'cgpa' | 'skills'>('usn');
  const [sortAsc, setSortAsc] = useState(true);

  // Filter mentees
  const filtered = (mentees || []).filter((m) => {
    if (!m) return false;

    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchName = (m.full_name || '').toLowerCase().includes(q);
      const matchUsn = (m.usn || '').toLowerCase().includes(q);
      const matchDept = (m.department_code || '').toLowerCase().includes(q);
      if (!matchName && !matchUsn && !matchDept) return false;
    }

    // Readiness filter
    if (readinessFilter === 'ready' && !m.is_placement_ready) return false;
    if (readinessFilter === 'attention' && m.is_placement_ready) return false;

    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'usn') {
      const usnA = (a.usn || '').trim();
      const usnB = (b.usn || '').trim();
      cmp = usnA.localeCompare(usnB);
    } else if (sortBy === 'cgpa') {
      cmp = (Number(a.cgpa) || 0) - (Number(b.cgpa) || 0);
    } else if (sortBy === 'skills') {
      cmp = (Number(a.verified_skills_count) || 0) - (Number(b.verified_skills_count) || 0);
    }
    return sortAsc ? cmp : -cmp;
  });

  const toggleSort = (col: 'usn' | 'cgpa' | 'skills') => {
    if (sortBy === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(col);
      setSortAsc(col === 'usn');
    }
  };

  return (
    <div className="glass-panel p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
                Mentee Student Academic & Verification Roster
              </h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30">
                {sorted.length} Students
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Deterministic Contineo ERP standings, active backlogs, and verified skill passport count
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Branch Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Branch:</span>
            <select
              value={selectedDept}
              onChange={(e) => onSelectDept(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All 15 Branches</option>
              {departments.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Readiness Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            <button
              onClick={() => setReadinessFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                readinessFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setReadinessFilter('ready')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                readinessFilter === 'ready'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Ready (≥7.0)
            </button>
            <button
              onClick={() => setReadinessFilter('attention')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                readinessFilter === 'attention'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Needs Attention
            </button>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by student name, USN (e.g. NNM24IS159), or branch..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Students Table / Grid */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <th className="py-3 px-4">Student</th>
              <th
                onClick={() => toggleSort('usn')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>USN</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Branch</th>
              <th
                onClick={() => toggleSort('cgpa')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Contineo CGPA</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Active Backlogs</th>
              <th
                onClick={() => toggleSort('skills')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Verified Proofs</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Readiness Status</th>
              <th className="py-3 px-4">Resume</th>
              <th className="py-3 px-4 text-right">Links</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-medium">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400">
                  No students match the criteria.
                </td>
              </tr>
            ) : (
              sorted.map((m) => (
                <tr
                  key={m.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {m.full_name || 'Student'}
                    </div>
                    <div className="text-[11px] text-slate-400">{m.email || '—'}</div>
                  </td>

                  <td className="py-3 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {m.usn || 'N/A'}
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                      {m.department_code || 'GEN'}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 font-bold text-sm">
                      <span
                        className={
                          (Number(m.cgpa) || 0) >= 8.5
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : (Number(m.cgpa) || 0) >= 7.0
                            ? 'text-sky-600 dark:text-sky-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }
                      >
                        {(Number(m.cgpa) || 0).toFixed(2)}
                      </span>
                      <span className="text-[10px] font-normal text-slate-400">/ 10.0</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    {m.active_backlogs === 0 ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>0 Backlogs</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-500/30">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{m.active_backlogs} Active</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-500/20">
                        {m.verified_skills_count} Verified
                      </span>
                      <span className="text-[11px] text-slate-400">
                        / {m.total_skills_count}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    {m.is_placement_ready ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Tier 1 Eligible</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Requires Remediation</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    {m.resume_storage_path || m.has_resume ? (
                      <a
                        href={`/api/recruiter/resume/file?path=${encodeURIComponent(m.resume_storage_path || '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                        title={m.resume_file_name || 'View Permanent Resume'}
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-500" />
                        <span>View Resume</span>
                      </a>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/60">
                        Resume not uploaded
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    {m.github_username && (
                      <a
                        href={`https://github.com/${m.github_username}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg inline-flex items-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View GitHub"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
