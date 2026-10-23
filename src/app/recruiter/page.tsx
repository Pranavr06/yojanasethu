'use client';

import React, { useEffect, useState, useMemo } from 'react';
import CandidateCard from '@/components/CandidateCard';

import { PlacementDrive, CandidateEvaluation } from '@/types';
import {
  Briefcase,
  CheckCircle2,
  XCircle,
  Users,
  RefreshCw,
  Search,
  Sparkles,
  ShieldCheck,
  Tag,
  X,
} from 'lucide-react';

export default function RecruiterPage() {
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState<string>('');
  const [eligibleCandidates, setEligibleCandidates] = useState<CandidateEvaluation[]>([]);
  const [ineligibleCandidates, setIneligibleCandidates] = useState<CandidateEvaluation[]>([]);
  const [activeTab, setActiveTab] = useState<'eligible' | 'ineligible'>('eligible');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const POPULAR_SKILLS = [
    'Python',
    'AWS',
    'React',
    'Machine Learning',
    'Data Structures',
    'PostgreSQL',
    'Docker',
    'Java',
    'Next.js',
    'TypeScript',
    'Cloud Architecture',
    'DSA',
  ];

  const activeSearchTerms = useMemo(() => {
    const terms = searchQuery
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    return Array.from(new Set([...terms, ...selectedSkills]));
  }, [searchQuery, selectedSkills]);
  

  // 1. Fetch Drives
  useEffect(() => {
    async function loadDrives() {
      try {
        const res = await fetch('/api/recruiter/jobs');
        const data = await res.json();
        if (data.drives && data.drives.length > 0) {
          setDrives(data.drives);
          setSelectedDriveId(data.drives[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadDrives();
  }, []);

  // 2. Fetch Candidates when drive changes
  const fetchCandidates = async (driveId: string) => {
    if (!driveId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/recruiter/candidates?driveId=${driveId}`);
      const data = await res.json();
      if (data.eligible_candidates) {
        setEligibleCandidates(data.eligible_candidates);
        setIneligibleCandidates(data.ineligible_candidates || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDriveId) {
      fetchCandidates(selectedDriveId);
    }
  }, [selectedDriveId]);

  const currentDrive = drives.find((d) => d.id === selectedDriveId) || drives[0];
  const filterCandidates = (candidates: CandidateEvaluation[]) => {
    let list = candidates;

    // 1. Skill chips filter: Candidate must match all selected skill chips
    if (selectedSkills.length > 0) {
      list = list.filter((candidate) => {
        const studentSkills = (candidate.student.skills || []).map((s) => s.skill_name.toLowerCase());
        const breakdownSkills = (candidate.skill_breakdown || []).map((sb) => sb.skill_name.toLowerCase());
        const evidenceSkills = (candidate.student.evidence_submissions || []).flatMap((sub) => [
          ...(sub.associated_skills || []),
          ...(sub.technologies || []),
          sub.title || '',
        ]).map((s) => s.toLowerCase());

        const allSkills = [...studentSkills, ...breakdownSkills, ...evidenceSkills];

        return selectedSkills.every((sel) =>
          allSkills.some((s) => s.includes(sel.toLowerCase()))
        );
      });
    }

    // 2. Verified skills only filter
    if (verifiedOnly) {
      list = list.filter((candidate) => {
        const hasVerifiedPassportSkill = (candidate.student.skills || []).some(
          (s) => s.verification_badge || s.tier === 'faculty_verified' || s.tier === 'expert'
        );
        const hasVerifiedBreakdown = (candidate.skill_breakdown || []).some(
          (sb) => sb.status === 'verified'
        );
        return hasVerifiedPassportSkill || hasVerifiedBreakdown;
      });
    }

    // 3. Keyword search across skills, name, USN, branch, target role, and project evidence
    const query = searchQuery.trim().toLowerCase();
    if (!query) return list;

    const keywords = query
      .split(/[\s,]+/)
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    return list.filter((candidate) => {
      const name = (candidate.student.profile.full_name || '').toLowerCase();
      const usn = (candidate.student.profile.usn || '').toLowerCase();
      const branch = (candidate.student.profile.department_code || '').toLowerCase();
      const targetRole = (candidate.student.target_role || '').toLowerCase();

      const studentSkills = (candidate.student.skills || []).map((s) => ({
        name: s.skill_name.toLowerCase(),
        category: (s.category || '').toLowerCase(),
      }));

      const breakdownSkills = (candidate.skill_breakdown || []).map((sb) => sb.skill_name.toLowerCase());

      const evidenceTexts = (candidate.student.evidence_submissions || []).flatMap((sub) => [
        ...(sub.associated_skills || []),
        ...(sub.technologies || []),
        sub.title || '',
        sub.description || '',
      ]).map((t) => t.toLowerCase());

      return keywords.every((kw) => {
        return (
          name.includes(kw) ||
          usn.includes(kw) ||
          branch.includes(kw) ||
          targetRole.includes(kw) ||
          studentSkills.some((s) => s.name.includes(kw) || s.category.includes(kw)) ||
          breakdownSkills.some((bs) => bs.includes(kw)) ||
          evidenceTexts.some((et) => et.includes(kw))
        );
      });
    });
  };

const filteredEligibleCandidates = filterCandidates(eligibleCandidates);
const filteredIneligibleCandidates = filterCandidates(ineligibleCandidates);

  return (
    <div className="space-y-6">
      {/* 1. Recruiter Hero Banner (Matching reference image UDP 22 style) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1B4B] via-[#0F172A] to-[#1E1B4B] border border-purple-500/30 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
              <Briefcase className="w-3.5 h-3.5" />
              <span>RECRUITER INTELLIGENCE DESK</span>
              <span>•</span>
              <span>{currentDrive ? `${currentDrive.company_name} • Campus Drive` : 'NMAMIT Placement Desk'}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Evidence-Ranked Talent Pipeline
            </h1>

            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Automated Contineo ERP eligibility screening (CGPA, backlogs, branch) combined with faculty-endorsed GitHub repositories and certificate audits.
            </p>
          </div>

          <button
            onClick={() => fetchCandidates(selectedDriveId)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all backdrop-blur-md self-start md:self-center shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Candidates</span>
          </button>
        </div>
      </div>

      {/* 2. Side-by-Side Metric Cards (Matching reference picture COMMUTERS & BOARDING STOPS) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-purple-400 dark:hover:border-slate-700">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
            ACTIVE ROLE
          </span>
          <div className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white truncate">
            {currentDrive ? currentDrive.role_title : 'AI/ML Intern'}
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
            {currentDrive ? `${currentDrive.ctc_lpa} LPA Package` : '14.5 LPA'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-purple-400 dark:hover:border-slate-700">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
            QUALIFIED TALENT
          </span>
          <div className="text-2xl md:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {eligibleCandidates.length} <span className="text-xs font-normal text-slate-400">Students</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
            Passed CGPA & Cutoff Gate
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-purple-400 dark:hover:border-slate-700">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
            DISQUALIFIED
          </span>
          <div className="text-2xl md:text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {ineligibleCandidates.length} <span className="text-xs font-normal text-slate-400">Filtered</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
            Below Cutoff or Backlogs
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-purple-400 dark:hover:border-slate-700">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
            PROOF MULTIPLIER
          </span>
          <div className="text-2xl md:text-3xl font-extrabold text-purple-600 dark:text-purple-400">
            2.0x <span className="text-xs font-normal text-slate-400">Weight</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
            Evidenced Proof Priority
          </span>
        </div>
      </div>

      {/* 3. Drive Selector & Hard Eligibility Rules Bar */}
      <div id="placement-drives" className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
              Active Placement Drive:
            </label>
            <select
              value={selectedDriveId}
              onChange={(e) => setSelectedDriveId(e.target.value)}
              disabled={drives.length === 0}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 w-full max-w-md"
            >
              {drives.length === 0 ? (
                <option value="">No Placement Drives Available in Database</option>
              ) : (
                drives.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.company_name} — {d.role_title} ({d.ctc_lpa} LPA)
                  </option>
                ))
              )}
            </select>
          </div>

          {currentDrive && (
            <div id="cutoff-filter" className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 flex-wrap">
              <span>
                Min CGPA: <strong className="text-slate-900 dark:text-white font-mono">{currentDrive.min_cgpa.toFixed(2)}</strong>
              </span>
              <span>•</span>
              <span>
                Branches: <strong className="text-slate-900 dark:text-white">{currentDrive.eligible_branches.join(', ')}</strong>
              </span>
              <span>•</span>
              <span>
                Max Backlogs: <strong className="text-slate-900 dark:text-white font-mono">{currentDrive.max_active_backlogs}</strong>
              </span>
              <span>•</span>
              <span>
                Batch: <strong className="text-slate-900 dark:text-white font-mono">{currentDrive.batch_year}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      
{/* Enhanced Keyword & Skill Candidate Search */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Keyword & Skill Talent Discovery</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Search by student skills (e.g., Python, AWS, React), project evidence, branch, or USN.
            </p>
          </div>

          {/* Verified Skills Only Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-purple-400 transition-colors self-start sm:self-center">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5 cursor-pointer"
            />
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Verified Skills Only</span>
          </label>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            id="recruiter-candidate-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords: 'Python, AWS', 'Machine Learning', 'React', 'DSA', student name, or USN..."
            className="w-full pl-11 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-purple-500 focus:bg-white dark:focus:bg-slate-950 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Skill Filter Pills */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-semibold flex items-center gap-1">
              <Tag className="w-3 h-3 text-purple-500" />
              <span>Filter by In-Demand Student Skills:</span>
            </span>

            {(selectedSkills.length > 0 || searchQuery || verifiedOnly) && (
              <button
                onClick={() => {
                  setSelectedSkills([]);
                  setSearchQuery('');
                  setVerifiedOnly(false);
                }}
                className="text-purple-600 dark:text-purple-400 font-bold hover:underline"
              >
                Clear All Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {POPULAR_SKILLS.map((skill) => {
              const isSelected = selectedSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => {
                    setSelectedSkills((prev) =>
                      isSelected ? prev.filter((s) => s !== skill) : [...prev, skill]
                    );
                  }}
                  className={`text-[11px] font-bold px-3 py-1 rounded-xl transition-all flex items-center gap-1 border ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-500/20'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Sparkles className={`w-2.5 h-2.5 ${isSelected ? 'text-amber-300' : 'text-purple-400'}`} />
                  <span>{skill}</span>
                  {isSelected && <X className="w-3 h-3 ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Search Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span>
            Showing <strong className="text-slate-900 dark:text-white font-mono">{activeTab === 'eligible' ? filteredEligibleCandidates.length : filteredIneligibleCandidates.length}</strong> candidates
            {activeSearchTerms.length > 0 && (
              <span> matching keywords: <span className="font-semibold text-purple-600 dark:text-purple-400">{activeSearchTerms.join(', ')}</span></span>
            )}
            {verifiedOnly && <span className="text-emerald-600 font-semibold"> • Verified Only</span>}
          </span>
          <span className="text-[11px] text-slate-400">
            Skills indexed from Student Skill Passports & Code Evidence
          </span>
        </div>
      </div>


      {/* 4. Candidate Rankings Tabs: Eligible vs Ineligible */}
      <div id="candidate-rankings" className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('eligible')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'eligible'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Eligible Candidates ({filteredEligibleCandidates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ineligible')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'ineligible'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>Disqualified by Rules ({filteredIneligibleCandidates.length})</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
          Scoring Rule: Evidenced (+2 pts) &gt; Self-Declared (+1 pt)
        </span>
      </div>

      {/* 3. Candidate Cards List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Evaluating student skill passports against drive criteria...</p>
        </div>
      ) : drives.length === 0 ? (
        <div className="py-16 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No recruitment drives found in database.</p>
        </div>
      ) : activeTab === 'eligible' ? (
        
          filteredEligibleCandidates.length === 0 ? (
          <div className="py-16 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No candidates currently meet all hard criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEligibleCandidates.map((candidate, idx) => (
              <CandidateCard key={candidate.student.profile.id} candidate={candidate} rank={idx + 1} searchKeywords={activeSearchTerms} />
            ))}
          </div>
        )
      ) : (
        <div className="space-y-4">
          {filteredIneligibleCandidates.map((candidate, idx) => (
            <CandidateCard key={candidate.student.profile.id} candidate={candidate} rank={idx + 1} searchKeywords={activeSearchTerms} />
          ))}
        </div>
      )}
    </div>
  );
}
