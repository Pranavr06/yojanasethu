'use client';

import React from 'react';
import { PlacementAnnouncement, FullStudentProfile } from '@/types';
import { checkAnnouncementEligibility } from '@/lib/rulesEngine';
import {
  X,
  Building2,
  Calendar,
  Briefcase,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  MapPin,
  FileText,
  TrendingUp,
  Award,
  Layers,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  announcement: PlacementAnnouncement | null;
  student: FullStudentProfile | null;
}

export default function AnnouncementDetailModal({
  isOpen,
  onClose,
  announcement,
  student,
}: Props) {
  if (!isOpen || !announcement) return null;

  // Calculate advisory eligibility using actual student profile and actual announcement criteria
  const eligibility = checkAnnouncementEligibility(student, announcement);
  const now = new Date();
  const deadline = new Date(announcement.registration_deadline);
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 3600 * 24));
  const isClosingSoon = diffDays > 0 && diffDays <= 3;
  const isExpired = diffDays <= 0;

  // Student skills lookup
  const studentSkillNames = new Set(
    (student?.skills || []).map((s) => s.skill_name.toLowerCase())
  );
  const verifiedSkillNames = new Set(
    (student?.skills || [])
      .filter((s) => s.verification_badge)
      .map((s) => s.skill_name.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl max-h-[92vh] glass-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 shrink-0 bg-slate-50/70 dark:bg-slate-950/40">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                Official Placement Opportunity
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {announcement.job_type}
              </span>
              {isClosingSoon && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {diffDays === 1 ? 'Closes in 1 day!' : `Closes in ${diffDays} days`}
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white truncate">
                {announcement.role_title}
              </h2>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
              <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {announcement.company_name}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {announcement.employment_details || 'Bengaluru / Hybrid'}
              </span>
              <span>•</span>
              <span className="text-slate-500 font-mono text-[11px]">
                {announcement.official_source_ref || 'TPO Verified'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Close opportunity modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
          {/* Compensation & Advisory Eligibility Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CTC Breakdown Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/60 to-purple-50/40 dark:from-indigo-950/30 dark:to-purple-950/20 border border-indigo-200/80 dark:border-indigo-800/50 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                COMPENSATION PACKAGE (CTC)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-indigo-700 dark:text-indigo-300">
                  {announcement.ctc_lpa.toFixed(1)} LPA
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Total Compensation</span>
              </div>

              {announcement.ctc_breakdown && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-indigo-200/60 dark:border-indigo-800/40 text-[11px]">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Fixed Component:</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">
                      {announcement.ctc_breakdown.fixed_lpa
                        ? `${announcement.ctc_breakdown.fixed_lpa.toFixed(1)} LPA`
                        : 'Disclosed in offer'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Internship Stipend:</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">
                      {announcement.ctc_breakdown.stipend_per_month
                        ? `₹${announcement.ctc_breakdown.stipend_per_month.toLocaleString()}/mo`
                        : 'Full-time Direct'}
                    </strong>
                  </div>
                </div>
              )}
            </div>

            {/* Advisory Eligibility Verdict Card */}
            <div
              className={`p-4 rounded-2xl border transition-all space-y-2 ${
                eligibility.badgeColor === 'emerald'
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/60'
                  : eligibility.badgeColor === 'blue'
                  ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800/60'
                  : eligibility.badgeColor === 'rose'
                  ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/60'
                  : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  YOUR ADVISORY ELIGIBILITY
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                    eligibility.badgeColor === 'emerald'
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                      : eligibility.badgeColor === 'blue'
                      ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300'
                      : eligibility.badgeColor === 'rose'
                      ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300'
                      : 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  {eligibility.decision === 'eligible' && <CheckCircle2 className="w-3 h-3" />}
                  {eligibility.decision === 'ineligible' && <XCircle className="w-3 h-3" />}
                  {eligibility.decision === 'unknown' && <AlertTriangle className="w-3 h-3" />}
                  <span>{eligibility.badgeLabel}</span>
                </span>
              </div>

              {/* Student snapshot */}
              <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 flex-wrap pt-1">
                <span>
                  CGPA: <strong className="font-mono text-slate-900 dark:text-white">{student?.academic_record?.cgpa?.toFixed(2) ?? 'N/A'}</strong>
                </span>
                <span>•</span>
                <span>
                  Backlogs: <strong className="font-mono text-slate-900 dark:text-white">{student?.academic_record?.active_backlogs ?? 0}</strong>
                </span>
                <span>•</span>
                <span>
                  Branch: <strong className="text-slate-900 dark:text-white">{student?.profile?.department_code || 'General'}</strong>
                </span>
                <span>•</span>
                <span>
                  Batch: <strong className="font-mono text-slate-900 dark:text-white">{student?.profile?.graduation_year || 2026}</strong>
                </span>
              </div>

              {/* Failed criteria or explanation */}
              {eligibility.reasons.length > 0 && (
                <div className="text-[11px] text-rose-700 dark:text-rose-300 space-y-1 pt-1 border-t border-rose-200/60 dark:border-rose-900/40">
                  <span className="font-bold block">Advisory Criteria Notes:</span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {eligibility.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {eligibility.missingDataWarnings.length > 0 && (
                <p className="text-[11px] text-amber-700 dark:text-amber-300 pt-1">
                  {eligibility.missingDataWarnings.join(' ')}
                </p>
              )}

              <p className="text-[10px] text-slate-400 dark:text-slate-500 italic pt-1">
                *Advisory calculation based on official Contineo ERP synchronizations. Official criteria set by the employer prevail.
              </p>
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Job Description & Role Responsibilities
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {announcement.job_description}
            </div>
          </div>

          {/* Key Dates Timeline */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Recruitment Schedule & Milestone Dates
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-0.5">Registration Deadline</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono block">
                  {new Date(announcement.registration_deadline).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span className={`text-[10px] font-semibold ${isExpired ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {isExpired ? 'Expired' : `${diffDays} days left`}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-0.5">Pre-Placement Talk (PPT)</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono block">
                  {announcement.ppt_date
                    ? new Date(announcement.ppt_date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })
                    : 'Date TBA'}
                </span>
                <span className="text-[10px] text-slate-500">Interactive Q&A</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-0.5">Online Assessment</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono block">
                  {announcement.assessment_date
                    ? new Date(announcement.assessment_date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })
                    : 'Post-shortlist'}
                </span>
                <span className="text-[10px] text-slate-500">DSA & Aptitude</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-0.5">Interviews</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono block">
                  {announcement.interview_date
                    ? new Date(announcement.interview_date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })
                    : 'To be notified'}
                </span>
                <span className="text-[10px] text-slate-500">Tech & HR Rounds</span>
              </div>
            </div>
          </div>

          {/* Mandatory Eligibility Cutoff Rules */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Mandatory Institutional Cutoffs
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Cutoff CGPA</span>
                <strong className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                  {announcement.min_cgpa.toFixed(2)}
                </strong>
                <span className="text-[10px] text-slate-500 block">Min. in Contineo ERP</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Max Active Backlogs</span>
                <strong className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                  {announcement.max_active_backlogs}
                </strong>
                <span className="text-[10px] text-slate-500 block">
                  {announcement.allow_history_of_backlogs ? 'Past backlogs allowed' : 'Zero backlog history'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Target Batch(es)</span>
                <strong className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                  {announcement.eligible_batches && announcement.eligible_batches.length > 0
                    ? announcement.eligible_batches.join(', ')
                    : '2026'}
                </strong>
                <span className="text-[10px] text-slate-500 block">Graduation year</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block">Eligible Branches</span>
                <strong className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                  {announcement.eligible_branches.join(', ')}
                </strong>
                <span className="text-[10px] text-slate-500 block">NMAMIT Autonomous</span>
              </div>
            </div>
          </div>

          {/* Required Skills & Skill Passport Proof Matching */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Required Skills & Skill Passport Verification
              </h3>
              <Link
                href="/student/skill-passport"
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Upload Proof in Skill Passport</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex flex-wrap gap-2">
                {announcement.required_skills && announcement.required_skills.length > 0 ? (
                  announcement.required_skills.map((skill, idx) => {
                    const skillLower = skill.name.toLowerCase();
                    const isVerified = verifiedSkillNames.has(skillLower);
                    const isClaimed = studentSkillNames.has(skillLower);

                    return (
                      <div
                        key={idx}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                          isVerified
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold'
                            : isClaimed
                            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {isVerified ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : isClaimed ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        )}
                        <span>{skill.name}</span>
                        <span className="text-[10px] opacity-75 font-normal">
                          ({skill.importance})
                        </span>
                        {isVerified && (
                          <span className="text-[9px] uppercase px-1 rounded bg-emerald-200/60 dark:bg-emerald-900/60 font-bold">
                            Verified
                          </span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-400 text-xs">No specific skill list declared by company.</p>
                )}
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Skills with the <strong className="text-emerald-600 dark:text-emerald-400">Verified</strong> badge receive higher ranking when evaluated by recruiters via the YojanaSethu Proof-Based Recruitment Engine.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <span>Authorized by {announcement.author_name}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 font-semibold text-xs transition-colors"
            >
              Close
            </button>

            {announcement.application_link && !isExpired && (
              <a
                href={announcement.application_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.02]"
              >
                <span>Apply on Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
