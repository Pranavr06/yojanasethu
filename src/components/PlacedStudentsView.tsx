'use client';

import React, { useState, useMemo } from 'react';
import { PlacedStudentRecord } from '@/types';
import {
  Trophy,
  Award,
  Search,
  Building2,
  ShieldCheck,
  Calendar,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Filter,
  DollarSign,
  Tag,
  ArrowUpRight,
} from 'lucide-react';

interface Props {
  placedStudents: PlacedStudentRecord[];
  currentStudentUsn?: string;
}

export default function PlacedStudentsView({ placedStudents, currentStudentUsn }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [minCtc, setMinCtc] = useState<number>(0);

  // Available branches
  const branches = useMemo(() => {
    const set = new Set<string>();
    placedStudents.forEach((s) => {
      if (s.department_code) set.add(s.department_code);
    });
    return Array.from(set).sort();
  }, [placedStudents]);

  // Filtered placed students
  const filtered = useMemo(() => {
    return placedStudents.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.student_name.toLowerCase().includes(q) ||
        s.student_usn.toLowerCase().includes(q) ||
        s.company_name.toLowerCase().includes(q) ||
        s.role_title.toLowerCase().includes(q);

      const matchBranch =
        selectedBranch === 'all' ||
        s.department_code.toLowerCase() === selectedBranch.toLowerCase();

      const matchCtc = minCtc === 0 || s.ctc_lpa >= minCtc;

      return matchSearch && matchBranch && matchCtc;
    });
  }, [placedStudents, searchQuery, selectedBranch, minCtc]);

  const totalPlaced = placedStudents.length;
  const maxCtc = placedStudents.length > 0 ? Math.max(...placedStudents.map((s) => s.ctc_lpa)) : 0;
  const avgCtc =
    totalPlaced > 0
      ? (placedStudents.reduce((acc, s) => acc + s.ctc_lpa, 0) / totalPlaced).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-6">
      {/* Placed Students Hero Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-indigo-500/15 border border-amber-500/30 dark:border-amber-500/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-400/30">
            <Trophy className="w-3.5 h-3.5" />
            <span>CAMPUS PLACEMENT SUCCESS & HALL OF FAME</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Placed Students Showcase
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
            Real-time verified campus placement offers certified by NMAMIT Examination Cell and Training & Placement Officer (TPO).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-center px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Placed</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{totalPlaced}</span>
          </div>

          <div className="text-center px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Highest Offer</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {maxCtc} <span className="text-xs">LPA</span>
            </span>
          </div>

          <div className="text-center px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Average CTC</span>
            <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
              {avgCtc} <span className="text-xs">LPA</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student name, USN, or company..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-medium"
            >
              <option value="all">All Departments ({totalPlaced})</option>
              {branches.map((b) => (
                <option key={b} value={b}>
                  {b} Department
                </option>
              ))}
            </select>
          </div>

          {/* Min CTC Filter */}
          <div>
            <select
              value={minCtc}
              onChange={(e) => setMinCtc(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-medium"
            >
              <option value={0}>All CTC Packages</option>
              <option value={10}>10+ LPA</option>
              <option value={12}>12+ LPA</option>
              <option value={15}>15+ LPA</option>
              <option value={18}>18+ LPA</option>
            </select>
          </div>
        </div>

        {(searchQuery || selectedBranch !== 'all' || minCtc > 0) && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>
              Showing {filtered.length} of {placedStudents.length} placed students
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedBranch('all');
                setMinCtc(0);
              }}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Placed Students Roster Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <Trophy className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Placed Students Match Filter</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Try adjusting your search query or minimum package filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => {
            const isSelf = currentStudentUsn && s.student_usn.toLowerCase() === currentStudentUsn.toLowerCase();

            return (
              <div
                key={s.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isSelf
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 shadow-sm'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Department & Package */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 font-bold text-[11px]">
                      {s.department_code}
                    </span>

                    <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-black font-mono text-sm">
                      {s.ctc_lpa} LPA
                    </span>
                  </div>

                  {/* Student Details */}
                  <div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{s.student_name}</span>
                      {isSelf && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-extrabold uppercase tracking-wider">
                          You
                        </span>
                      )}
                    </h4>
                    <span className="font-mono text-xs text-slate-400 block mt-0.5">
                      {s.student_usn}
                    </span>
                  </div>

                  {/* Company & Role */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-bold">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{s.company_name}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                      {s.role_title}
                    </p>
                  </div>
                </div>

                {/* Footer Badges */}
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>TPO & Exam Cell Certified</span>
                  </div>

                  <span className="font-mono text-[10px] text-slate-400">
                    {new Date(s.placed_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
