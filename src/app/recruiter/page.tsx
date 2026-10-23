'use client';

import React, { useEffect, useState } from 'react';
import CandidateCard from '@/components/CandidateCard';

import { PlacementDrive, CandidateEvaluation } from '@/types';
import {
  Briefcase,
  CheckCircle2,
  XCircle,
  Users,
  RefreshCw,
} from 'lucide-react';

export default function RecruiterPage() {
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState<string>('');
  const [eligibleCandidates, setEligibleCandidates] = useState<CandidateEvaluation[]>([]);
  const [ineligibleCandidates, setIneligibleCandidates] = useState<CandidateEvaluation[]>([]);
  const [activeTab, setActiveTab] = useState<'eligible' | 'ineligible'>('eligible');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  

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
  const query = searchQuery.trim().toLowerCase();

  if (!query) return candidates;

  return candidates.filter((candidate) => {
    const name = candidate.student.profile.full_name || '';
    const usn = candidate.student.profile.usn || '';

    return (
      name.toLowerCase().includes(query) ||
      usn.toLowerCase().includes(query)
    );
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

      
{/* Candidate Search */}
<div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
  <label
    htmlFor="recruiter-candidate-search"
    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
  >
    Search Candidates
  </label>

  <input
    id="recruiter-candidate-search"
    type="search"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Search by student name or USN..."
    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
  />

  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
    Showing {activeTab === 'eligible'
      ? filteredEligibleCandidates.length
      : filteredIneligibleCandidates.length} candidates
  </p>
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
              <CandidateCard key={candidate.student.profile.id} candidate={candidate} rank={idx + 1} />
            ))}
          </div>
        )
      ) : (
        <div className="space-y-4">
          {filteredIneligibleCandidates.map((candidate, idx) => (
            <CandidateCard key={candidate.student.profile.id} candidate={candidate} rank={idx + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
