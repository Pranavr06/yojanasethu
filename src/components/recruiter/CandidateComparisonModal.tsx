'use client';

import React from 'react';
import {
  X,
  Scale,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Award,
  FolderGit2,
  GraduationCap,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { CandidateEvaluation, PlacementDrive } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  candidates: CandidateEvaluation[];
  drive?: PlacementDrive;
  onShortlistCandidate: (studentId: string) => Promise<void>;
  shortlistedStudentIds: Set<string>;
}

export default function CandidateComparisonModal({
  isOpen,
  onClose,
  candidates,
  drive,
  onShortlistCandidate,
  shortlistedStudentIds,
}: Props) {
  if (!isOpen || candidates.length === 0) return null;

  // Find maximum values for visual highlighting
  const maxCgpa = Math.max(...candidates.map((c) => c.student.academic_record?.cgpa || 0));
  const maxScore = Math.max(...candidates.map((c) => c.match_score));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="comparison-title"
        className="flex flex-col w-full max-w-7xl h-[92vh] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="comparison-title"
                className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2"
              >
                <span>Candidate Side-by-Side Comparison</span>
                <span className="text-xs font-normal text-slate-500">
                  ({candidates.length} candidates selected)
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Placement Target: <strong className="text-slate-700 dark:text-slate-300">{drive?.company_name || 'Campus Drive'}</strong> — {drive?.role_title || 'Engineering Trainee'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Comparison Table Body */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
          <div
            className="grid gap-4 min-w-[720px]"
            style={{
              gridTemplateColumns: `repeat(${candidates.length}, minmax(280px, 1fr))`,
            }}
          >
            {candidates.map((item, idx) => {
              const { student, match_score, is_eligible, skill_breakdown, explanation } = item;
              const { profile, academic_record, skills, evidence_submissions } = student;
              const isShortlisted = shortlistedStudentIds.has(profile.id);

              const verifiedSkills = skills.filter((s) => s.verification_badge);
              const claimedSkills = skills.filter((s) => !s.verification_badge);
              const projects = evidence_submissions.filter((e) => e.type !== 'certificate');
              const certificates = evidence_submissions.filter((e) => e.type === 'certificate');

              const isTopCgpa = (academic_record?.cgpa || 0) === maxCgpa && maxCgpa > 0;
              const isTopScore = match_score === maxScore && maxScore > 0;

              return (
                <div
                  key={profile.id}
                  className={`flex flex-col rounded-2xl border transition-all ${
                    is_eligible
                      ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40'
                      : 'border-rose-200 dark:border-rose-950/40 bg-rose-50/30 dark:bg-rose-950/10'
                  }`}
                >
                  {/* Candidate Header Card */}
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 rounded-t-2xl">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-slate-900 dark:text-white text-base">
                            {profile.full_name}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-slate-500 mt-0.5">
                          {profile.usn} • {profile.department_code}
                        </p>
                      </div>

                      <div
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          is_eligible
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {is_eligible ? 'PASS' : 'FAIL'}
                      </div>
                    </div>

                    {/* Quick Shortlist Button */}
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => onShortlistCandidate(profile.id)}
                        disabled={isShortlisted}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          isShortlisted
                            ? 'bg-emerald-500 text-white cursor-default'
                            : 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm'
                        }`}
                      >
                        {isShortlisted ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Shortlisted</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Shortlist Candidate</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="p-4 space-y-4 text-xs">
                    {/* Scores Comparison */}
                    <div className="grid grid-cols-2 gap-2">
                      <div
                        className={`p-2.5 rounded-xl border text-center ${
                          isTopScore
                            ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-500/40 text-purple-900 dark:text-purple-200'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                          Match Score
                        </span>
                        <span className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400">
                          {match_score}%
                        </span>
                        {isTopScore && (
                          <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 block">
                            ★ Top Match
                          </span>
                        )}
                      </div>

                      <div
                        className={`p-2.5 rounded-xl border text-center ${
                          isTopCgpa
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                          CGPA
                        </span>
                        <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                          {academic_record?.cgpa?.toFixed(2) || 'N/A'}
                        </span>
                        {isTopCgpa && (
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 block">
                            ★ Highest
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Academic Contineo Gate */}
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Active Backlogs:</span>
                        <span
                          className={`font-mono font-bold ${
                            (academic_record?.active_backlogs || 0) > 0
                              ? 'text-rose-500'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {academic_record?.active_backlogs ?? 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Contineo ERP Status:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Batch / Year:</span>
                        <span className="font-semibold">{profile.graduation_year || 2026}</span>
                      </div>
                    </div>

                    {/* Skill Breakdown vs Drive Requirements */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Drive Skills Audit:
                      </span>
                      <div className="space-y-1.5">
                        {skill_breakdown.map((sb, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between"
                          >
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {sb.skill_name}
                            </span>
                            <span
                              className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                sb.status === 'verified'
                                  ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                  : sb.status === 'claimed'
                                  ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                                  : 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300'
                              }`}
                            >
                              {sb.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Verified vs Claimed Skills count */}
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Skill Passport Distribution:
                      </span>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          Faculty Endorsed (+2x):
                        </span>
                        <span className="font-bold font-mono">{verifiedSkills.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          Self-Declared (+1x):
                        </span>
                        <span className="font-bold font-mono">{claimedSkills.length}</span>
                      </div>
                    </div>

                    {/* Projects Comparison */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Verified Projects ({projects.length}):
                      </span>
                      {projects.map((proj) => (
                        <div
                          key={proj.id}
                          className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px]"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[190px]">
                              {proj.title}
                            </span>
                            {proj.github_repo_url && (
                              <a
                                href={proj.github_repo_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-600 hover:text-indigo-500 shrink-0"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 truncate block mt-0.5">
                            {proj.technologies?.join(', ')}
                          </span>
                        </div>
                      ))}
                      {projects.length === 0 && (
                        <p className="text-[11px] text-slate-400 italic">No projects submitted.</p>
                      )}
                    </div>

                    {/* Certifications Comparison */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Certifications ({certificates.length}):
                      </span>
                      {certificates.map((cert) => (
                        <div
                          key={cert.id}
                          className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px]"
                        >
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                            {cert.title}
                          </span>
                          <span className="text-[10px] text-slate-400">{cert.issuer_or_organization}</span>
                        </div>
                      ))}
                      {certificates.length === 0 && (
                        <p className="text-[11px] text-slate-400 italic">No certificates linked.</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs text-slate-500">
          <span>Comparing qualifications against placement drive criteria.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
