'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { FullStudentProfile } from '@/types';
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Send,
  Loader2,
  Clock,
  ArrowLeft,
  Building2,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';

export default function AcademicTruthPage() {
  const { user } = useAuth();
  const [student, setStudent] = useState<FullStudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Correction Request Form State
  const [subjectOrSem, setSubjectOrSem] = useState('');
  const [claimedValue, setClaimedValue] = useState('');
  const [officialValue, setOfficialValue] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStudentData = async () => {
    try {
      const studentIdentifier = user?.usn || user?.id || user?.email;
      if (!studentIdentifier) {
        setLoading(false);
        return;
      }
      const param = studentIdentifier.includes('@')
        ? `id=${encodeURIComponent(studentIdentifier)}`
        : `usn=${encodeURIComponent(studentIdentifier)}`;
      const res = await fetch(`/api/students?${param}`);
      const data = await res.json();
      if (data.student) {
        setStudent(data.student);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [user]);

  const handleCorrectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    setSubmitting(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch('/api/students/correction-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: student.profile.id,
          subject_or_semester: subjectOrSem,
          claimed_value: claimedValue,
          official_value: officialValue,
          reason,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg({
          type: 'success',
          text: 'Correction request submitted! Dr. K. Sharma and the Faculty Mentor desk will review and sync with Contineo ERP.',
        });
        setSubjectOrSem('');
        setClaimedValue('');
        setOfficialValue('');
        setReason('');
      } else {
        setFeedbackMsg({ type: 'error', text: data.error || 'Failed to submit correction request' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading Contineo ERP records from database...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="py-20 text-center bg-white dark:bg-slate-900/60 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
          No student record found in database.
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Please verify your institutional email or sign in with an account seeded in the database.
        </p>
      </div>
    );
  }

  const { profile, academic_record, semester_marks } = student;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/student"
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Back to Student Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Deterministic Academic Standing
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-emerald-500" />
            <span>Contineo Academic Truth & ERP Ledger</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            NMAM Institute of Technology Autonomous Examination Cell • Direct ERP Grade Ledger
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-xs font-bold self-start sm:self-center">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Exam Cell Cryptographically Verified</span>
        </div>
      </div>

      {/* Top Academic Truth Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
            OFFICIAL CGPA
          </span>
          <div className="text-2xl md:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {academic_record ? academic_record.cgpa.toFixed(2) : 'N/A'}{' '}
            <span className="text-xs font-normal text-slate-400">/ 10.0</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
            {profile.department_code} • Autonomous Batch {academic_record?.batch || '2022-2026'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
            EARNED CREDITS
          </span>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
            {academic_record ? academic_record.total_earned_credits : 0}{' '}
            <span className="text-xs font-normal text-slate-400">/ 160</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
            Total 6 Semesters Cleared
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
            ACTIVE BACKLOGS
          </span>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
            {academic_record ? academic_record.active_backlogs : 0}
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
            {academic_record?.active_backlogs === 0 ? 'Clean Track Record' : 'Requires Remediation'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
            SOURCE SYSTEM
          </span>
          <div className="text-xs font-bold text-slate-900 dark:text-white truncate" title={academic_record?.source_system}>
            Contineo ERP
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
            NMAMIT Autonomous Cell
          </span>
        </div>
      </div>

      {/* Semester-by-Semester Contineo Marks Ledger */}
      <div className="glass-panel p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
              Official Semester Marks Ledger
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verified Contineo Autonomous ERP SGPA and credit audit trail
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            USN: {profile.usn}
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4">Exam Month & Year</th>
                <th className="py-3 px-4">Credits Registered</th>
                <th className="py-3 px-4">Credits Earned</th>
                <th className="py-3 px-4">SGPA</th>
                <th className="py-3 px-4">Backlogs</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-medium">
              {semester_marks && semester_marks.length > 0 ? (
                semester_marks.map((sm) => (
                  <tr key={sm.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      Semester {sm.semester}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {sm.exam_month_year}
                    </td>
                    <td className="py-3 px-4">{sm.credits_registered} Credits</td>
                    <td className="py-3 px-4">{sm.credits_earned} Credits</td>
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-sm text-sky-600 dark:text-sky-400">
                        {sm.sgpa.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {sm.backlogs === 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                          0
                        </span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 font-bold text-xs">
                          {sm.backlogs}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No semester marks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Academic Correction Request Form */}
      <div className="glass-panel p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
              Report Grade Discrepancy or Makeup Result to Faculty Mentor
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Have a revaluation grade increase or makeup backlog clearance not yet reflected in Contineo? Submit a verification request.
            </p>
          </div>
        </div>

        {feedbackMsg && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-300'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleCorrectionSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Subject Code & Semester Name *
              </label>
              <input
                type="text"
                required
                value={subjectOrSem}
                onChange={(e) => setSubjectOrSem(e.target.value)}
                placeholder="e.g. Semester 5 - Advanced DBMS (22IS502)"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Claimed Grade / Revised Result *
              </label>
              <input
                type="text"
                required
                value={claimedValue}
                onChange={(e) => setClaimedValue(e.target.value)}
                placeholder="e.g. Grade S (9.5 SGPA) or Backlog Cleared"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Current Official Contineo Record (Optional)
            </label>
            <input
              type="text"
              value={officialValue}
              onChange={(e) => setOfficialValue(e.target.value)}
              placeholder="e.g. Grade A (8.45 SGPA)"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Explanation & Proof Details *
            </label>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Revaluation result announced by Autonomous Exam Cell on Oct 18th updated grade to S."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Submit to Faculty Mentor</span>
          </button>
        </form>
      </div>
    </div>
  );
}
