'use client';

import React, { useState, useMemo } from 'react';
import { CandidateEvaluation, PlacementDrive } from '@/types';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  UserPlus,
  Check,
  Eye,
  FileText,
  HelpCircle,
  Scale,
} from 'lucide-react';
import StudentProfileModal from '@/components/recruiter/StudentProfileModal';

interface Props {
  candidate: CandidateEvaluation;
  rank: number;
  drive?: PlacementDrive;
  isSelected?: boolean;
  onToggleSelect?: (candidateId: string) => void;
  isShortlisted?: boolean;
  shortlistStage?: string;
  onShortlist?: (studentId: string) => void;
  onUpdateStage?: (studentId: string, newStage: string) => void;
  onOpenNotes?: (studentId: string, studentName: string) => void;
}

export default function CandidateCard({
  candidate,
  rank,
  drive,
  isSelected = false,
  onToggleSelect,
  isShortlisted = false,
  shortlistStage = 'shortlisted',
  onShortlist,
  onUpdateStage,
  onOpenNotes,
}: Props) {
  const { student, match_score, is_eligible, skill_breakdown, explanation } = candidate;
  const [showProfile, setShowProfile] = useState(false);

  // Resume presence check from student evidence submissions
  const hasResume = useMemo(() => {
    return student.evidence_submissions?.some((e) =>
      (e.document_storage_path && e.document_storage_path.toLowerCase().includes('resume')) ||
      (e.credential_url && e.credential_url.toLowerCase().includes('resume')) ||
      (e.title && e.title.toLowerCase().includes('resume')) ||
      e.type === ('resume' as any)
    );
  }, [student.evidence_submissions]);

  // Verified, claimed and missing skills counts
  const verifiedCount = useMemo(
    () => skill_breakdown.filter((s) => s.status === 'verified').length,
    [skill_breakdown]
  );
  const claimedCount = useMemo(
    () => skill_breakdown.filter((s) => s.status === 'claimed').length,
    [skill_breakdown]
  );
  const missingCount = useMemo(
    () => skill_breakdown.filter((s) => s.status === 'missing').length,
    [skill_breakdown]
  );

  return (
    <>
      <div
        className={`p-5 rounded-2xl glass-card transition-all ${
          isSelected
            ? 'border-purple-500/80 bg-purple-50/25 dark:bg-purple-950/25 ring-2 ring-purple-500/40 shadow-md'
            : is_eligible
            ? 'border-slate-200 dark:border-slate-800/80 hover:border-purple-500/40 bg-white dark:bg-slate-900/60'
            : 'border-rose-200 dark:border-rose-950/40 bg-rose-50/40 dark:bg-rose-950/10 opacity-85'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Checkbox + Rank + Student Information */}
          <div className="flex items-start gap-3">
            {/* Selection Checkbox for multi-candidate comparison & batch shortlisting */}
            {onToggleSelect && (
              <label
                className="mt-1.5 flex items-center justify-center cursor-pointer select-none"
                title="Select candidate for comparison or batch shortlist"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect(student.profile.id)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
              </label>
            )}

            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                rank === 1 && is_eligible
                  ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 shadow-sm'
                  : rank === 2 && is_eligible
                  ? 'bg-slate-200 dark:bg-slate-400/20 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-400/40'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              #{rank}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowProfile(true)}
                  className="text-sm font-bold text-slate-900 hover:text-purple-600 hover:underline dark:text-white dark:hover:text-purple-400 text-left"
                >
                  {student.profile.full_name}
                </button>

                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {student.profile.usn}
                </span>

                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                  {student.profile.department_code} • Sem {student.profile.semester}
                </span>

                {/* Contineo Verified Academic Badge */}
                {student.academic_record?.is_verified_by_exam_cell && (
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-medium bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                    <ShieldCheck className="w-3 h-3" /> Contineo Verified
                  </span>
                )}

                {/* Resume Availability Badge */}
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                    hasResume
                      ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                  title={hasResume ? 'Candidate uploaded resume available' : 'No resume uploaded by student'}
                >
                  <FileText className="w-3 h-3" />
                  <span>{hasResume ? 'Resume on File' : 'No Resume'}</span>
                </span>
              </div>

              {student.academic_record ? (
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                  <span>
                    CGPA:{' '}
                    <strong className="text-slate-900 dark:text-white font-mono">
                      {student.academic_record.cgpa.toFixed(2)}
                    </strong>
                  </span>

                  <span>
                    Backlogs:{' '}
                    <strong
                      className={
                        student.academic_record.active_backlogs > 0
                          ? 'text-rose-600 dark:text-rose-400 font-mono'
                          : 'text-emerald-600 dark:text-emerald-400 font-mono'
                      }
                    >
                      {student.academic_record.active_backlogs}
                    </strong>
                  </span>

                  <span>
                    Earned Credits:{' '}
                    <strong className="text-slate-700 dark:text-slate-300 font-mono">
                      {student.academic_record.total_earned_credits}
                    </strong>
                  </span>

                  <span>
                    Verified Skills:{' '}
                    <strong className="text-purple-600 dark:text-purple-400 font-mono">
                      {student.skills.filter((s) => s.verification_badge).length} of {student.skills.length}
                    </strong>
                  </span>
                </div>
              ) : (
                <div className="text-xs text-slate-400 mt-1 italic">
                  No Contineo academic record linked
                </div>
              )}
            </div>
          </div>

          {/* Right: Actions + Match Score + Academic Cutoff Gate */}
          <div className="flex items-center gap-4 self-end md:self-center shrink-0 flex-wrap justify-end">
            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowProfile(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                title="View full student profile and resume"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Profile</span>
              </button>

              {onShortlist && (
                isShortlisted ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                    <Check className="w-3.5 h-3.5" />
                    <span className="capitalize">{shortlistStage.replace(/_/g, ' ')}</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onShortlist(student.profile.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-sm transition-all"
                    title="Add candidate to shortlist pipeline"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Shortlist</span>
                  </button>
                )
              )}
            </div>

            {/* Evidence Match Percentage & Breakdown */}
            <div className="text-right border-l border-slate-100 dark:border-slate-800 pl-3">
              <div className="flex items-center justify-end gap-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                  Evidence Match
                </span>
                <span
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-help"
                  title="Evidence Match measures supporting proof against drive skills. Mentor-verified skills get 2x weight (+2 pts); self-declared claims get 1x weight (+1 pt). This is independent of the Contineo ERP Cutoff Gate."
                >
                  <HelpCircle className="w-3 h-3" />
                </span>
              </div>

              <div className="flex items-baseline gap-1 justify-end">
                <span
                  className={`text-2xl font-bold font-mono ${
                    match_score >= 80
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : match_score >= 50
                      ? 'text-sky-600 dark:text-sky-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {match_score}%
                </span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-mono">
                {verifiedCount}V • {claimedCount}D • {missingCount}M
              </span>
            </div>

            {/* Academic Cutoff Gate Badge (PASS/FAIL) */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-0.5 tracking-wider">
                ERP Gate
              </span>
              <div
                className={`w-14 h-11 rounded-2xl flex items-center justify-center font-bold text-xs border ${
                  is_eligible
                    ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                    : 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30'
                }`}
                title={is_eligible ? 'Candidate passes CGPA, backlogs & branch cutoff' : explanation}
              >
                {is_eligible ? 'PASS' : 'FAIL'}
              </div>
            </div>
          </div>
        </div>

        {/* Skill Breakdown */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Required Skill Verification Audit:
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              Verified (+2 pts) &gt; Declared (+1 pt) &gt; Missing (0 pts)
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {skill_breakdown.map((sb, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                  sb.status === 'verified'
                    ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                    : sb.status === 'claimed'
                    ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800'
                }`}
              >
                {sb.status === 'verified' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : sb.status === 'claimed' ? (
                  <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600" />
                )}

                <span>{sb.skill_name}</span>

                {sb.status === 'verified' && (
                  <span className="text-[9px] uppercase font-bold text-emerald-600 dark:text-emerald-400 ml-1">
                    Verified
                  </span>
                )}

                {sb.status === 'claimed' && (
                  <span className="text-[9px] text-amber-600 dark:text-amber-400 ml-1">
                    Self-Declared
                  </span>
                )}

                {sb.evidence_url && (
                  <a
                    href={sb.evidence_url}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    title="Inspect Proof Repository"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Decision Rationale */}
        <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 text-xs flex items-start gap-1.5">
          <span className="font-semibold text-slate-500 dark:text-slate-400 shrink-0">
            Cutoff Decision:
          </span>

          <span
            className={
              is_eligible
                ? 'text-slate-700 dark:text-slate-300'
                : 'text-rose-600 dark:text-rose-400 font-medium'
            }
          >
            {explanation}
          </span>
        </div>
      </div>

      {/* Student profile modal — opens inside the dashboard */}
      {showProfile && (
        <StudentProfileModal
          student={student}
          onClose={() => setShowProfile(false)}
          drive={drive}
          isShortlisted={isShortlisted}
          shortlistStage={shortlistStage}
          onShortlist={onShortlist}
          onUpdateStage={onUpdateStage}
          onOpenNotes={onOpenNotes}
          isSelectedForCompare={isSelected}
          onToggleCompare={onToggleSelect}
        />
      )}
    </>
  );
}
