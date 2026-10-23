'use client';

import React, { useState } from 'react';
import { EvidenceSubmission } from '@/types';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  ExternalLink,
  FileText,
  Github,
  Loader2,
  Clock,
  Sparkles,
  Users,
  Code2,
  Filter,
  Check,
  Send,
  MessageSquare,
} from 'lucide-react';

interface Props {
  pendingSubmissions: EvidenceSubmission[];
  onRefresh: () => void;
  reviewerName?: string;
}

const QUICK_FEEDBACK_APPROVED = [
  'Verified codebase quality and modular clean architecture.',
  'Excellent implementation with deterministic logic and tests.',
  'Confirmed live deployment and verified documentation.',
  'Industry-ready technical proof endorsed for recruiter pipeline.',
];

const QUICK_FEEDBACK_REJECTED = [
  'Revision required: Please add README documentation and unit tests.',
  'Incomplete repository: Missing source files and commit history.',
  'Document illegible: Please re-upload high-resolution certificate PDF.',
];

export default function MentorApprovalDesk({
  pendingSubmissions,
  onRefresh,
  reviewerName = 'Dr. K. Sharma (Faculty Mentor)',
}: Props) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null);
  const [customComment, setCustomComment] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<'pending' | 'verified' | 'rejected' | 'all'>('pending');

  const filteredList = pendingSubmissions.filter((sub) => {
    if (statusFilter === 'all') return true;
    return sub.status === statusFilter;
  });

  const handleVerify = async (submissionId: string, approved: boolean) => {
    setProcessingId(submissionId);
    setSuccessToast(null);

    const comment =
      customComment[submissionId] ||
      (approved
        ? 'Verified implementation quality and technical documentation. Endorsed for recruiter matching.'
        : 'Revision required to codebase structure and technical proof.');

    try {
      const res = await fetch('/api/mentor/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_id: submissionId,
          approved,
          faculty_comment: comment,
          reviewer_name: reviewerName,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessToast(
          approved
            ? 'Evidence Approved! Verification badge granted in student_skill_passport and unlocked for recruiters.'
            : 'Revision requested from student with mentor feedback.'
        );
        onRefresh();
        setActiveFeedbackId(null);
      } else {
        alert(data.error || 'Failed to update submission');
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
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
                Faculty Evidence Verification Desk
              </h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
                {pendingSubmissions.filter((s) => s.status === 'pending').length} Pending
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Human-in-the-loop review: Prevents fake resume claims and unlocks verified recruiter ranking points
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'pending'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Pending ({pendingSubmissions.filter((s) => s.status === 'pending').length})
            </button>
            <button
              onClick={() => setStatusFilter('verified')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'verified'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Verified ({pendingSubmissions.filter((s) => s.status === 'verified').length})
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({pendingSubmissions.length})
            </button>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Items List */}
      {filteredList.length === 0 ? (
        <div className="py-10 text-center bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          <CheckCircle className="w-8 h-8 text-emerald-500/60 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Queue is Clean!
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            No submissions in this filter. When students submit GitHub repos or credentials, they appear here live.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredList.map((sub) => {
            const isPending = sub.status === 'pending';
            const isVerified = sub.status === 'verified';

            return (
              <div
                key={sub.id}
                className={`p-4 md:p-5 rounded-2xl border transition-all ${
                  isPending
                    ? 'bg-slate-50/70 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700'
                    : isVerified
                    ? 'bg-emerald-50/20 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40'
                    : 'bg-rose-50/20 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-800/40'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left Column: Proof Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {sub.student_name}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                        {sub.student_usn}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                        {sub.student_branch || 'ISE'}
                      </span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        Type: {sub.type}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          isPending
                            ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                            : isVerified
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {sub.status}
                      </span>
                      <span className="text-[10px] flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3" />
                        {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>

                    <h5 className="text-xs md:text-sm font-bold text-slate-900 dark:text-slate-100">
                      {sub.title}
                    </h5>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {sub.description}
                    </p>

                    {/* Tech Badges & Role */}
                    <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                      {sub.claimed_role && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                          <Users className="w-3 h-3 text-slate-500" />
                          <span>Role: {sub.claimed_role}</span>
                        </span>
                      )}

                      {sub.technologies && sub.technologies.length > 0 && (
                        <div className="inline-flex items-center gap-1 flex-wrap">
                          {sub.technologies.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 text-[10px] font-mono border border-blue-200 dark:border-blue-500/20"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* External Proof Links */}
                    <div className="flex items-center gap-4 pt-1 flex-wrap">
                      {sub.github_repo_url && (
                        <a
                          href={sub.github_repo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 hover:underline font-mono font-semibold"
                        >
                          <Github className="w-3.5 h-3.5" />
                          <span>Inspect Codebase</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      {sub.live_demo_url && (
                        <a
                          href={sub.live_demo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Live Demo</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      {sub.credential_url && (
                        <a
                          href={sub.credential_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Official Certificate Verification</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* Display Recorded Feedback */}
                    {sub.faculty_feedback && (
                      <div className="mt-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 flex items-start gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>Faculty Feedback: </strong>
                          <span>{sub.faculty_feedback}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Faculty Endorsement Actions */}
                  {isPending && (
                    <div className="flex flex-col gap-2 shrink-0 self-stretch lg:self-center lg:w-72 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-slate-800">
                      {/* Optional Custom Comment Input */}
                      <input
                        type="text"
                        placeholder="Mentor endorsement notes..."
                        value={customComment[sub.id] || ''}
                        onChange={(e) =>
                          setCustomComment((prev) => ({ ...prev, [sub.id]: e.target.value }))
                        }
                        className="w-full px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />

                      {/* Quick Chips */}
                      <div className="flex items-center gap-1 flex-wrap">
                        <button
                          type="button"
                          onClick={() =>
                            setCustomComment((prev) => ({
                              ...prev,
                              [sub.id]: QUICK_FEEDBACK_APPROVED[0],
                            }))
                          }
                          className="text-[9px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                        >
                          + Clean Code
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setCustomComment((prev) => ({
                              ...prev,
                              [sub.id]: QUICK_FEEDBACK_APPROVED[1],
                            }))
                          }
                          className="text-[9px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                        >
                          + Tested
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setCustomComment((prev) => ({
                              ...prev,
                              [sub.id]: QUICK_FEEDBACK_REJECTED[0],
                            }))
                          }
                          className="text-[9px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                        >
                          + Add Tests
                        </button>
                      </div>

                      {/* Buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleVerify(sub.id, false)}
                          disabled={processingId === sub.id}
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          Request Changes
                        </button>
                        <button
                          onClick={() => handleVerify(sub.id, true)}
                          disabled={processingId === sub.id}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                        >
                          {processingId === sub.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="w-3.5 h-3.5" />
                          )}
                          <span>Approve & Endorse</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
