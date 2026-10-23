'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { PlacementDrive, FullStudentProfile } from '@/types';
import { checkDriveEligibility } from '@/lib/rulesEngine';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  Users,
  GraduationCap,
  AlertTriangle,
  Loader2,
  BookOpen,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  drive: PlacementDrive | null;
}

export default function EligibleStudentModal({ isOpen, onClose, drive }: Props) {
  const [students, setStudents] = useState<FullStudentProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'eligible' | 'disqualified'>('all');

  useEffect(() => {
    if (!isOpen || !drive) return;

    loadStudents();
  }, [isOpen, drive]);

  async function loadStudents() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/students');
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `Request failed with status ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data.students)) {
        setStudents(data.students);
      } else if (data.error) {
        setError(data.error);
      } else {
        setStudents([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load students from college database');
    } finally {
      setLoading(false);
    }
  }

  // Evaluate every student using the existing checkDriveEligibility rules engine function
  const evaluatedStudents = useMemo(() => {
    if (!drive) return [];

    return students.map((student) => {
      const evaluation = checkDriveEligibility(student, drive);
      return {
        student,
        isEligible: evaluation.isEligible,
        disqualificationReason: evaluation.disqualificationReason,
      };
    });
  }, [students, drive]);

  const eligibleCount = useMemo(
    () => evaluatedStudents.filter((e) => e.isEligible).length,
    [evaluatedStudents]
  );
  const disqualifiedCount = evaluatedStudents.length - eligibleCount;

  // Filtered by tab and search
  const filteredStudents = useMemo(() => {
    return evaluatedStudents.filter((item) => {
      // Tab filter
      if (activeTab === 'eligible' && !item.isEligible) return false;
      if (activeTab === 'disqualified' && item.isEligible) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = (item.student.profile.full_name || '').toLowerCase();
        const usn = (item.student.profile.usn || '').toLowerCase();
        const branch = (item.student.profile.department_code || '').toLowerCase();
        return name.includes(q) || usn.includes(q) || branch.includes(q);
      }

      return true;
    });
  }, [evaluatedStudents, activeTab, searchQuery]);

  if (!isOpen || !drive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[90vh] glass-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 shrink-0 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                Contineo ERP Audit
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {drive.company_name} — {drive.role_title}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Student Eligibility Verification Roster
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Evaluated against mandatory cutoffs: Min CGPA{' '}
              <strong className="text-slate-900 dark:text-white font-mono">
                {drive.min_cgpa.toFixed(2)}
              </strong>
              , Max Backlogs{' '}
              <strong className="text-slate-900 dark:text-white font-mono">
                {drive.max_active_backlogs}
              </strong>
              , Branches{' '}
              <strong className="text-slate-900 dark:text-white">
                {drive.eligible_branches.join(', ')}
              </strong>
              , Batch{' '}
              <strong className="text-slate-900 dark:text-white font-mono">
                {drive.batch_year}
              </strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Evaluation Summary Pills */}
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All Students ({evaluatedStudents.length})
            </button>
            <button
              onClick={() => setActiveTab('eligible')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'eligible'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Eligible ({eligibleCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('disqualified')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'disqualified'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 hover:bg-rose-100'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Disqualified ({disqualifiedCount})</span>
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by student name, USN, branch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3 text-indigo-600" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Auditing cohort against Contineo ERP criteria...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
              <button
                onClick={loadStudents}
                className="px-3 py-1 rounded-lg bg-rose-100 dark:bg-rose-900/50 hover:bg-rose-200 dark:hover:bg-rose-800 text-rose-800 dark:text-rose-200 font-semibold text-xs shrink-0 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              {students.length === 0
                ? 'No student records found in the college registry.'
                : 'No students match the selected filter criteria.'}
            </div>
          ) : (
            filteredStudents.map(({ student, isEligible, disqualificationReason }) => {
              const profile = student.profile;
              const ar = student.academic_record;

              return (
                <div
                  key={profile.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isEligible
                      ? 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {profile.full_name}
                        </span>
                        {profile.usn && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {profile.usn}
                          </span>
                        )}
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20">
                          {profile.department_code || 'ISE'} • Batch{' '}
                          {profile.graduation_year || '2026'}
                        </span>
                        {ar?.is_verified_by_exam_cell && (
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-medium">
                            <ShieldCheck className="w-3 h-3" /> Contineo Verified
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
                        <span>
                          CGPA:{' '}
                          <strong className="text-slate-800 dark:text-slate-200 font-mono">
                            {ar ? ar.cgpa.toFixed(2) : 'N/A'}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          Active Backlogs:{' '}
                          <strong
                            className={`font-mono ${
                              (ar?.active_backlogs || 0) > 0
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {ar ? ar.active_backlogs : 0}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          Credits Earned:{' '}
                          <strong className="text-slate-800 dark:text-slate-200 font-mono">
                            {ar ? ar.total_earned_credits : 0}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* Eligibility Decision Badge */}
                    <div className="shrink-0 self-start sm:self-center">
                      {isEligible ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Eligible to Apply</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Disqualified</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Disqualification Reasons Banner if ineligible */}
                  {!isEligible && disqualificationReason && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block mb-0.5">Failed Mandatory Criteria:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-600 dark:text-rose-300/90">
                          {disqualificationReason.split('; ').map((reason, idx) => (
                            <li key={idx}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <span>
            Showing {filteredStudents.length} of {evaluatedStudents.length} students
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 font-semibold transition-colors"
          >
            Close Roster
          </button>
        </div>
      </div>
    </div>
  );
}
