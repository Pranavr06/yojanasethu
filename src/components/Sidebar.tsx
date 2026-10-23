'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { useTheme } from '@/lib/themeContext';
import {
  Compass,
  LayoutDashboard,
  GraduationCap,
  Calculator,
  ShieldCheck,
  Calendar,
  FileSearch,
  UploadCloud,
  Building2,
  Users,
  BarChart3,
  CheckCircle2,
  Briefcase,
  Layers,
  LogOut,
  ExternalLink,
  X,
  Database,
  Radio,
  FileCheck2,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
  onOpenEvidenceModal?: () => void;
  onOpenResumeModal?: () => void;
}

export default function Sidebar({
  mobileOpen,
  onClose,
  onOpenEvidenceModal,
  onOpenResumeModal,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  // If on login page, don't show sidebar
  if (pathname === '/login') return null;

  const role = user?.role || 'student';

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return name.slice(0, 2).toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'PP';
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 flex flex-col bg-white dark:bg-[#0B1120] border-r border-slate-200/80 dark:border-slate-800/80 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Header / App Brand */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* App Icon: Blue Rounded Squircle matching user's image */}
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0">
              <Compass className="w-6 h-6 text-white" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  PATHPILOT
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
                  NMAMIT / 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Autonomous Contineo ERP
              </p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 text-xs">
          {/* SECTION 1: OVERVIEW */}
          <div>
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
              OVERVIEW
            </span>
            <div className="space-y-1">
              <Link
                href={
                  role === 'student'
                    ? '/student'
                    : role === 'faculty'
                    ? '/mentor'
                    : role === 'placement'
                    ? '/placement'
                    : '/recruiter'
                }
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  pathname === '/student' || pathname === '/mentor' || pathname === '/college' || pathname === '/placement' || pathname === '/recruiter'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/50 shadow-sm font-bold'
                    : 'font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Dashboard</span>
              </Link>
            </div>
          </div>

          {/* SECTION 2: ROLE-SPECIFIC WORKSPACE */}
          {role === 'student' && (
            <div>
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                ACADEMICS & PROOF
              </span>
              <div className="space-y-1">
                <Link
                  href="/student/academic-truth"
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    pathname.startsWith('/student/academic-truth')
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/50 shadow-sm font-bold'
                      : 'font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Contineo Academic Truth</span>
                </Link>

                <Link
                  href="/student/cgpa-calculator"
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    pathname.startsWith('/student/cgpa-calculator')
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/50 shadow-sm font-bold'
                      : 'font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <Calculator className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>CGPA Simulation Planner</span>
                </Link>

                <Link
                  href="/student/skill-passport"
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    pathname.startsWith('/student/skill-passport')
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/50 shadow-sm font-bold'
                      : 'font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Verifiable Skill Passport</span>
                </Link>

                <Link
                  href="/student/roadmap"
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    pathname.startsWith('/student/roadmap')
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/50 shadow-sm font-bold'
                      : 'font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>30-Day Targeted Roadmap</span>
                </Link>
              </div>
            </div>
          )}

          {role === 'faculty' && (
            <div>
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                MENTOR DESK
              </span>
              <div className="space-y-1">
                <Link
                  href="/mentor/verifications"
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    pathname.includes('/verifications')
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/50 shadow-sm font-bold'
                      : 'font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Evidence Verification Desk</span>
                </Link>

                <Link
                  href="/mentor/corrections"
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    pathname.includes('/corrections')
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/50 shadow-sm font-bold'
                      : 'font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <FileCheck2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>ERP Correction Desk</span>
                </Link>

                <Link
                  href="/mentor/mentees"
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    pathname.includes('/mentees')
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/50 shadow-sm font-bold'
                      : 'font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Mentee Student Directory</span>
                </Link>

                <Link
                  href="/mentor/analytics"
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    pathname.includes('/analytics')
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/50 shadow-sm font-bold'
                      : 'font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Cohort Skill Gap Analytics</span>
                </Link>
              </div>
            </div>
          )}

          {role === 'recruiter' && (
            <div>
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                RECRUITER PIPELINE
              </span>
              <div className="space-y-1">
                <a
                  href="#placement-drives"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                >
                  <Briefcase className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Placement Drives</span>
                </a>

                <a
                  href="#candidate-rankings"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                >
                  <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Ranked Candidates</span>
                </a>

                <a
                  href="#cutoff-filter"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                >
                  <Layers className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Contineo Cutoff Filter</span>
                </a>
              </div>
            </div>
          )}

          {role === 'placement' && (
            <div>
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                PLACEMENT CELL (TPO)
              </span>
              <div className="space-y-1">
                <a
                  href="#drives-list"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                >
                  <Briefcase className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Campus Drives & Cutoffs</span>
                </a>

                <a
                  href="#department-stats"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                >
                  <BarChart3 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Department Placement Stats</span>
                </a>

                <a
                  href="#student-offers"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                >
                  <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Student Offer Tracking</span>
                </a>
              </div>
            </div>
          )}

          {/* SECTION 3: INTELLIGENCE ACTIONS */}
          <div>
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
              ACTIONS & AUDIT
            </span>
            <div className="space-y-1">
              {role === 'student' && onOpenEvidenceModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenEvidenceModal();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-900 text-left transition-colors"
                >
                  <UploadCloud className="w-4 h-4 text-indigo-500" />
                  <span>Submit Proof for Review</span>
                </button>
              )}

              {role === 'student' && onOpenResumeModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenResumeModal();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-slate-100 dark:hover:bg-slate-900 text-left transition-colors"
                >
                  <FileSearch className="w-4 h-4 text-purple-500" />
                  <span>AI Resume & Gap Parser</span>
                </button>
              )}

              <Link
                href="/login"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              >
                <Database className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Switch Evaluator Persona</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section: Live Gateway & User Profile Card */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/60 space-y-3">
          {/* Live indicator row */}
          <div className="flex items-center justify-between px-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              Contineo Gateway
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
              Live
            </span>
          </div>

          {/* User Profile Card - matching reference screenshot! */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              {/* Blue Squircle Avatar with Initials */}
              <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-600 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm">
                {getInitials(user?.full_name, user?.email)}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.email || 'Signed in'}
                </p>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">
                  {user?.role === 'student'
                    ? `${user.full_name || 'Student'}${user.usn ? ` • ${user.usn}` : ''}`
                    : user?.role === 'faculty'
                    ? `${user?.full_name || 'Faculty Mentor'} • Faculty`
                    : user?.role === 'placement'
                    ? `${user?.full_name || 'Placement Officer'} • TPO`
                    : `${user?.full_name || 'Recruiter'} • Talent Partner`}
                </p>
              </div>
            </div>

            {/* Logout Button on Right */}
            <button
              onClick={() => logout()}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0 ml-1"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
