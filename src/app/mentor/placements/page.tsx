'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  PlacementAnnouncement,
  FullStudentProfile,
  PlacementCalendarEvent,
} from '@/types';
import { checkAnnouncementEligibility } from '@/lib/rulesEngine';
import AnnouncementDetailModal from '@/components/AnnouncementDetailModal';
import {
  Briefcase,
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  GraduationCap,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export default function MentorPlacementsPage() {
  const [announcements, setAnnouncements] = useState<PlacementAnnouncement[]>([]);
  const [mentees, setMentees] = useState<any[]>([]);
  const [selectedMenteeId, setSelectedMenteeId] = useState<string>('all');
  const [selectedMenteeProfile, setSelectedMenteeProfile] = useState<FullStudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMenteeProfile, setLoadingMenteeProfile] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<PlacementAnnouncement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [annRes, mRes] = await Promise.all([
        fetch('/api/placement/announcements?status=published'),
        fetch('/api/mentor/mentees'),
      ]);

      const [annData, mData] = await Promise.all([annRes.json(), mRes.json()]);

      if (Array.isArray(annData.announcements)) {
        setAnnouncements(annData.announcements);
      }
      if (Array.isArray(mData.mentees)) {
        setMentees(mData.mentees);
      }
    } catch (e) {
      console.error('Failed to load mentor placement hub:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // When a specific mentee is selected, load their full academic & skill profile
  useEffect(() => {
    if (selectedMenteeId === 'all') {
      setSelectedMenteeProfile(null);
      return;
    }

    async function loadMentee() {
      setLoadingMenteeProfile(true);
      try {
        const res = await fetch(`/api/students?id=${encodeURIComponent(selectedMenteeId)}`);
        const data = await res.json();
        if (data.student) {
          setSelectedMenteeProfile(data.student);
        } else {
          setSelectedMenteeProfile(null);
        }
      } catch (e) {
        console.error('Failed to load mentee profile:', e);
        setSelectedMenteeProfile(null);
      } finally {
        setLoadingMenteeProfile(false);
      }
    }

    loadMentee();
  }, [selectedMenteeId]);

  // Filtered Announcements
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchComp = a.company_name.toLowerCase().includes(q);
        const matchRole = a.role_title.toLowerCase().includes(q);
        const matchBranch = a.eligible_branches.some((b) => b.toLowerCase().includes(q));
        if (!matchComp && !matchRole && !matchBranch) return false;
      }
      return true;
    });
  }, [announcements, searchTerm]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-slate-900 dark:text-slate-100">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-500/30 text-white shadow-xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
          <Briefcase className="w-3.5 h-3.5" />
          <span>FACULTY MENTOR WORKSPACE</span>
          <span>•</span>
          <span>Placement Awareness & Mentee Guidance Desk</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Campus Recruitment Opportunities & Mentee Readiness
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Review all official published campus recruitment drives, pre-placement visits, and company requirements. Audit your assigned mentees' Contineo ERP standings and encourage early preparation for missing technical skills.
        </p>
      </div>

      {/* Mentee Readiness Audit Selector Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-500 font-bold">
            <Users className="w-4 h-4 text-indigo-500" />
            <span>Audit Mentee Readiness:</span>
          </div>

          <select
            value={selectedMenteeId}
            onChange={(e) => setSelectedMenteeId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 min-w-[220px]"
          >
            <option value="all">General Placement Overview (No Mentee Selected)</option>
            {mentees.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name || m.full_name} ({m.usn || 'Student'} • {m.department_code || 'ISE'} • CGPA {m.cgpa ?? 'N/A'})
              </option>
            ))}
          </select>

          {selectedMenteeProfile && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                Auditing: {selectedMenteeProfile.profile.full_name} (CGPA {selectedMenteeProfile.academic_record?.cgpa?.toFixed(2) ?? 'N/A'} • {selectedMenteeProfile.academic_record?.active_backlogs ?? 0} Backlogs)
              </span>
            </div>
          )}
        </div>

        {/* Search announcements */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search company, role, branch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Selected Mentee Advice Prompt */}
      {selectedMenteeProfile && (
        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 text-xs flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Mentorship Recommendation for {selectedMenteeProfile.profile.full_name}</span>
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Below, each published placement opportunity displays personalized advisory eligibility for this mentee. If a drive shows criteria deficits (such as CGPA cutoff or missing verified skills in Skill Passport), advise your mentee to simulate targets in the CGPA Simulation Planner or submit evidence for verification.
            </p>
          </div>

          <Link
            href="/mentor/verifications"
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 transition-colors flex items-center gap-1"
          >
            <span>Review Mentee Proofs</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Announcements Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-xs">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p>Loading published placement drives...</p>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500 bg-white dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          No published placement drives found matching search query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAnnouncements.map((ann) => {
            const eligibility = selectedMenteeProfile
              ? checkAnnouncementEligibility(selectedMenteeProfile, ann)
              : null;

            const deadline = new Date(ann.registration_deadline);
            const now = new Date();
            const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 3600 * 24));
            const isClosingSoon = diffDays > 0 && diffDays <= 3;
            const isExpired = diffDays <= 0;

            return (
              <div
                key={ann.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-4 transition-all hover:border-indigo-400"
              >
                <div className="space-y-3">
                  {/* Header Row */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20">
                      {ann.job_type}
                    </span>
                    <span className="text-xs font-mono font-extrabold text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
                      {ann.ctc_lpa.toFixed(1)} LPA
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-1">
                      {ann.role_title}
                    </h4>
                    <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{ann.company_name}</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {ann.job_description}
                  </p>

                  {/* Cutoff criteria */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Min CGPA:</span>
                      <strong className="text-slate-900 dark:text-white font-mono">{ann.min_cgpa.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Max Backlogs:</span>
                      <strong className="text-slate-900 dark:text-white font-mono">{ann.max_active_backlogs}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Eligible Batches:</span>
                      <strong className="text-slate-900 dark:text-white font-mono">
                        {ann.eligible_batches?.join(', ') || '2026'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Deadline:</span>
                      <strong className="text-slate-900 dark:text-white font-mono">
                        {deadline.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </strong>
                    </div>
                  </div>

                  {/* Mentee-specific eligibility verdict if selected */}
                  {eligibility && (
                    <div
                      className={`p-2.5 rounded-xl border text-xs ${
                        eligibility.badgeColor === 'emerald'
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300'
                          : eligibility.badgeColor === 'blue'
                          ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800/50 text-blue-800 dark:text-blue-300'
                          : 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/50 text-rose-800 dark:text-rose-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-[11px]">
                        {eligibility.decision === 'eligible' && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                        {eligibility.decision === 'ineligible' && <XCircle className="w-3.5 h-3.5 shrink-0" />}
                        <span>Mentee: {eligibility.badgeLabel}</span>
                      </div>
                      {eligibility.reasons.length > 0 && (
                        <p className="text-[10px] mt-1 text-rose-700 dark:text-rose-300 line-clamp-1">
                          {eligibility.reasons[0]}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setSelectedAnnouncement(ann)}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>View Full Opportunity Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Opportunity Modal */}
      <AnnouncementDetailModal
        isOpen={Boolean(selectedAnnouncement)}
        onClose={() => setSelectedAnnouncement(null)}
        announcement={selectedAnnouncement}
        student={selectedMenteeProfile}
      />
    </div>
  );
}
