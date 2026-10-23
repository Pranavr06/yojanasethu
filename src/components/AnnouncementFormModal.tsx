'use client';

import React, { useState, useEffect } from 'react';
import { PlacementAnnouncement, JobType, AnnouncementStatus } from '@/types';
import {
  X,
  Briefcase,
  Building2,
  Calendar,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  announcementToEdit?: PlacementAnnouncement | null;
}

const ALL_BRANCHES = [
  'ISE', 'CSE', 'AIML', 'AIDS', 'CSCY', 'CSFSD', 'CCE', 'ECE', 'EEE', 'MECH', 'CIV', 'BT', 'RAI', 'VLSI', 'ACT',
];

const ALL_BATCHES = [2025, 2026, 2027, 2028];

export default function AnnouncementFormModal({
  isOpen,
  onClose,
  onSaved,
  announcementToEdit,
}: Props) {
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobType, setJobType] = useState<JobType>('Full-time');
  const [employmentDetails, setEmploymentDetails] = useState('Bengaluru / Hybrid');
  const [ctcLpa, setCtcLpa] = useState('12.0');
  const [fixedLpa, setFixedLpa] = useState('10.0');
  const [variableLpa, setVariableLpa] = useState('2.0');
  const [stipendPerMonth, setStipendPerMonth] = useState('40000');
  const [minCgpa, setMinCgpa] = useState('7.0');
  const [maxBacklogs, setMaxBacklogs] = useState('0');
  const [allowHistoryBacklogs, setAllowHistoryBacklogs] = useState(true);
  const [eligibleBranches, setEligibleBranches] = useState<string[]>(['ISE', 'CSE', 'AIML']);
  const [eligibleBatches, setEligibleBatches] = useState<number[]>([2026]);
  const [skills, setSkills] = useState<{ name: string; importance: 'mandatory' | 'preferred'; weight?: number }[]>([

    { name: 'Python', importance: 'mandatory', weight: 3 },
    { name: 'Data Structures & Algorithms', importance: 'mandatory', weight: 3 },
  ]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillImportance, setNewSkillImportance] = useState<'mandatory' | 'preferred'>('mandatory');

  // Dates
  const [registrationOpenDate, setRegistrationOpenDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [registrationDeadline, setRegistrationDeadline] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [pptDate, setPptDate] = useState('');
  const [assessmentDate, setAssessmentDate] = useState('');
  const [interviewDate, setInterviewDate] = useState('');

  // Links & Meta
  const [applicationLink, setApplicationLink] = useState('');
  const [officialSourceRef, setOfficialSourceRef] = useState('TPO Circular Ref #2026-NMAM-088');
  const [status, setStatus] = useState<AnnouncementStatus>('published');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (announcementToEdit) {
      setCompanyName(announcementToEdit.company_name);
      setRoleTitle(announcementToEdit.role_title);
      setJobDescription(announcementToEdit.job_description);
      setJobType(announcementToEdit.job_type || 'Full-time');
      setEmploymentDetails(announcementToEdit.employment_details || 'Bengaluru / Hybrid');
      setCtcLpa(String(announcementToEdit.ctc_lpa));
      setFixedLpa(String(announcementToEdit.ctc_breakdown?.fixed_lpa ?? ''));
      setVariableLpa(String(announcementToEdit.ctc_breakdown?.variable_lpa ?? ''));
      setStipendPerMonth(String(announcementToEdit.ctc_breakdown?.stipend_per_month ?? ''));
      setMinCgpa(String(announcementToEdit.min_cgpa));
      setMaxBacklogs(String(announcementToEdit.max_active_backlogs));
      setAllowHistoryBacklogs(announcementToEdit.allow_history_of_backlogs);
      setEligibleBranches(announcementToEdit.eligible_branches || ['ISE', 'CSE']);
      setEligibleBatches(announcementToEdit.eligible_batches || [2026]);
      setSkills((announcementToEdit.required_skills || []).map(s => ({ ...s, weight: s.weight ?? (s.importance === 'mandatory' ? 3 : 2) })));
      setRegistrationOpenDate(
        announcementToEdit.registration_open_date
          ? announcementToEdit.registration_open_date.split('T')[0]
          : ''
      );
      setRegistrationDeadline(
        announcementToEdit.registration_deadline
          ? announcementToEdit.registration_deadline.split('T')[0]
          : ''
      );
      setPptDate(announcementToEdit.ppt_date ? announcementToEdit.ppt_date.split('T')[0] : '');
      setAssessmentDate(
        announcementToEdit.assessment_date ? announcementToEdit.assessment_date.split('T')[0] : ''
      );
      setInterviewDate(
        announcementToEdit.interview_date ? announcementToEdit.interview_date.split('T')[0] : ''
      );
      setApplicationLink(announcementToEdit.application_link || '');
      setOfficialSourceRef(announcementToEdit.official_source_ref || '');
      setStatus(announcementToEdit.status || 'published');
    } else {
      // Default reset
      setCompanyName('');
      setRoleTitle('');
      setJobDescription('');
      setCtcLpa('12.0');
    }
  }, [announcementToEdit, isOpen]);

  if (!isOpen) return null;

  const toggleBranch = (code: string) => {
    setEligibleBranches((prev) =>
      prev.includes(code) ? prev.filter((b) => b !== code) : [...prev, code]
    );
  };

  const toggleBatch = (batchYear: number) => {
    setEligibleBatches((prev) =>
      prev.includes(batchYear) ? prev.filter((b) => b !== batchYear) : [...prev, batchYear]
    );
  };

  const addSkill = () => {
    if (!newSkillName.trim()) return;
    setSkills((prev) => [
      ...prev,
      { name: newSkillName.trim(), importance: newSkillImportance, weight: newSkillImportance === 'mandatory' ? 3 : 2 },
    ]);
    setNewSkillName('');
  };

  const removeSkill = (index: number) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!companyName.trim() || !roleTitle.trim() || !jobDescription.trim()) {
      setError('Company name, role title, and job description are required.');
      return;
    }

    const ctcNum = parseFloat(ctcLpa);
    if (isNaN(ctcNum) || ctcNum < 0) {
      setError('Please provide a valid numeric CTC package (in LPA).');
      return;
    }

    if (!registrationDeadline) {
      setError('Registration deadline is required.');
      return;
    }

    if (registrationOpenDate && registrationDeadline && registrationOpenDate > registrationDeadline) {
      setError('Registration open date cannot be after registration deadline.');
      return;
    }

    if (applicationLink.trim() && !applicationLink.startsWith('http://') && !applicationLink.startsWith('https://')) {
      setError('Application link must be a valid URL starting with http:// or https://');
      return;
    }

    if (eligibleBranches.length === 0) {
      setError('Please select at least one eligible branch/department.');
      return;
    }

    if (eligibleBatches.length === 0) {
      setError('Please select at least one eligible graduation batch.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: announcementToEdit?.id,
        company_name: companyName.trim(),
        role_title: roleTitle.trim(),
        job_description: jobDescription.trim(),
        job_type: jobType,
        employment_details: employmentDetails.trim(),
        ctc_lpa: ctcNum,
        ctc_breakdown: {
          fixed_lpa: fixedLpa ? parseFloat(fixedLpa) : undefined,
          variable_lpa: variableLpa ? parseFloat(variableLpa) : undefined,
          stipend_per_month: stipendPerMonth ? parseFloat(stipendPerMonth) : undefined,
          currency: 'INR',
        },
        eligible_branches: eligibleBranches,
        eligible_batches: eligibleBatches,
        min_cgpa: parseFloat(minCgpa) || 0,
        max_active_backlogs: parseInt(maxBacklogs, 10) || 0,
        allow_history_of_backlogs: allowHistoryBacklogs,
        required_skills: skills,
        registration_open_date: registrationOpenDate ? new Date(registrationOpenDate).toISOString() : null,
        registration_deadline: new Date(registrationDeadline).toISOString(),
        ppt_date: pptDate ? new Date(pptDate).toISOString() : null,
        assessment_date: assessmentDate ? new Date(assessmentDate).toISOString() : null,
        interview_date: interviewDate ? new Date(interviewDate).toISOString() : null,
        application_link: applicationLink.trim() || null,
        official_source_ref: officialSourceRef.trim() || null,
        status,
        author_name: 'Training & Placement Cell, NMAMIT',
      };

      const method = announcementToEdit ? 'PATCH' : 'POST';
      const res = await fetch('/api/placement/announcements', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save announcement');
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl max-h-[92vh] glass-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {announcementToEdit ? 'Edit Placement Announcement' : 'Publish New Placement Announcement'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Authorized TPO Announcement Desk • Synchronizes across all student dashboards
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="m-4 mb-0 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Section 1: Basic Company & Role Info */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              1. Recruiter & Position Overview
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cisco Systems, Google, Nexus AI"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Role Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Associate Software Engineer, AI Intern"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Job Type *
                </label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value as JobType)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="Full-time">Full-time (FTE)</option>
                  <option value="Internship">Internship Only</option>
                  <option value="Internship + Full-time">Internship + Full-time (PPO)</option>
                  <option value="Contract">Contract / Apprenticeship</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Work Location & Shift Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru (Hybrid), Mangaluru, Remote"
                  value={employmentDetails}
                  onChange={(e) => setEmploymentDetails(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Job Description & Role Requirements *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Explain the job scope, technical expectations, and selection process..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Section 2: Compensation Package Details */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              2. Compensation Package (CTC Breakdown)
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Total CTC (LPA) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={ctcLpa}
                  onChange={(e) => setCtcLpa(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Fixed CTC (LPA)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={fixedLpa}
                  onChange={(e) => setFixedLpa(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Variable (LPA)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={variableLpa}
                  onChange={(e) => setVariableLpa(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Stipend (₹/Month)
                </label>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  value={stipendPerMonth}
                  onChange={(e) => setStipendPerMonth(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Eligibility & Cutoffs */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              3. Contineo ERP Cutoffs & Batch Restrictions
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Min CGPA Cutoff *
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="10"
                  required
                  value={minCgpa}
                  onChange={(e) => setMinCgpa(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Max Active Backlogs Allowed
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={maxBacklogs}
                  onChange={(e) => setMaxBacklogs(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="allowHistory"
                  checked={allowHistoryBacklogs}
                  onChange={(e) => setAllowHistoryBacklogs(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="allowHistory" className="text-slate-700 dark:text-slate-300 font-medium">
                  Allow Past Backlog History (if currently cleared)
                </label>
              </div>
            </div>

            {/* Target Batches */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
                Eligible Graduation Batches (Students of other batches can view for early preparation)
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_BATCHES.map((b) => (
                  <button
                    type="button"
                    key={b}
                    onClick={() => toggleBatch(b)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      eligibleBatches.includes(b)
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Batch {b} {b > 2026 ? '(Junior)' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Branches */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
                Eligible Departments / Branches
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_BRANCHES.map((code) => (
                  <button
                    type="button"
                    key={code}
                    onClick={() => toggleBranch(code)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      eligibleBranches.includes(code)
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Skills Checklist */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              4. Required Technical Skills (Matched against Verifiable Skill Passport)
            </h4>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Skill name (e.g. PyTorch, React.js, SQL, System Design)"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500"
              />
              <select
                value={newSkillImportance}
                onChange={(e) => setNewSkillImportance(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="mandatory">Mandatory</option>
                <option value="preferred">Preferred</option>
              </select>
              <button
                type="button"
                onClick={addSkill}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold flex items-center gap-1 hover:bg-indigo-500"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Skill</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map((s, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium"
                >
                  <span>{s.name}</span>
                  <span className="text-[10px] text-slate-400 uppercase">({s.importance})</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(idx)}
                    className="text-slate-400 hover:text-rose-500 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Section 5: Schedule & Key Dates */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              5. Key Dates & Recruitment Milestone Timeline
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Registration Opening Date
                </label>
                <input
                  type="date"
                  value={registrationOpenDate}
                  onChange={(e) => setRegistrationOpenDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Registration Deadline Date *
                </label>
                <input
                  type="date"
                  required
                  value={registrationDeadline}
                  onChange={(e) => setRegistrationDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Pre-Placement Talk (PPT) Date
                </label>
                <input
                  type="date"
                  value={pptDate}
                  onChange={(e) => setPptDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Online Assessment Date
                </label>
                <input
                  type="date"
                  value={assessmentDate}
                  onChange={(e) => setAssessmentDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Interviews Date
                </label>
                <input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Links & Publishing Status */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              6. Application Link & Publication Status
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  External Application Link (URL)
                </label>
                <input
                  type="url"
                  placeholder="https://careers.company.com/apply/..."
                  value={applicationLink}
                  onChange={(e) => setApplicationLink(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Official Circular Reference / ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. TPO Circular Ref #2026-NMAM-088"
                  value={officialSourceRef}
                  onChange={(e) => setOfficialSourceRef(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                Publication Status *
              </label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="pubStatus"
                    value="published"
                    checked={status === 'published'}
                    onChange={() => setStatus('published')}
                    className="text-indigo-600"
                  />
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Published (Visible across all student dashboards)
                  </span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="pubStatus"
                    value="draft"
                    checked={status === 'draft'}
                    onChange={() => setStatus('draft')}
                    className="text-indigo-600"
                  />
                  <span className="font-semibold text-slate-500">
                    Draft (TPO Private Only)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold shadow-md shadow-indigo-600/25 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Announcement...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{announcementToEdit ? 'Update Announcement' : 'Publish Announcement'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
