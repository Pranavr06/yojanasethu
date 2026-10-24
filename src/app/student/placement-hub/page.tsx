'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/lib/authContext';
import {
  PlacementAnnouncement,
  FullStudentProfile,
  PlacementCalendarEvent,
  HistoricalPlacementStats,
} from '@/types';
import { checkAnnouncementEligibility } from '@/lib/rulesEngine';
import AnnouncementDetailModal from '@/components/AnnouncementDetailModal';
import PlacementCalendarView from '@/components/PlacementCalendarView';
import HistoricalPlacementView from '@/components/HistoricalPlacementView';
import StudentPreparationGuide from '@/components/StudentPreparationGuide';
import {
  Compass,
  Briefcase,
  Calendar as CalendarIcon,
  Search,
  Filter,
  Clock,
  Sparkles,
  TrendingUp,
  Building2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Award,
  Layers,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

export default function StudentPlacementHubPage() {
  const { user } = useAuth();
  const [student, setStudent] = useState<FullStudentProfile | null>(null);
  const [announcements, setAnnouncements] = useState<PlacementAnnouncement[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<PlacementCalendarEvent[]>([]);
  const [historicalStats, setHistoricalStats] = useState<HistoricalPlacementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<PlacementAnnouncement | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'announcements' | 'calendar' | 'history' | 'prep'>('announcements');

  // Filter States
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [minCtc, setMinCtc] = useState<string>('all');

  // Fetch student profile & hub data
  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Student profile
      const studentIdentifier = user?.usn || user?.id || user?.email;
      let studentData: FullStudentProfile | null = null;

      if (studentIdentifier) {
        const param = studentIdentifier.includes('@')
          ? `id=${encodeURIComponent(studentIdentifier)}`
          : `usn=${encodeURIComponent(studentIdentifier)}`;
        try {
          const sRes = await fetch(`/api/students?${param}`);
          const sJson = await sRes.json();
          if (sJson.student) studentData = sJson.student;
        } catch (e) {
          console.error('Error fetching student:', e);
        }
      }
      if (!studentData && user?.role && user.role !== 'student') {
        try {
          const sRes = await fetch('/api/students?usn=NNM24IS159');
          const sJson = await sRes.json();
          if (sJson.student) studentData = sJson.student;
        } catch {}
      }
      setStudent(studentData);

      // 2. Fetch announcements, calendar events, and history in parallel
      const [annRes, calRes, histRes] = await Promise.all([
        fetch('/api/placement/announcements'),
        fetch('/api/placement/calendar'),
        fetch('/api/placement/history'),
      ]);

      const [annJson, calJson, histJson] = await Promise.all([
        annRes.json(),
        calRes.json(),
        histRes.json(),
      ]);

      if (Array.isArray(annJson.announcements)) {
        setAnnouncements(annJson.announcements);
      }
      if (Array.isArray(calJson.events)) {
        setCalendarEvents(calJson.events);
      }
      if (histJson.stats) {
        setHistoricalStats(histJson.stats);
      }
    } catch (err) {
      console.error('Error loading placement hub:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Available filter options extracted from announcements
  const availableBatches = useMemo(() => {
    const batches = new Set<number>();
    announcements.forEach((a) => {
      (a.eligible_batches || []).forEach((b) => batches.add(b));
    });
    batches.add(2025);
    batches.add(2026);
    batches.add(2027);
    batches.add(2028);
    return Array.from(batches).sort();
  }, [announcements]);

  const availableBranches = useMemo(() => {
    const branches = new Set<string>();
    announcements.forEach((a) => {
      (a.eligible_branches || []).forEach((b) => branches.add(b));
    });
    // Add default engineering departments at NMAMIT
    ['ISE', 'CSE', 'AIML', 'AIDS', 'CSCY', 'CSFSD', 'CCE', 'ECE', 'EEE', 'MECH', 'CIV', 'BT'].forEach((b) =>
      branches.add(b)
    );
    return Array.from(branches).sort();
  }, [announcements]);

  // Filtered Announcements
  const filteredAnnouncements = useMemo(() => {
    const now = new Date();

    return announcements.filter((a) => {
      // 1. Batch filter
      if (selectedBatch !== 'all') {
        const batchNum = parseInt(selectedBatch, 10);
        if (a.eligible_batches && a.eligible_batches.length > 0 && !a.eligible_batches.includes(batchNum)) {
          return false;
        }
      }

      // 2. Branch filter
      if (selectedBranch !== 'all') {
        if (a.eligible_branches && a.eligible_branches.length > 0 && !a.eligible_branches.includes(selectedBranch)) {
          return false;
        }
      }

      // 3. Status filter
      if (selectedStatus !== 'all') {
        const deadline = new Date(a.registration_deadline);
        const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 3600 * 24));
        const isOpen = deadline > now;
        const isClosingSoon = diffDays > 0 && diffDays <= 3;

        if (selectedStatus === 'open' && !isOpen) return false;
        if (selectedStatus === 'closing_soon' && !isClosingSoon) return false;
        if (selectedStatus === 'closed' && isOpen) return false;
      }

      // 4. Min CTC filter
      if (minCtc !== 'all') {
        const minVal = parseFloat(minCtc);
        if (a.ctc_lpa < minVal) return false;
      }

      // 5. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCompany = a.company_name.toLowerCase().includes(q);
        const matchRole = a.role_title.toLowerCase().includes(q);
        const matchDesc = a.job_description.toLowerCase().includes(q);
        const matchSkill = (a.required_skills || []).some((s) => s.name.toLowerCase().includes(q));
        if (!matchCompany && !matchRole && !matchDesc && !matchSkill) return false;
      }

      return true;
    });
  }, [announcements, selectedBatch, selectedBranch, selectedStatus, minCtc, searchQuery]);

  // Top metric computations
  const metrics = useMemo(() => {
    const now = new Date();
    const active = announcements.filter((a) => new Date(a.registration_deadline) > now).length;
    const closingSoon = announcements.filter((a) => {
      const diff = Math.ceil((new Date(a.registration_deadline).getTime() - now.getTime()) / (1000 * 3600 * 24));
      return diff > 0 && diff <= 3;
    }).length;
    const highestCtc = announcements.reduce((max, a) => Math.max(max, a.ctc_lpa), 0);

    return {
      active,
      closingSoon,
      highestCtc: highestCtc || 18.0,
      total: announcements.length,
    };
  }, [announcements]);

  const hasActiveFilters =
    selectedBatch !== 'all' ||
    selectedBranch !== 'all' ||
    selectedStatus !== 'all' ||
    minCtc !== 'all' ||
    searchQuery.trim().length > 0;

  const resetFilters = () => {
    setSelectedBatch('all');
    setSelectedBranch('all');
    setSelectedStatus('all');
    setMinCtc('all');
    setSearchQuery('');
  };

  const handleSelectAnnouncementById = (id: string) => {
    const found = announcements.find((a) => a.id === id);
    if (found) {
      setSelectedAnnouncement(found);
      setActiveTab('announcements');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Authorized Officer / Governance Preview Banner */}
      {user?.role && user.role !== 'student' && (
        <div className="p-4 rounded-2xl bg-indigo-900/30 border border-indigo-500/30 text-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              <strong>Transparency Hub Preview Mode:</strong> Active audit session for <strong>{user.full_name || 'Prof. Sudesh Rao'}</strong> ({user.role.toUpperCase()}). Showing student-facing eligibility gates and transparency announcements.
            </span>
          </div>
          <Link
            href={user.role === 'admin' ? '/admin/dashboard' : user.role === 'faculty' || user.role === 'mentor' ? '/mentor' : '/placements/dashboard'}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors whitespace-nowrap self-start sm:self-center border border-white/20"
          >
            ← Back to {user.role === 'admin' ? 'Governance Desk' : user.role === 'faculty' || user.role === 'mentor' ? 'Mentor Desk' : 'Placement Desk'}
          </Link>
        </div>
      )}
      {/* 1. Placement Hub Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1B4B] via-[#0F172A] to-[#1E1B4B] border border-indigo-500/30 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Compass className="w-3.5 h-3.5" />
              <span>PLACEMENT TRANSPARENCY HUB</span>
              <span>•</span>
              <span>All Engineering Batches (2025 - 2028)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Official Campus Recruitment & Early Preparation Desk
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Every student from first year to final year can see official placement activity, examine verified company criteria, and build the exact skills recruiters demand before sitting for placement drives.
            </p>

            {student && (
              <div className="flex items-center gap-3 text-xs text-slate-300 pt-1 flex-wrap">
                <span className="font-semibold text-white">
                  Auditing as: {student.profile.full_name} ({student.profile.department_code || 'ISE'} • Batch {student.profile.graduation_year || 2026})
                </span>
                <span>•</span>
                <span>
                  CGPA: <strong className="text-indigo-400 font-mono">{student.academic_record?.cgpa?.toFixed(2) ?? 'N/A'}</strong>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-emerald-300 text-[11px] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Contineo Synced
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <button
              onClick={() => {
                setRefreshing(true);
                fetchData();
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all backdrop-blur-md"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Sync Placement Feed</span>
            </button>

            <Link
              href="/student/skill-passport"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Skills in Passport</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Snapshot */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-400">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            ACTIVE OPPORTUNITIES
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {metrics.active}{' '}
            <span className="text-xs font-normal text-slate-400">Open</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {metrics.total} total announced drives
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-400">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            CLOSING SOON (&le; 3 DAYS)
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {metrics.closingSoon}{' '}
            <span className="text-xs font-normal text-slate-400">Deadlines</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Don't miss final application gates
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-400">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            MAX PACKAGE ANNOUNCED
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400">
            {metrics.highestCtc.toFixed(1)}{' '}
            <span className="text-xs font-normal text-slate-400">LPA</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Google / Microsoft / Cisco
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-400">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            ELIGIBILITY ENGINE
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            Real-time
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Contineo ERP Cutoffs Enforced
          </span>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2 sm:gap-4 text-xs font-bold text-slate-500">
        <button
          onClick={() => setActiveTab('announcements')}
          className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'announcements'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold'
              : 'border-transparent hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Placement Drives & Announcements ({filteredAnnouncements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'calendar'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold'
              : 'border-transparent hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Placement Calendar & Visits ({calendarEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'history'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold'
              : 'border-transparent hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Historical Placement Transparency</span>
        </button>

        <button
          onClick={() => setActiveTab('prep')}
          className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'prep'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold'
              : 'border-transparent hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Junior Early Prep Blueprint</span>
        </button>
      </div>

      {/* TAB 1: PLACEMENT ANNOUNCEMENTS & DRIVES */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold pr-1">
                <Filter className="w-4 h-4 text-indigo-500" />
                <span>Filters:</span>
              </div>

              {/* Graduation Batch Filter */}
              <div className="flex items-center gap-1.5">
                <label className="text-slate-500 text-[11px] font-medium">Batch:</label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Batches</option>
                  {availableBatches.map((b) => (
                    <option key={b} value={b}>
                      Batch {b} {b > 2026 ? '(Junior)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Branch Filter */}
              <div className="flex items-center gap-1.5">
                <label className="text-slate-500 text-[11px] font-medium">Branch:</label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Branches</option>
                  {availableBranches.map((br) => (
                    <option key={br} value={br}>
                      {br}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <label className="text-slate-500 text-[11px] font-medium">Status:</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open Now</option>
                  <option value="closing_soon">Closing Soon (&le; 3 days)</option>
                  <option value="closed">Concluded / Closed</option>
                </select>
              </div>

              {/* Min Package Filter */}
              <div className="flex items-center gap-1.5">
                <label className="text-slate-500 text-[11px] font-medium">Min CTC:</label>
                <select
                  value={minCtc}
                  onChange={(e) => setMinCtc(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">Any CTC</option>
                  <option value="8">8+ LPA</option>
                  <option value="12">12+ LPA (Tier 1)</option>
                  <option value="15">15+ LPA (Super Dream)</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search company, role, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Announcements Card Grid */}
          {loading ? (
            <div className="py-20 text-center text-slate-500 text-xs">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p>Loading placement announcements and checking advisory eligibility...</p>
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-500 bg-white dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                No placement opportunities found matching your filters.
              </p>
              <button
                onClick={resetFilters}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAnnouncements.map((ann) => {
                const eligibility = checkAnnouncementEligibility(student, ann);
                const now = new Date();
                const deadline = new Date(ann.registration_deadline);
                const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 3600 * 24));
                const isClosingSoon = diffDays > 0 && diffDays <= 3;
                const isExpired = diffDays <= 0;

                return (
                  <div
                    key={ann.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-4 transition-all hover:border-indigo-400 dark:hover:border-slate-700 hover:shadow-md"
                  >
                    <div className="space-y-3">
                      {/* Top Header Tags */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20">
                            {ann.job_type}
                          </span>
                          {isClosingSoon && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {diffDays === 1 ? '1 day left!' : `${diffDays}d left`}
                            </span>
                          )}
                          {isExpired && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                              Closed
                            </span>
                          )}
                        </div>

                        <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 font-mono px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
                          {ann.ctc_lpa.toFixed(1)} LPA
                        </span>
                      </div>

                      {/* Title & Company */}
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-1">
                          {ann.role_title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {ann.company_name}
                          </span>
                        </div>
                      </div>

                      {/* Brief Description */}
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {ann.job_description}
                      </p>

                      {/* Key Cutoff Specs */}
                      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-[11px]">
                        <div>
                          <span className="text-slate-400 block">Min CGPA:</span>
                          <strong className="text-slate-900 dark:text-white font-mono">
                            {ann.min_cgpa.toFixed(2)}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Backlogs Max:</span>
                          <strong className="text-slate-900 dark:text-white font-mono">
                            {ann.max_active_backlogs}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Target Batches:</span>
                          <strong className="text-slate-900 dark:text-white font-mono">
                            {ann.eligible_batches && ann.eligible_batches.length > 0
                              ? ann.eligible_batches.join(', ')
                              : '2026'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Branches:</span>
                          <strong className="text-slate-900 dark:text-white truncate block">
                            {ann.eligible_branches.slice(0, 3).join(', ')}
                            {ann.eligible_branches.length > 3 ? '...' : ''}
                          </strong>
                        </div>
                      </div>

                      {/* Advisory Eligibility Badge */}
                      <div className="pt-1">
                        <div
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                            eligibility.badgeColor === 'emerald'
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300'
                              : eligibility.badgeColor === 'blue'
                              ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800/50 text-blue-800 dark:text-blue-300'
                              : eligibility.badgeColor === 'rose'
                              ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/50 text-rose-800 dark:text-rose-300'
                              : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/50 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold text-[11px] truncate">
                            {eligibility.decision === 'eligible' && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                            {eligibility.decision === 'ineligible' && <XCircle className="w-3.5 h-3.5 shrink-0" />}
                            {eligibility.decision === 'unknown' && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                            <span className="truncate">{eligibility.badgeLabel}</span>
                          </div>
                          <span className="text-[10px] opacity-75 shrink-0 font-medium">Advisory</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Triggers */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                      <button
                        onClick={() => setSelectedAnnouncement(ann)}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition-colors text-center"
                      >
                        Opportunity Details
                      </button>

                      {ann.application_link && !isExpired && (
                        <a
                          href={ann.application_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors flex items-center gap-1 shrink-0"
                          title="Open official registration application link"
                        >
                          <span>Apply</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PLACEMENT CALENDAR & TIMELINE */}
      {activeTab === 'calendar' && (
        <PlacementCalendarView
          events={calendarEvents}
          onSelectAnnouncement={handleSelectAnnouncementById}
        />
      )}

      {/* TAB 3: HISTORICAL PLACEMENT TRANSPARENCY */}
      {activeTab === 'history' && (
        <HistoricalPlacementView stats={historicalStats} />
      )}

      {/* TAB 4: JUNIOR EARLY PREPARATION BLUEPRINT */}
      {activeTab === 'prep' && (
        <StudentPreparationGuide
          graduationYear={student?.profile?.graduation_year ?? undefined}
        />
      )}

      {/* Detailed Opportunity Modal */}
      <AnnouncementDetailModal
        isOpen={Boolean(selectedAnnouncement)}
        onClose={() => setSelectedAnnouncement(null)}
        announcement={selectedAnnouncement}
        student={student}
      />
    </div>
  );
}
