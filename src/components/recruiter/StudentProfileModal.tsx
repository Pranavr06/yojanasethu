'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  UserRound,
  GraduationCap,
  Award,
  FolderGit2,
  ExternalLink,
  FileText,
  Eye,
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  RotateCw,
  BookmarkCheck,
  UserPlus,
  Scale,
  MessageSquare,
  Check,
  CheckSquare,
  Square,
  HelpCircle,
} from 'lucide-react';
import type { FullStudentProfile, PlacementDrive } from '@/types';
import { evaluateDriveCandidate } from '@/lib/rulesEngine';
import AiResumeAnalyzerModal from './AiResumeAnalyzerModal';

interface StudentProfileModalProps {
  student: FullStudentProfile;
  onClose: () => void;
  drive?: PlacementDrive;
  onOpenAiAnalyzer?: (resumeUrl?: string, resumeFileName?: string) => void;
  isShortlisted?: boolean;
  shortlistStage?: string;
  onShortlist?: (studentId: string) => Promise<void> | void;
  onUpdateStage?: (studentId: string, newStage: string) => Promise<void> | void;
  onOpenNotes?: (studentId: string, studentName: string) => void;
  isSelectedForCompare?: boolean;
  onToggleCompare?: (studentId: string) => void;
}

interface ResumeData {
  hasResume: boolean;
  viewUrl?: string;
  streamingUrl?: string;
  storagePath?: string;
  fileName?: string;
  title?: string;
  uploadedAt?: string | null;
  message?: string;
}

type ResumeLoadingStatus = 'idle' | 'loading' | 'available' | 'not_uploaded' | 'error';

