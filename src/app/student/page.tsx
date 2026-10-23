'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { FullStudentProfile } from '@/types';
import EvidenceModal from '@/components/EvidenceModal';
import ResumeAnalyzerModal from '@/components/ResumeAnalyzerModal';
import {
  ShieldCheck,
  GraduationCap,
  Calculator,
  Calendar,
  UploadCloud,
  FileSearch,
  ExternalLink,
  CheckCircle2,
  Clock,
  Github,
  Globe,
  ArrowRight,
  Sparkles,
  Briefcase,
} from 'lucide-react';
import Link from 'next/link';

export default function StudentPage() {
  const { user } = useAuth();
  const [student, setStudent] = useState<FullStudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [isAnalyzerModalOpen, setIsAnalyzerModalOpen] = useState(false);

  const fetchStudentData = async () => {
    try {
      const studentIdentifier = user?.usn || user?.id || user?.email;
      if (!studentIdentifier) {
        setLoading(false);
        setStudent(null);
        return;
      }
      const param = studentIdentifier.includes('@')
        ? `id=${encodeURIComponent(studentIdentifier)}`
        : `usn=${encodeURIComponent(studentIdentifier)}`;
      const res = await fetch(`/api/students?${param}`);
      const data = await res.json();
      if (data.student) {
        setStudent(data.student);
      } else {
        setStudent(null);
      }
    } catch (e) {
      console.error(e);
      setStudent(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [user]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading student passport from database...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="py-20 text-center bg-white dark:bg-slate-900/60 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
          No student record found in database.
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Please verify your institutional email or sign in with an account seeded in the database.
        </p>
      </div>
    );
  }

  const { profile, academic_record, skills, roadmaps, target_role } = student;
  const verifiedCount = skills.filter((s) => s.verification_badge).length;
  const completedRoadmapTasks = roadmaps.filter((r) => r.is_completed).length;

  return (
    <div className="space-y-6">
      {/* 1. Student Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1B4B] via-[#0F172A] to-[#1E1B4B] border border-indigo-500/30 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <span>STUDENT COORDINATOR DESK</span>
              <span>•</span>
              <span>{profile.usn ? `${profile.usn} • ` : ''}NMAMIT Autonomous ERP</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              {profile.full_name}
            </h1>

            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {profile.department_code || 'Engineering'} • Semester {profile.semester || 6} • Batch of {profile.graduation_year || 2026}. Verified academic records synced with NMAMIT Autonomous Examination Cell. Target Role:{' '}
              <span className="text-indigo-400 font-bold">{target_role}</span>
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-300 pt-2 flex-wrap">
              {profile.github_username && (
                <a
                  href={`https://github.com/${profile.github_username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>github/{profile.github_username}</span>
                </a>
              )}
              {profile.portfolio_url && (
                <a
                  href={profile.portfolio_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Portfolio</span>
                </a>
              )}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Exam Cell Verified</span>
              </div>
            </div>
          </div>

          {/* Quick Action Triggers */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <button
              onClick={() => setIsEvidenceModalOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Submit Proof (Repo/Cert)</span>
            </button>

            <button
              onClick={() => setIsAnalyzerModalOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all backdrop-blur-md"
            >
              <FileSearch className="w-4 h-4 text-purple-300" />
              <span>AI Resume Auditor</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Executive Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-400">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
            VERIFIED CGPA
          </span>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
            {academic_record ? academic_record.cgpa.toFixed(2) : 'N/A'}
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
            {academic_record?.active_backlogs === 0
              ? '0 Active Backlogs • Exam Cell'
              : `${academic_record?.active_backlogs} Active Backlog(s)`}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-400">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
            EARNED CREDITS
          </span>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
            {academic_record ? academic_record.total_earned_credits : 0}{' '}
            <span className="text-xs font-normal text-slate-400">/ 160</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
            Exam Cell Verified
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-400">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
            SKILL PASSPORT
          </span>
          <div className="text-2xl md:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {verifiedCount}{' '}
            <span className="text-xs font-normal text-slate-400">of {skills.length}</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
            Verified with Proof
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-400">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
            CAREER ROADMAP
          </span>
          <div className="text-2xl md:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {completedRoadmapTasks}{' '}
            <span className="text-xs font-normal text-slate-400">of {roadmaps.length}</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
            Milestones Completed
          </span>
        </div>
      </div>

      {/* 3. Dedicated Navigation Pages Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Student Workspace Pages
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Contineo Academic Truth Page */}
          <Link
            href="/student/academic-truth"
            className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-lg transition-all group block"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                Exam Cell Synced
              </span>
            </div>

            <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center justify-between">
              <span>Contineo Academic Truth & ERP Ledger</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Dedicated page displaying your official semester 1-6 marks breakdown, SGPA ledger, credits earned, and form to report revaluation grade discrepancies directly to faculty.
            </p>
          </Link>

          {/* Card 2: CGPA Simulation Planner Page */}
          <Link
            href="/student/cgpa-calculator"
            className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 hover:shadow-lg transition-all group block"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20">
                <Calculator className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-500/30">
                Target Optimizer
              </span>
            </div>

            <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors flex items-center justify-between">
              <span>CGPA Simulation Planner</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Dedicated interactive page to calculate exact minimum SGPA required in remaining semesters to achieve your dream company cutoff.
            </p>
          </Link>

          {/* Card 3: Verifiable Skill Passport Page */}
          <Link
            href="/student/skill-passport"
            className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:shadow-lg transition-all group block"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/30">
                {verifiedCount} Verified
              </span>
            </div>

            <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center justify-between">
              <span>Verifiable Skill Passport</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Dedicated page to manage technical skills, submit proof repositories or PDF certificates, and control recruiter visibility settings.
            </p>
          </Link>

          {/* Card 4: 30-Day Targeted Career Roadmap Page */}
          <Link
            href="/student/roadmap"
            className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:shadow-lg transition-all group block"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
                {target_role}
              </span>
            </div>

            <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center justify-between">
              <span>30-Day Targeted Career Roadmap</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Dedicated page with weekly action items, interactive learning resources, and progress checkmarks for your target job role.
            </p>
          </Link>

          {/* Card 5: Placement Transparency Hub */}
          <Link
            href="/student/placement-hub"
            className="p-5 rounded-2xl glass-card border border-indigo-200 dark:border-indigo-800/80 hover:border-indigo-500 hover:shadow-xl transition-all group block sm:col-span-2 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/30 dark:from-indigo-950/20 dark:via-slate-900 dark:to-purple-950/20"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="p-3 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/25">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/30 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>All Batches (2025 - 2028)</span>
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                  Live Placement Feeds
                </span>
              </div>
            </div>

            <h4 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center justify-between">
              <span>Campus Placement Transparency Hub & Early Awareness Desk</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform text-indigo-500" />
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
              Explore official company visits, pre-placement talks, hiring criteria, package CTC breakdowns, and real-time advisory eligibility. Early preparation roadmap and benchmarks for 1st, 2nd, 3rd, and 4th year students.
            </p>
          </Link>
        </div>
      </div>

      {/* Modals */}
      <EvidenceModal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        studentId={profile.id}
        defaultSkill="Python"
        onSuccess={() => {
          setIsEvidenceModalOpen(false);
          fetchStudentData();
        }}
      />

      <ResumeAnalyzerModal
        isOpen={isAnalyzerModalOpen}
        onClose={() => setIsAnalyzerModalOpen(false)}
        targetRole={target_role}
      />
    </div>
  );
}
