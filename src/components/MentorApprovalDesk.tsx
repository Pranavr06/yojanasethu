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
} from 'lucide-react';

interface Props {
  pendingSubmissions: EvidenceSubmission[];
  onRefresh: () => void;
}

export default function MentorApprovalDesk({ pendingSubmissions, onRefresh }: Props) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleVerify = async (submissionId: string, approved: boolean) => {
    setProcessingId(submissionId);
    setSuccessToast(null);

    try {
      const res = await fetch('/api/mentor/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_id: submissionId,
          approved,
          faculty_comment: approved
            ? 'Verified implementation quality and technical documentation.'
            : 'Revision required to codebase structure.',
          reviewer_name: 'Dr. K. Sharma (Faculty Mentor)',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessToast(
          approved
            ? 'Evidence Approved! Verification badge granted in student_skill_passport and unlocked for recruiters.'
            : 'Revision requested from student.'
        );
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800/80 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Faculty Evidence Verification Desk
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
                {pendingSubmissions.length} Pending
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Human-in-the-loop review: Prevents fake claims and unlocks recruiter ranking points
            </p>
          </div>
        </div>

        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          Reviewer: <strong className="text-slate-800 dark:text-slate-200">Dr. K. Sharma</strong>
        </span>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Pending Items List */}
      {pendingSubmissions.length === 0 ? (
        <div className="py-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          <CheckCircle className="w-8 h-8 text-emerald-500/60 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Verification Queue is Clean!
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            All submitted projects and certificates have been reviewed. When students submit proof, they appear here instantly.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingSubmissions.map((sub) => (
            <div
              key={sub.id}
              className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {sub.student_name}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {sub.student_usn}
                  </span>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                    Skill: {sub.associated_skills[0] || 'Python'}
                  </span>
                  <span className="text-[10px] flex items-center gap-1 text-slate-500 dark:text-slate-400">
                    <Clock className="w-3 h-3" /> Just now
                  </span>
                </div>

                <h5 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {sub.title}
                </h5>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                  {sub.description}
                </p>

                {/* Proof Links */}
                <div className="flex items-center gap-3 pt-1">
                  {sub.github_repo_url && (
                    <a
                      href={sub.github_repo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 hover:underline font-mono"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>Inspect Repository</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}

                  {sub.credential_url && (
                    <a
                      href={sub.credential_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View PDF Document (Supabase Storage)</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <button
                  onClick={() => handleVerify(sub.id, false)}
                  disabled={processingId === sub.id}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-medium transition-colors"
                >
                  Request Changes
                </button>
                <button
                  onClick={() => handleVerify(sub.id, true)}
                  disabled={processingId === sub.id}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-60"
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
          ))}
        </div>
      )}
    </div>
  );
}