export default function StudentProfileModal({
  student,
  onClose,
  drive,
  onOpenAiAnalyzer,
  isShortlisted = false,
  shortlistStage = 'shortlisted',
  onShortlist,
  onUpdateStage,
  onOpenNotes,
  isSelectedForCompare = false,
  onToggleCompare,
}: StudentProfileModalProps) {
  const { profile, academic_record, semester_marks, skills, evidence_submissions } = student;

  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [resumeStatus, setResumeStatus] = useState<ResumeLoadingStatus>('loading');
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [showAiAnalyzer, setShowAiAnalyzer] = useState(false);

  // Separate verified vs self-declared skills
  const verifiedSkills = useMemo(
    () => skills.filter((s) => s.verification_badge),
    [skills]
  );
  const selfDeclaredSkills = useMemo(
    () => skills.filter((s) => !s.verification_badge),
    [skills]
  );

  // Projects and certificates with statuses
  const certificates = useMemo(
    () => evidence_submissions.filter((item) => item.type === 'certificate'),
    [evidence_submissions]
  );
  const projects = useMemo(
    () => evidence_submissions.filter((item) => item.type !== 'certificate'),
    [evidence_submissions]
  );

  // Drive Match Evaluation (if drive is active)
  const driveEvaluation = useMemo(() => {
    if (!drive) return null;
    return evaluateDriveCandidate(student, drive);
  }, [student, drive]);

  // Robust Resume Loading with Timeout and Request Cancellation
  const fetchResume = useCallback(async () => {
    setResumeStatus('loading');
    setResumeError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 6500); // 6.5s strict client timeout

    try {
      const queryParams = new URLSearchParams();
      if (profile.id) queryParams.set('studentId', profile.id);
      if (profile.usn) queryParams.set('usn', profile.usn);

      const res = await fetch(`/api/recruiter/resume?${queryParams.toString()}`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json();

      if (!res.ok) {
        setResumeStatus('error');
        setResumeError(data.error || 'Failed to retrieve resume information from storage.');
        setResumeData(null);
        return;
      }

      if (data.hasResume) {
        setResumeData(data);
        setResumeStatus('available');
      } else {
        setResumeData(data);
        setResumeStatus('not_uploaded');
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      setResumeStatus('error');
      if (err.name === 'AbortError') {
        setResumeError('Resume lookup timed out. Check network connection and retry.');
      } else {
        setResumeError(err.message || 'Network error verifying candidate resume.');
      }
      setResumeData(null);
    }
  }, [profile.id, profile.usn]);

  useEffect(() => {
    fetchResume();
  }, [fetchResume]);

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in"
        onClick={onClose}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="student-profile-title"
          className="relative my-auto max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 md:p-8 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Extreme Top-Right Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close student profile"
            className="absolute top-5 right-5 md:top-6 md:right-6 z-20 rounded-xl p-2 text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* 1. Header with Student Info (Left) and Recruiter Action Bar (Right) */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5 pr-10">
            {/* Left: Student avatar, name, USN, verification status, branch, and academic information */}
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 shrink-0">
                <UserRound className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2
                    id="student-profile-title"
                    className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white"
                  >
                    {profile.full_name}
                  </h2>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                    {profile.usn || 'USN N/A'}
                  </span>
                  {academic_record?.is_verified_by_exam_cell && (
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20 font-medium flex items-center gap-1 shrink-0">
                      <ShieldCheck className="w-3 h-3" /> Contineo Verified
                    </span>
                  )}
                </div>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {profile.department_code || 'Engineering'} • Semester {profile.semester || 'N/A'} • Class of {profile.graduation_year || 'N/A'}
                </p>
              </div>
            </div>

            {/* Right: Compare, Notes, and Shortlisted controls */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {/* Recruiter Action: Compare Toggle */}
              {onToggleCompare && (
                <button
                  type="button"
                  onClick={() => onToggleCompare(profile.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isSelectedForCompare
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-400'
                  }`}
                  title="Toggle candidate for side-by-side comparison"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>{isSelectedForCompare ? 'Compared' : 'Compare'}</span>
                </button>
              )}

              {/* Recruiter Action: Notes & Feedback */}
              {onOpenNotes && (
                <button
                  type="button"
                  onClick={() => onOpenNotes(profile.id, profile.full_name)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                  title="Add or review recruiter evaluation notes"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
                  <span>Notes</span>
                </button>
              )}

              {/* Recruiter Action: Shortlist / Stage */}
              {onShortlist && (
                isShortlisted ? (
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30">
                      <Check className="w-3.5 h-3.5" /> Shortlisted
                    </span>
                    {onUpdateStage && (
                      <select
                        value={shortlistStage}
                        onChange={(e) => onUpdateStage(profile.id, e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
                        title="Update applicant pipeline stage"
                      >
                        <option value="shortlisted">Shortlisted</option>
                        <option value="interview_scheduled">Interview Scheduled</option>
                        <option value="interview_completed">Interview Completed</option>
                        <option value="selected">Selected</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onShortlist(profile.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-sm transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Shortlist</span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* 2. PLACEMENT DRIVE MATCH ANALYSIS SECTION (If drive provided) */}
          {drive && driveEvaluation && (
            <section className="rounded-2xl border border-purple-200 dark:border-purple-900/50 p-5 bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/30 dark:from-purple-950/20 dark:via-slate-900/40 dark:to-indigo-950/20 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Placement Drive Match Analysis
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Target Role: <strong className="text-slate-700 dark:text-slate-200">{drive.company_name} — {drive.role_title} ({drive.ctc_lpa} LPA)</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Hard Academic Gate */}
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                      ERP Academic Cutoff
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border ${
                        driveEvaluation.is_eligible
                          ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                          : 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30'
                      }`}
                    >
                      {driveEvaluation.is_eligible ? 'PASSED CUTOFF' : 'FAILED CUTOFF'}
                    </span>
                  </div>

                  {/* Evidence Match Percentage */}
                  <div className="text-right border-l border-slate-200 dark:border-slate-800 pl-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                      Evidence Match
                    </span>
                    <span className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400">
                      {driveEvaluation.match_score}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Skills breakdown for this drive */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  Drive Required Skills Audit:
                </span>
                <div className="flex flex-wrap gap-2">
                  {driveEvaluation.skill_breakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                        item.status === 'verified'
                          ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                          : item.status === 'claimed'
                          ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {item.status === 'verified' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : item.status === 'claimed' ? (
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      )}
                      <span>{item.skill_name}</span>
                      <span className="text-[9px] uppercase font-bold opacity-75">
                        {item.status === 'verified'
                          ? 'Mentor Verified (2x)'
                          : item.status === 'claimed'
                          ? 'Self-Declared (1x)'
                          : 'Missing'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanatory note */}
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Scoring Math:</strong> {driveEvaluation.explanation} Evidence Match reflects mentor-verified and self-declared skills matching the drive criteria. Academic eligibility (PASS/FAIL) is governed strictly by Contineo ERP metrics.
                </span>
              </div>
            </section>
          )}

          {/* 3. Academic Highlights Grid */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-500 uppercase">Cumulative CGPA</p>
              <p className="mt-1 text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                {academic_record?.cgpa?.toFixed(2) ?? 'N/A'}
              </p>
              <span className="text-[11px] text-slate-400">Contineo Exam Record</span>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-500 uppercase">Active Backlogs</p>
              <p className={`mt-1 text-2xl font-extrabold font-mono ${
                (academic_record?.active_backlogs ?? 0) > 0 ? 'text-rose-500' : 'text-emerald-500'
              }`}>
                {academic_record?.active_backlogs ?? 0}
              </p>
              <span className="text-[11px] text-slate-400">Backlog Clearance Gate</span>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-500 uppercase">Earned Credits</p>
              <p className="mt-1 text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                {academic_record?.total_earned_credits ?? 0}
              </p>
              <span className="text-[11px] text-slate-400">Required: 160 Total</span>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-500 uppercase">Graduation Batch</p>
              <p className="mt-1 text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                {profile.graduation_year ?? 'N/A'}
              </p>
              <span className="text-[11px] text-slate-400">Semester {profile.semester ?? 'N/A'} Standing</span>
            </div>
          </div>

          {/* 4. Contact & Profiles */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/40">
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-sm">
              <GraduationCap className="h-4 w-4 text-purple-500" />
              Contact & Verified Links
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300">
              <div>
                <span>Email: </span>
                <strong className="font-mono text-slate-800 dark:text-slate-200">{profile.email}</strong>
                {profile.phone && (
                  <span className="ml-3">
                    Phone: <strong className="font-mono text-slate-800 dark:text-slate-200">{profile.phone}</strong>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {profile.github_username && (
                  <a
                    href={`https://github.com/${profile.github_username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold hover:underline"
                  >
                    GitHub <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold hover:underline"
                  >
                    LinkedIn <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {profile.portfolio_url && (
                  <a
                    href={profile.portfolio_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold hover:underline"
                  >
                    Portfolio <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </section>

          {/* 5. SKILLS PASSPORT: MENTOR VERIFIED VS SELF-DECLARED */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Candidate Skills Passport
              </h3>
              <span className="text-xs text-slate-400">
                {verifiedSkills.length} Verified • {selfDeclaredSkills.length} Self-Declared
              </span>
            </div>

            {/* Block A: Mentor & Faculty Verified Skills */}
            <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-500/30">
              <div className="flex items-center gap-2 mb-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Mentor & Faculty Verified Skills ({verifiedSkills.length})
                </h4>
              </div>

              {verifiedSkills.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No mentor-verified skills on record.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {verifiedSkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{skill.skill_name}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold ml-1">
                        Verified
                      </span>
                      {skill.evidence_url && (
                        <a
                          href={skill.evidence_url}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-1 text-slate-400 hover:text-emerald-600"
                          title="Inspect Evidence Proof"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Block B: Self-Declared Skills */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-2.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Self-Declared Skills — Pending Mentor Audit ({selfDeclaredSkills.length})
                </h4>
              </div>

              {selfDeclaredSkills.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No self-declared skills listed.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selfDeclaredSkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      <span>{skill.skill_name}</span>
                      <span className="text-[10px] text-slate-400">Self-Declared</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* 6. PROJECTS & EVIDENCE (WITH VERIFICATION STATUS) */}
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-base">
              <FolderGit2 className="h-5 w-5 text-purple-500" />
              <span>Projects & Technical Evidence ({projects.length})</span>
            </h3>

            {projects.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No project submissions recorded.</p>
            ) : (
              <div className="space-y-3">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {proj.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          {proj.description}
                        </p>
                      </div>

                      {/* Project Verification Status Badge */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 border ${
                          proj.status === 'verified'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
                            : proj.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30'
                            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
                        }`}
                      >
                        {proj.status === 'verified' ? 'Faculty Verified' : proj.status === 'rejected' ? 'Needs Revision' : 'Pending Review'}
                      </span>
                    </div>

                    {/* Associated Technologies */}
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {proj.technologies.map((t, tidx) => (
                          <span
                            key={tidx}
                            className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {proj.github_repo_url && (
                      <a
                        href={proj.github_repo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline pt-1"
                      >
                        <span>View GitHub Repository</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 7. CERTIFICATES & CREDENTIALS (WITH VERIFICATION STATUS) */}
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-base">
              <Award className="h-5 w-5 text-purple-500" />
              <span>Certificates & Credentials ({certificates.length})</span>
            </h3>

            {certificates.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No certificates recorded.</p>
            ) : (
              <div className="space-y-2.5">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {cert.title}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            cert.status === 'verified'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
                              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
                          }`}
                        >
                          {cert.status === 'verified' ? 'Verified' : 'Pending Audit'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Issued by: <strong>{cert.issuer_or_organization}</strong>
                        {cert.issue_date && ` • ${cert.issue_date}`}
                      </p>
                    </div>

                    {cert.credential_url && (
                      <a
                        href={cert.credential_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-purple-400 transition-colors self-start sm:self-center"
                      >
                        <Award className="w-3.5 h-3.5 text-purple-500" />
                        <span>Inspect Credential</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 8. RESUME SECTION (FIXED LOADING, ERROR + RETRY, AVAILABLE, NOT UPLOADED) */}
          <section className="rounded-3xl border border-slate-200 dark:border-slate-800 p-5 bg-gradient-to-br from-slate-50 to-purple-50/20 dark:from-slate-950 dark:to-purple-950/20 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 shrink-0">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      Candidate Resume
                    </h3>
                    {resumeStatus === 'available' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                        Student Uploaded
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {resumeStatus === 'loading'
                      ? 'Checking candidate resume in Supabase documents repository...'
                      : resumeStatus === 'available'
                      ? `File: ${resumeData?.fileName || 'Resume.pdf'} (Supabase Storage)`
                      : resumeStatus === 'not_uploaded'
                      ? 'Resume not uploaded by student.'
                      : 'Unable to check resume status.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons based on exact status */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                {resumeStatus === 'loading' ? (
                  <div className="flex items-center gap-2 text-xs text-slate-400 py-2 px-3">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                    <span>Checking storage...</span>
                  </div>
                ) : resumeStatus === 'available' && resumeData ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setViewerOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-400 text-slate-800 dark:text-white text-xs font-semibold shadow-sm transition-all"
                    >
                      <Eye className="w-3.5 h-3.5 text-purple-500" />
                      <span>View Resume</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowAiAnalyzer(true);
                        if (onOpenAiAnalyzer) {
                          onOpenAiAnalyzer(resumeData.viewUrl || resumeData.streamingUrl, resumeData.fileName);
                        }
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Analyze</span>
                    </button>
                  </>
                ) : resumeStatus === 'not_uploaded' ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-medium border border-slate-200 dark:border-slate-700">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Resume not uploaded by student.</span>
                  </div>
                ) : (
                  /* Error State with Retry Button */
                  <button
                    type="button"
                    onClick={fetchResume}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Retry Resume Check</span>
                  </button>
                )}
              </div>
            </div>

            {/* Error Message Box (Only when error occurred, never mistaken as not uploaded) */}
            {resumeStatus === 'error' && resumeError && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{resumeError}</span>
                </div>
                <button
                  type="button"
                  onClick={fetchResume}
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline shrink-0"
                >
                  Retry
                </button>
              </div>
            )}
          </section>

          {/* Footer Close */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-400">
              YojanaSethu Verified Student Skill Passport
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-100 dark:bg-slate-800 px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Close Profile
            </button>
          </div>
        </div>
      </div>

      {/* DEDICATED SCROLLABLE PDF VIEWER MODAL */}
      {viewerOpen && resumeData?.hasResume && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in"
          onClick={() => setViewerOpen(false)}
        >
          <div
            className="flex flex-col w-full max-w-5xl h-[92vh] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Viewer Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{profile.full_name} — Resume</span>
                    <span className="text-[11px] font-mono font-normal text-slate-500">({profile.usn})</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Source: {resumeData.fileName || 'Resume.pdf'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setViewerOpen(false);
                    setShowAiAnalyzer(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Analysis</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewer Body */}
            <div className="flex-1 w-full bg-slate-100 dark:bg-slate-950 relative">
              <iframe
                src={`${resumeData.viewUrl}#toolbar=1&navpanes=0`}
                className="w-full h-full border-0"
                title={`${profile.full_name} Resume PDF Viewer`}
              />
            </div>
          </div>
        </div>
      )}

      {/* AI RESUME ANALYZER SPLIT-SCREEN MODAL */}
      <AiResumeAnalyzerModal
        isOpen={showAiAnalyzer}
        onClose={() => setShowAiAnalyzer(false)}
        student={student}
        drive={drive}
        resumeUrl={resumeData?.viewUrl}
        resumeFileName={resumeData?.fileName}
      />
    </>
  );
}
