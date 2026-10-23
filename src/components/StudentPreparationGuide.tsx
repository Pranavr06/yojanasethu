'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  Code2,
  Cpu,
  Database,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  Terminal,
  Zap,
} from 'lucide-react';

interface Props {
  graduationYear?: number;
}

export default function StudentPreparationGuide({ graduationYear }: Props) {
  const isJunior = graduationYear && graduationYear > 2026;

  const corePrepPillars = [
    {
      title: '1. Verifiable Technical Proof (Skill Passport)',
      icon: ShieldCheck,
      color: 'emerald',
      description:
        'Recruiters on YojanaSethu filter by faculty-endorsed proof. Self-declared claims without evidence carry minimal weight.',
      actionText: 'Submit GitHub Repo / Certificate Proof',
      actionUrl: '/student/skill-passport',
      keySkills: ['Python / C++ / Java', 'SQL Databases', 'React.js / Node.js', 'PyTorch / ML Pipelines'],
    },
    {
      title: '2. Deterministic Academic Truth (Contineo ERP)',
      icon: Database,
      color: 'indigo',
      description:
        'Maintain your CGPA above campus cutoffs (7.00 - 8.00) and clear backlogs before final year placement drive commencement.',
      actionText: 'Simulate Required SGPA in Planner',
      actionUrl: '/student/cgpa-calculator',
      keySkills: ['Core Engineering Subjects', 'Clean Academic Records', 'Zero Active Backlogs'],
    },
    {
      title: '3. 30-Day Targeted Role Learning Roadmap',
      icon: Calendar,
      color: 'purple',
      description:
        'Follow high-intensity weekly milestones covering system design, relational database schemas, and coding patterns.',
      actionText: 'Open 30-Day Structured Roadmap',
      actionUrl: '/student/roadmap',
      keySkills: ['LeetCode Patterns', 'System Architecture', 'Clean Code Practices'],
    },
    {
      title: '4. AI Resume & ATS Keyword Auditor',
      icon: Code2,
      color: 'sky',
      description:
        'Ensure your resume includes high-yield keywords and project descriptions matching published TPO drive criteria.',
      actionText: 'Run AI Resume Auditor',
      actionUrl: '/student',
      keySkills: ['Quantified Impact Metrics', 'Production Tooling', 'Clean Typography'],
    },
  ];

  const roundWiseStrategy = [
    {
      round: 'Round 1: Proctored Online Assessment (OA)',
      timeline: '45 - 90 Minutes',
      focus: 'Data Structures & Algorithms (2-3 Problems) + Aptitude (Quantitative, Logical, Verbal)',
      recommendation:
        'Practice LeetCode mediums on Arrays, Dynamic Programming, Graphs, and HashMaps. Revise standard speed-math shortcuts.',
    },
    {
      round: 'Round 2: Technical Panel Interview',
      timeline: '45 - 60 Minutes',
      focus: 'Code walk-through of your submitted GitHub repositories + Core CS Fundamentals',
      recommendation:
        'Be prepared to explain database indexing, API rate limiting, concurrency, and OOP principles behind your verified projects.',
    },
    {
      round: 'Round 3: Techno-Managerial & Leadership Round',
      timeline: '30 - 45 Minutes',
      focus: 'System architecture, trade-off decisions, and situational collaboration questions',
      recommendation:
        'Structure responses with the STAR method (Situation, Task, Action, Result). Highlight team projects from your Skill Passport.',
    },
    {
      round: 'Round 4: HR & Executive Fitment',
      timeline: '20 - 30 Minutes',
      focus: 'Culture fit, career aspirations, relocation readiness, and institutional values',
      recommendation:
        'Research the visiting company’s recent engineering blogs, corporate mission, and client domains.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-500/30 text-white shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-300" />
            <span>Early Preparation Blueprint</span>
          </span>
          {isJunior && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Personalized for Batch {graduationYear}
            </span>
          )}
        </div>

        <h3 className="text-lg sm:text-xl font-extrabold text-white">
          How Engineering Juniors Can Turn Early Placement Awareness into Offers
        </h3>

        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          The Placement Transparency Hub lets students of 1st, 2nd, and 3rd year observe real recruitment criteria years before they sit for interviews. Use this advance intelligence to build verifiable skills, preserve an impeccable CGPA, and avoid last-minute panic.
        </p>
      </div>

      {/* Core Preparation Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {corePrepPillars.map((p, i) => {
          const Icon = p.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-4 transition-all hover:border-indigo-400"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {p.title}
                  </h4>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {p.description}
                </p>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    High-Yield Focus Areas:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {p.keySkills.map((k, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <Link
                href={p.actionUrl}
                className="inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-300 font-semibold text-xs border border-slate-200 dark:border-slate-700/80 transition-all group"
              >
                <span>{p.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          );
        })}
      </div>

      {/* Recruiter Evaluation Process Blueprint */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Campus Selection Round-by-Round Blueprint
            </h4>
          </div>
          <span className="text-[11px] text-slate-500">
            Standard Tier 1 Hiring Pattern
          </span>
        </div>

        <div className="space-y-3">
          {roundWiseStrategy.map((r, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-bold text-xs text-slate-900 dark:text-white">
                  {r.round}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800">
                  {r.timeline}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                <strong>Evaluation Scope:</strong> {r.focus}
              </p>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/60">
                <strong className="text-indigo-600 dark:text-indigo-400">TPO Strategy Tip:</strong> {r.recommendation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
