'use client';

import React, { useState } from 'react';
import { EvidenceSubmission, CertificateAssessment } from '@/types';
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
  BrainCircuit,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';

interface Props {
  pendingSubmissions: EvidenceSubmission[];
  onRefresh: () => void;
  reviewerName?: string;
}

const QUICK_FEEDBACK_APPROVED = [
  'Verified codebase quality and modular clean architecture.',
  'Confirmed assessment mastery and authentic certificate accreditation.',
  'Excellent implementation with deterministic logic and tests.',
  'Industry-ready technical proof endorsed for recruiter pipeline.',
];

const QUICK_FEEDBACK_REJECTED = [
  'Certificate authenticity could not be verified with issuing body.',
  'Incomplete repository: Missing source files and commit history.',
  'Document illegible: Please re-upload official high-resolution certificate PDF.',
];

const QUICK_FEEDBACK_RETAKE = [
  'Assessment score fell below 60% verification threshold. Review core domain concepts and retry.',
  'Good initial attempt. Focus on concurrency, error handling, and algorithmic complexity for your retake.',
  'Review cloud networking and security principles before retaking.',
];

export default function MentorApprovalDesk({
  pendingSubmissions,
  onRefresh,
  reviewerName = 'Dr. K. Sharma (Faculty Mentor)',
}: Props) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'verified' | 'rejected' | 'all'>('pending');

  // Action dialog states
  const [rejectDialogSubId, setRejectDialogSubId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [retakeDialogSubId, setRetakeDialogSubId] = useState<string | null>(null);
  const [retakeFeedback, setRetakeFeedback] = useState('');

  // Expandable assessment breakdowns
  const [expandedAssessmentId, setExpandedAssessmentId] = useState<string | null>(null);
  const [assessmentDataMap, setAssessmentDataMap] = useState<Record<string, CertificateAssessment>>({});
  const [loadingAssessmentId, setLoadingAssessmentId] = useState<string | null>(null);

  const filteredList = pendingSubmissions.filter((sub) => {
    if (statusFilter === 'all') return true;
    return sub.status === statusFilter;
  });

  const loadAssessmentDetails = async (submissionId: string) => {
    if (expandedAssessmentId === submissionId) {
      setExpandedAssessmentId(null);
      return;
    }

    if (assessmentDataMap[submissionId]) {
      setExpandedAssessmentId(submissionId);
      return;
    }

    setLoadingAssessmentId(submissionId);
    try {
      const res = await fetch(`/api/assessment/history?submission_id=${encodeURIComponent(submissionId)}`);
      const data = await res.json();
      if (data.assessment) {
        setAssessmentDataMap((prev) => ({
          ...prev,
          [submissionId]: data.assessment,
        }));
        setExpandedAssessmentId(submissionId);
      }
    } catch (e) {
      console.error('Failed to load assessment history:', e);
    } finally {
      setLoadingAssessmentId(null);
    }
  };

  const handleDecision = async (
    submissionId: string,
    action: 'approve' | 'reject' | 'grant_retake',
    reasonOrFeedback?: string
  ) => {
    setProcessingId(submissionId);
    setSuccessToast(null);

    try {
      const res = await fetch('/api/mentor/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_id: submissionId,
          action,
          rejection_reason: action === 'reject' ? reasonOrFeedback : undefined,
          retake_feedback: action === 'grant_retake' ? reasonOrFeedback : undefined,
          reviewer_name: reviewerName,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessToast(data.message || 'Decision recorded successfully.');
        onRefresh();
        setRejectDialogSubId(null);
        setRetakeDialogSubId(null);
        setRejectionReason('');
        setRetakeFeedback('');
      } else {
        alert(data.error || 'Failed to submit decision.');
      }
    } catch (e) {
      console.error(e);
      alert('Network error while processing mentor decision.');
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
                Faculty Evidence & Assessment Verification Desk
              </h3>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
                {pendingSubmissions.filter((s) => s.status === 'pending').length} Pending
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Deterministic exam audit: Inspect student answers, correct answer keys, scores, and endorse authentic credentials.
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
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
      )}

      {/* Submissions List */}
      {filteredList.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          No submissions matching the selected status filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredList.map((sub) => {
            const isPending = sub.status === 'pending';
            const isVerified = sub.status === 'verified';
            const hasScore = sub.assessment_score !== undefined && sub.assessment_score !== null;
            const attemptsCount = sub.attempts_count || 1;
            const maxAttempts = sub.max_attempts_allowed || 2;
            const isMaxAttemptsReached = attemptsCount >= 2;

            const isExpanded = expandedAssessmentId === sub.id;
            const assessment = assessmentDataMap[sub.id];

            return (
              <div
                key={sub.id}
                className={`p-4 md:p-5 rounded-2xl border transition-all ${
                  isVerified
                    ? 'border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10'
                    : isPending
                    ? 'border-indigo-200/80 dark:border-indigo-900/40 bg-white dark:bg-slate-900/90 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  {/* Left Column: Student & Credential Details */}
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
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
                    </div>

                    <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {sub.title}
                    </h5>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {sub.description}
                    </p>

                    {/* Assessment Score & Attempt Metrics */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4 text-indigo-500" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Practice Assessment Score:
                        </span>
                        {hasScore ? (
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded ${
                              sub.assessment_score! >= 60.0
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}
                          >
                            {sub.assessment_score}%
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not evaluated</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Attempt {attemptsCount} of {maxAttempts}
                        </span>

                        <button
                          onClick={() => loadAssessmentDetails(sub.id)}
                          className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          {loadingAssessmentId === sub.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <span>{isExpanded ? 'Hide Rubric' : 'Audit Exam Answers'}</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Question Breakdown & Rubric */}
                    {isExpanded && assessment && (
                      <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-slate-950 border border-indigo-100 dark:border-slate-800 text-xs space-y-3 animate-in fade-in">
                        <div className="flex items-center justify-between border-b border-indigo-100 dark:border-slate-800 pb-2">
                          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Exam Audit: {assessment.subject_label}</span>
                          </span>
                          <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                            {assessment.correct_answers} / {assessment.total_questions} Questions Correct ({assessment.score_percentage}%)
                          </span>
                        </div>

                        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                          {assessment.answers.map((ans, idx) => (
                            <div
                              key={ans.questionId}
                              className={`p-3 rounded-xl border text-[11px] space-y-1.5 ${
                                ans.isCorrect
                                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                                  : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2 font-semibold text-slate-900 dark:text-white">
                                <span>Q{idx + 1}. {ans.questionText}</span>
                                {ans.isCorrect ? (
                                  <span className="text-emerald-600 font-bold text-[10px] shrink-0">✓ Correct</span>
                                ) : (
                                  <span className="text-rose-600 font-bold text-[10px] shrink-0">✗ Incorrect</span>
                                )}
                              </div>

                              <div className="pl-3 border-l-2 border-slate-300 dark:border-slate-700 space-y-0.5 text-[10px]">
                                <p className="text-slate-600 dark:text-slate-400">
                                  <strong>Student Pick:</strong>{' '}
                                  <span className={ans.isCorrect ? 'text-emerald-700 font-semibold' : 'text-rose-700'}>
                                    {ans.selectedOptionIndex >= 0 ? ans.options[ans.selectedOptionIndex] : 'Unanswered'}
                                  </span>
                                </p>
                                {!ans.isCorrect && (
                                  <p className="text-emerald-700 dark:text-emerald-300 font-semibold">
                                    <strong>Grading Key:</strong> {ans.options[ans.correctOptionIndex]}
                                  </p>
                                )}
                                <p className="text-slate-500 italic pt-0.5">
                                  Explanation: {ans.explanation}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* External Proof & File Links */}
                    <div className="flex items-center gap-4 pt-1 flex-wrap text-xs">
                      {(sub.document_storage_path || sub.credential_url) && (
                        <a
                          href={sub.credential_url || `/uploads/${sub.document_storage_path}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Inspect Certificate PDF Evidence</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      {sub.github_repo_url && (
                        <a
                          href={sub.github_repo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 hover:underline font-mono font-semibold"
                        >
                          <Github className="w-3.5 h-3.5" />
                          <span>Repository Proof</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* Recorded Feedback Display */}
                    {sub.faculty_feedback && (
                      <div className="mt-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 flex items-start gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>Faculty Mentor Notes: </strong>
                          <span>{sub.faculty_feedback}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Mutually Exclusive Mentor Decisions */}
                  {isPending && (
                    <div className="flex flex-col gap-2 shrink-0 self-stretch lg:self-center lg:w-64 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-slate-800">
                      {/* Action 1: Approve & Endorse */}
                      <button
                        onClick={() =>
                          handleDecision(
                            sub.id,
                            'approve',
                            'Assessment verified and endorsed by Faculty Mentor. Skill unlocked in Skill Passport.'
                          )
                        }
                        disabled={processingId === sub.id}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                      >
                        {processingId === sub.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5" />
                        )}
                        <span>Approve & Verify</span>
                      </button>

                      {/* Action 2: Grant One Additional Attempt */}
                      <button
                        onClick={() => setRetakeDialogSubId(sub.id)}
                        disabled={processingId === sub.id || isMaxAttemptsReached}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-colors disabled:opacity-40"
                        title={
                          isMaxAttemptsReached
                            ? 'Maximum assessment attempts (2) already reached.'
                            : 'Grant student exactly one additional assessment attempt with guidance feedback.'
                        }
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                        <span>
                          {isMaxAttemptsReached ? 'Retake Limit Reached (2/2)' : 'Grant Retake (1 Left)'}
                        </span>
                      </button>

                      {/* Action 3: Reject with Reason */}
                      <button
                        onClick={() => setRejectDialogSubId(sub.id)}
                        disabled={processingId === sub.id}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-600 text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject Credential</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Dialog: Reject with Mandatory Reason */}
      {rejectDialogSubId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-500" />
                <span>Reject Certificate Credential</span>
              </h4>
              <button onClick={() => setRejectDialogSubId(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide a clear reason for declining this credential submission so the student can rectify deficiencies.
            </p>

            <textarea
              required
              rows={3}
              placeholder="State the reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
            />

            <div className="flex items-center gap-1 flex-wrap">
              {QUICK_FEEDBACK_REJECTED.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRejectionReason(r)}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                >
                  {r.substring(0, 32)}...
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setRejectDialogSubId(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDecision(rejectDialogSubId, 'reject', rejectionReason)}
                disabled={!rejectionReason.trim() || processingId === rejectDialogSubId}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog: Grant 1 Additional Attempt with Feedback */}
      {retakeDialogSubId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-indigo-500" />
                <span>Authorize Additional Assessment Attempt</span>
              </h4>
              <button onClick={() => setRetakeDialogSubId(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              The student will receive an in-app notification granting exactly <strong>1 additional attempt</strong> (attempt 2 of 2). Policy prohibits any 3rd attempt.
            </p>

            <textarea
              required
              rows={3}
              placeholder="Explain what topics or concepts the student should improve before retaking..."
              value={retakeFeedback}
              onChange={(e) => setRetakeFeedback(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />

            <div className="flex items-center gap-1 flex-wrap">
              {QUICK_FEEDBACK_RETAKE.map((f, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRetakeFeedback(f)}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                >
                  {f.substring(0, 36)}...
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setRetakeDialogSubId(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDecision(retakeDialogSubId, 'grant_retake', retakeFeedback)}
                disabled={!retakeFeedback.trim() || processingId === retakeDialogSubId}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
              >
                Authorize Retake
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
