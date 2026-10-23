'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import {
  LayoutDashboard,
  GraduationCap,
  Calculator,
  ShieldCheck,
  Award,
  BrainCircuit,
  Calendar,
  FileText,
  Code2,
  BookOpen,
  Briefcase,
  BarChart3,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Target,
  ExternalLink,
  TrendingUp,
  Clock,
  Radio,
  FileSearch,
  Bot,
  Mic
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [studentName, setStudentName] = useState(user?.full_name || 'Pranav R');
  const [usn, setUsn] = useState(user?.usn || '4NM22CS120');
  const [dsaSolved, setDsaSolved] = useState<number | null>(null);
  const [readinessScore, setReadinessScore] = useState<number | null>(null);
  const [targetRole, setTargetRole] = useState<string>('Software Developer');

  useEffect(() => {
    async function fetchStats() {
      try {
        const dsaRes = await fetch('/api/student/dsa');
        if (dsaRes.ok) {
          const dsaData = await dsaRes.json();
          if (dsaData.records && Array.isArray(dsaData.records)) {
            const solved = dsaData.records.filter((r: any) => r.status === 'solved').length;
            setDsaSolved(solved);
          }
        }
        const gapRes = await fetch('/api/student/skill-gap');
        if (gapRes.ok) {
          const gapData = await gapRes.json();
          if (gapData.analysis) {
            setReadinessScore(gapData.analysis.role_readiness_score);
            setTargetRole(gapData.analysis.target_role);
          }
        }
      } catch {}
    }
    fetchStats();
  }, []);

  const skills = [
    { name: 'Python & AI Engineering', level: 85 },
    { name: 'TypeScript & Next.js Full Stack', level: 88 },
    { name: 'Data Structures & Algorithms', level: 78 },
    { name: 'PostgreSQL & Database Modeling', level: 82 },
  ];

  const recentDrives = [
    {
      company: 'Nexus AI Technologies',
      role: 'AI / Full Stack Intern',
      ctc: '14.5 LPA',
      tier: 'Super Dream',
      deadline: 'Tomorrow, 5:00 PM',
      status: 'Eligible (CGPA ≥ 8.0)',
    },
    {
      company: 'Cisco Systems',
      role: 'Cloud Software Engineer',
      ctc: '12.0 LPA',
      tier: 'Dream',
      deadline: 'In 3 days',
      status: 'Eligible (CGPA ≥ 7.5)',
    },
    {
      company: 'Infosys Limited',
      role: 'Specialist Programmer (SP)',
      ctc: '9.5 LPA',
      tier: 'Specialist',
      deadline: 'In 5 days',
      status: 'Eligible (All Cleared)',
    },
  ];

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 p-6 sm:p-10 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Welcome back, {user?.full_name || studentName}!
          </h1>

          <p className="text-sm sm:text-base text-indigo-100 leading-relaxed max-w-2xl">
            Your evidence-backed student career portal. Access your verified Contineo academic records,
            practice AI voice interviews, train DSA patterns, generate ATS resumes, and track campus placement drives.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/student/mock-interview"
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-600/30 transition-all hover:scale-105"
            >
              <Bot className="w-4 h-4" />
              <span>Voice AI Mock Interview</span>
            </Link>

            <Link
              href="/student/resume-builder"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-indigo-700 shadow-md hover:bg-indigo-50 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>AI Resume Builder & ATS Analyzer</span>
            </Link>

            <Link
              href="/student/career-coach"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-950/40 border border-white/30 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-all backdrop-blur-sm"
            >
              <BrainCircuit className="w-4 h-4 text-purple-300" />
              <span>AI Career Guidance</span>
            </Link>

            <Link
              href="/student/placement-hub"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-950/40 border border-white/30 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-all backdrop-blur-sm"
            >
              <Briefcase className="w-4 h-4 text-emerald-300" />
              <span>View Active Drives</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-12 -bottom-12 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
      </section>

      {/* KPI Overview Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/student/academic-truth"
          className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-800 transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Contineo CGPA</span>
            <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">8.85</p>
          <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <Radio className="w-3 h-3 animate-pulse" /> Verified Contineo Record
          </p>
        </Link>

        <Link
          href="/student/career-coach"
          className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-purple-300 dark:hover:border-purple-800 transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Placement Readiness</span>
            <Target className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{readinessScore !== null ? `${readinessScore}%` : '—'}</p>
          <p className="mt-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
            {targetRole}
          </p>
        </Link>

        <Link
          href="/student/dsa-tracker"
          className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-800 transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>DSA Patterns Solved</span>
            <Code2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{dsaSolved !== null ? `${dsaSolved} / 20` : '— / 20'}</p>
          <p className="mt-1 text-[11px] text-slate-400">{dsaSolved !== null ? `${Math.round((dsaSolved / 20) * 100)}% Pattern Mastery` : 'Pattern mastery'}</p>
        </Link>

        <Link
          href="/student/certificates"
          className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-amber-300 dark:hover:border-amber-800 transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Verified Credentials</span>
            <Award className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">3 Proofs</p>
          <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            Faculty Endorsed
          </p>
        </Link>
      </section>

      {/* Unified Modules Navigation Hub (Merged from All Sections & Existing Modules) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
            Career & Placement Modules Hub
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Explore all dedicated tools, academic records, and career preparation engines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Academic Records */}
          <Link
            href="/student/academic-truth"
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-indigo-500/50 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                  Academics
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Academic Records
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Immutable Contineo ERP verified grades, SGPA trajectory, and official transcript audit.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
              <span>View Transcript</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 2. CGPA Calculator */}
          <Link
            href="/student/cgpa-calculator"
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-indigo-500/50 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Calculator className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                  Planning
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                CGPA Calculator
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Simulate prospective semester grades and determine the exact credits needed to meet cutoff thresholds.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <span>Simulate Target CGPA</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 3. Skill Passport */}
          <Link
            href="/student/skill-passport"
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-indigo-500/50 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                  Verification
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Skill Passport
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Cryptographically verifiable proof passport containing peer-reviewed skills and GitHub evidence.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
              <span>Open Passport</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 4. AI Voice Mock Interview (NEW) */}
          <Link
            href="/student/mock-interview"
            className="rounded-2xl border border-purple-200/90 dark:border-purple-800/60 bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/30 dark:from-purple-950/20 dark:via-slate-900 dark:to-indigo-950/20 p-5 shadow-sm hover:border-purple-500/60 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Voice AI
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex items-center gap-1.5">
                <span>AI Mock Interview</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Practice voice-enabled technical & HR interview rounds with speech synthesis, microphone recognition, and live scoring.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-purple-100 dark:border-purple-900/50 flex items-center justify-between text-xs text-purple-600 dark:text-purple-400 font-semibold">
              <span>Start Voice Interview</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 5. Certificates */}
          <Link
            href="/student/certificates"
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-indigo-500/50 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                  Credentials
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Certificates & Evidence
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Submit course certificates, hackathon awards, and licenses for faculty review and endorsement.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-semibold">
              <span>Manage Credentials</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 6. AI Career Coach */}
          <Link
            href="/student/career-coach"
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-indigo-500/50 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                  AI Guidance
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                AI Career Coach
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Predict placement readiness, discover high-impact tech stacks, and close skill gaps for target roles.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-purple-600 dark:text-purple-400 font-semibold">
              <span>Get AI Assessment</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 7. Career Roadmap */}
          <Link
            href="/student/roadmap"
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-indigo-500/50 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                  Roadmap
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Career Roadmap
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Step-by-step 30-day targeted preparation plan with weekly milestones for Tier 1 campus drives.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-cyan-600 dark:text-cyan-400 font-semibold">
              <span>View Weekly Plan</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 8. Resume Builder */}
          <Link
            href="/student/resume-builder"
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-indigo-500/50 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                  Tools
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                AI Resume Builder & ATS Analyzer
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Upload PDF/DOCX or sync verified ERP records. Run live AI ATS audit, get actionable gap suggestions, and export clean PDF resumes.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 font-semibold">
              <span>Generate Resume</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 9. DSA Tracker */}
          <Link
            href="/student/dsa-tracker"
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-indigo-500/50 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <Code2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                  Coding
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                DSA Practice Tracker
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Checklist of core algorithmic coding patterns asked in technical campus interviews.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-teal-600 dark:text-teal-400 font-semibold">
              <span>Track DSA Progress</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 10. Learn Programming */}
          <Link
            href="/student/learn-programming"
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-indigo-500/50 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                  Learning
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Learn Programming
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Interactive language cheatsheets, code snippets, and concepts across Python, Java, C++, and TypeScript.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
              <span>Start Learning Track</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 11. Placement Hub */}
          <Link
            href="/student/placement-hub"
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-indigo-500/50 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                  Drives
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Placement Transparency Hub
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Active campus drives, verified Contineo eligibility checks, drive deadlines, and direct applications.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-semibold">
              <span>Explore Live Drives</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 12. Placement History */}
          <Link
            href="/student/placement-history"
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-indigo-500/50 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                  Analytics
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Placement History
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Historical salary benchmarks, department-wise placement percentages, and top hiring partner analytics.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-violet-600 dark:text-violet-400 font-semibold">
              <span>View CTC Benchmarks</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* Skills Snapshot & Recent Drives Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Skills Snapshot (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Verified Technical Skills
            </h3>
            <Link
              href="/student/skill-passport"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              Skill Passport →
            </Link>
          </div>

          <div className="space-y-4 pt-2">
            {skills.map((skill) => (
              <div key={skill.name}>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">{skill.name}</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{skill.level}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Upcoming Campus Drives Preview (6 cols) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Upcoming Placement Drives
            </h3>
            <Link
              href="/student/placement-hub"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              All Drives →
            </Link>
          </div>

          <div className="space-y-3 pt-1">
            {recentDrives.map((drive, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900 dark:text-white">{drive.company}</strong>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                      {drive.tier}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{drive.role}</p>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 block">
                    {drive.ctc}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" /> {drive.deadline}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
