'use client';

import React, { useState } from 'react';
import { AcademicCorrectionRequest } from '@/types';
import {
  FileCheck2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Building2,
  Loader2,
  Check,
  Send,
} from 'lucide-react';

interface Props {
  requests: AcademicCorrectionRequest[];
  onRefresh: () => void;
}

export default function MentorCorrectionDesk({ requests, onRefresh }: Props) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});
  const [filterStatus, setFilterStatus] = useState<'pending' | 'resolved' | 'rejected' | 'all'>('pending');

  const filteredRequests = requests.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  const handleAction = async (id: string, status: 'resolved' | 'rejected') => {
    setProcessingId(id);
    setSuccessToast(null);

    const notes = feedbackInputs[id] || (
      status === 'resolved'
        ? 'Verified with NMAMIT Autonomous Examination Cell records. Discrepancy rectified.'
        : 'Exam Cell verified official records; revaluation request does not meet grade alteration threshold.'
    );

    try {
      const res = await fetch('/api/mentor/corrections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status,
          admin_notes: notes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessToast(
          status === 'resolved'
            ? 'Correction Approved! Contineo ERP synchronized with revised academic standing.'
            : 'Correction claim declined with feedback recorded for the student.'
        );
        onRefresh();
      } else {
        alert(data.error || 'Failed to update request');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="glass-panel p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800/80 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
                Contineo ERP Academic Correction Desk
              </h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30">
                {requests.filter(r => r.status === 'pending').length} Pending
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direct review gate for student grade discrepancies, revaluation updates, and makeup exam sync
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-semibold self-start sm:self-center">
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1 rounded-lg transition-all ${
              filterStatus === 'pending'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pending ({requests.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilterStatus('resolved')}
            className={`px-3 py-1 rounded-lg transition-all ${
              filterStatus === 'resolved'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Resolved ({requests.filter(r => r.status === 'resolved').length})
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-lg transition-all ${
              filterStatus === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All ({requests.length})
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successToast && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="py-10 text-center bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          <CheckCircle className="w-8 h-8 text-emerald-500/60 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No Academic Correction Requests in this filter
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            When students report exam cell revaluations or cleared backlogs, they will appear here for faculty endorsement.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className={`p-4 md:p-5 rounded-2xl border transition-all ${
                req.status === 'pending'
                  ? 'bg-slate-50/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800'
                  : req.status === 'resolved'
                  ? 'bg-emerald-50/20 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40'
                  : 'bg-rose-50/20 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-800/40'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Student & Claim Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {req.student_name}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                      {req.student_usn}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                      {req.student_branch}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        req.status === 'pending'
                          ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                          : req.status === 'resolved'
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {req.status}
                    </span>
                    <span className="text-[11px] flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      {new Date(req.submitted_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h5 className="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Subject / Term: <span className="text-indigo-600 dark:text-indigo-400">{req.subject_or_semester}</span>
                  </h5>

                  {/* Discrepancy Comparison Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-1">
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-0.5">
                        Current Contineo Record
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {req.official_value}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-0.5">
                        Claimed Grade / Status
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {req.claimed_value}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                    <strong className="text-slate-800 dark:text-slate-200">Student Explanation: </strong>
                    {req.reason}
                  </div>

                  {req.admin_notes && (
                    <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 text-xs text-purple-900 dark:text-purple-300">
                      <strong>Faculty Review Notes: </strong>
                      {req.admin_notes}
                    </div>
                  )}
                </div>

                {/* Right: Actions (only when pending) */}
                {req.status === 'pending' && (
                  <div className="flex flex-col gap-2 shrink-0 self-stretch lg:self-center lg:w-64 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-slate-800">
                    <input
                      type="text"
                      placeholder="Optional faculty notes..."
                      value={feedbackInputs[req.id] || ''}
                      onChange={(e) =>
                        setFeedbackInputs((prev) => ({ ...prev, [req.id]: e.target.value }))
                      }
                      className="w-full px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAction(req.id, 'rejected')}
                        disabled={processingId === req.id}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        Decline
                      </button>

                      <button
                        onClick={() => handleAction(req.id, 'resolved')}
                        disabled={processingId === req.id}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all disabled:opacity-50"
                      >
                        {processingId === req.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>Approve & Sync</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
