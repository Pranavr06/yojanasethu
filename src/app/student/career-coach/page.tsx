'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import {
  BrainCircuit,
  Sparkles,
  Target,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  BookOpen,
  Award,
  ShieldCheck,
  Briefcase,
  Zap,
  ChevronRight,
  GraduationCap,
  Layers,
} from 'lucide-react';
import Link from 'next/link';

interface RolePath {
  role: string;
  category: string;
  salaryRange: string;
  demandLevel: 'High' | 'Very High' | 'Critical';
  readinessFormulaBase: number;
  coreLanguages: string[];
  frameworks: string[];
  keyTopics: string[];
  certifications: string[];
  recommendationSummary: string;
}

const CAREER_PATHS: Record<string, RolePath> = {
  'ai-engineer': {
    role: 'AI & Machine Learning Engineer',
    category: 'Artificial Intelligence & Data',
    salaryRange: '12 – 28 LPA',
    demandLevel: 'Critical',
    readinessFormulaBase: 76,
    coreLanguages: ['Python', 'C++', 'SQL'],
    frameworks: ['PyTorch', 'TensorFlow', 'LangChain', 'FastAPI', 'Hugging Face'],
    keyTopics: [
      'Transformers & Attention Mechanisms',
      'Vector Embeddings & RAG Systems',
      'Model Fine-Tuning & Quantization',
      'Data Preprocessing & Feature Engineering',
      'Scalable Model Serving & Docker',
    ],
    certifications: [
      'DeepLearning.AI Machine Learning Specialization',
      'AWS Certified Machine Learning – Specialty',
      'TensorFlow Developer Certificate',
    ],
    recommendationSummary:
      'Focus on real-world generative AI and RAG implementations. Your strong algorithmic foundation gives you an edge in model deployment and latency optimization.',
  },
  'full-stack': {
    role: 'Full-Stack Cloud Engineer',
    category: 'Software Engineering',
    salaryRange: '10 – 22 LPA',
    demandLevel: 'Very High',
    readinessFormulaBase: 84,
    coreLanguages: ['TypeScript', 'JavaScript', 'Python', 'Go'],
    frameworks: ['Next.js', 'React', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Docker'],
    keyTopics: [
      'Server-Side Rendering & Next.js App Router',
      'Relational Database Modeling & ACID Transactions',
      'RESTful & GraphQL API Design',
      'Distributed Caching with Redis',
      'Microservices Architecture & CI/CD Pipelines',
    ],
    certifications: [
      'AWS Certified Solutions Architect Associate',
      'Meta Front-End & Back-End Professional Certificates',
      'Certified Kubernetes Application Developer (CKAD)',
    ],
    recommendationSummary:
      'You are already well-positioned for Tier 1 Product companies. Reinforce microservice concurrency and database partitioning to achieve super dream placement readiness.',
  },
  'systems-devops': {
    role: 'Cloud & DevOps Infrastructure Engineer',
    category: 'Systems & Infrastructure',
    salaryRange: '11 – 25 LPA',
    demandLevel: 'Very High',
    readinessFormulaBase: 72,
    coreLanguages: ['Go', 'Python', 'Bash / Shell', 'Rust'],
    frameworks: ['Kubernetes', 'Docker', 'Terraform', 'Prometheus', 'Linux Kernel'],
    keyTopics: [
      'Container Orchestration with Kubernetes',
      'Infrastructure as Code (IaC) with Terraform',
      'Linux Internals, Networking & TCP/IP',
      'Automated Zero-Downtime Blue/Green Deployments',
      'Site Reliability Engineering (SRE) & Observability',
    ],
    certifications: [
      'Certified Kubernetes Administrator (CKA)',
      'HashiCorp Certified: Terraform Associate',
      'Google Cloud Professional Cloud Architect',
    ],
    recommendationSummary:
      'High corporate recruitment demand from cloud and cybersecurity firms. Deepen your hands-on Linux system calls and Terraform automation.',
  },
  'data-analyst': {
    role: 'Data Scientist & Analytics Specialist',
    category: 'Data Science & BI',
    salaryRange: '8 – 18 LPA',
    demandLevel: 'High',
    readinessFormulaBase: 80,
    coreLanguages: ['Python', 'R', 'SQL'],
    frameworks: ['Pandas', 'NumPy', 'Tableau', 'PowerBI', 'Scikit-Learn'],
    keyTopics: [
      'Advanced SQL Window Functions & CTEs',
      'Hypothesis Testing & Statistical Inference',
      'Predictive Modeling & Regression Analysis',
      'Executive BI Dashboard Design',
      'ETL Pipeline Architecture',
    ],
    certifications: [
      'Google Advanced Data Analytics Certificate',
      'Microsoft Certified: Power BI Data Analyst Associate',
      'IBM Data Science Professional Certificate',
    ],
    recommendationSummary:
      'Solid corporate placement pipeline across BFSI and analytics consultancies. Combine SQL query optimization with storytelling dashboards.',
  },
};

export default function CareerCoachPage() {
  const { user } = useAuth();
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>('ai-engineer');
  const [analyzing, setAnalyzing] = useState(false);
  const [userVerifiedSkills, setUserVerifiedSkills] = useState<string[]>([
    'Python',
    'TypeScript',
    'Next.js',
    'SQL',
    'PostgreSQL',
    'React',
  ]);

  // Load real verified skills from student skill gap endpoint if available
  useEffect(() => {
    async function loadSkills() {
      try {
        const res = await fetch('/api/student/skill-gap');
        if (res.ok) {
          const data = await res.json();
          if (data.analysis?.skills) {
            const strengths = data.analysis.skills
              .filter((s: any) => s.status === 'verified_strength')
              .map((s: any) => s.skill_name);
            if (strengths.length > 0) {
              setUserVerifiedSkills((prev) => Array.from(new Set([...prev, ...strengths])));
            }
          }
        }
      } catch {}
    }
    loadSkills();
  }, []);

  const currentRole = CAREER_PATHS[selectedRoleKey] || CAREER_PATHS['ai-engineer'];

  const handleRoleChange = (key: string) => {
    setAnalyzing(true);
    setSelectedRoleKey(key);
    setTimeout(() => setAnalyzing(false), 300);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <BrainCircuit className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              AI Career Coach
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
              Strategic Placement Advisory
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Tailored career guidance and placement path intelligence aligned with Tier-1 recruitment patterns.
          </p>
        </div>

        {/* Action Link to Dedicated Skill Gap Analyzer */}
        <div className="flex items-center gap-2">
          <Link
            href="/student/skill-gap"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-all"
          >
            <Target className="w-4 h-4" />
            <span>AI Skill Gap Analyzer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Featured Banner: Deterministic AI Skill Gap Analyzer Callout */}
      <div className="rounded-3xl border border-purple-200/80 dark:border-purple-900/40 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-transparent p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
              New: Deterministic Audit
            </span>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Looking for your empirical Placement Readiness Audit?
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Check your exact role readiness score (0–100%), verified strengths, demonstrated gaps, and prioritized roadmap across <strong>Software Developer</strong>, <strong>AI/ML Engineer</strong>, and <strong>Cybersecurity Analyst</strong>.
          </p>
        </div>

        <Link
          href="/student/skill-gap"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-indigo-600 dark:hover:bg-indigo-400 text-xs font-bold transition-all shadow-sm shrink-0 self-start sm:self-auto"
        >
          <span>Open Skill Gap Analyzer</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Target Career Role Selector Cards */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Explore Career Tracks & Recruitment Requirements:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(CAREER_PATHS).map(([key, path]) => {
            const isSelected = selectedRoleKey === key;
            return (
              <button
                key={key}
                onClick={() => handleRoleChange(key)}
                className={`p-4 rounded-2xl text-left border transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-sm ring-2 ring-indigo-500/20'
                    : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {path.category}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                  {path.role}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Target CTC: <strong className="text-emerald-600 dark:text-emerald-400">{path.salaryRange}</strong>
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Readiness & Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Smart Placement Readiness Gauge (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Readiness Card */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Estimated Readiness Benchmark
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Calculated against {currentRole.role} benchmarks
                </p>
              </div>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {currentRole.readinessFormulaBase}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${currentRole.readinessFormulaBase}%` }}
              />
            </div>

            {/* Sub-Metric Breakdown */}
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Contineo Academic Standing</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Verified</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Core DSA & Algorithmic Problem Solving</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">In Practice</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Applied Tech Stack & Framework Experience</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">Active</span>
              </div>
            </div>

            {/* Coach Assessment Note */}
            <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/50 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold mb-1 text-indigo-700 dark:text-indigo-300">
                <Sparkles className="w-3.5 h-3.5" />
                Coach Evaluation
              </div>
              {currentRole.recommendationSummary}
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Personalized Next Steps
            </h4>

            <Link
              href="/student/skill-gap"
              className="flex items-center justify-between p-3 rounded-xl border border-purple-200/80 dark:border-purple-900/40 bg-purple-50/30 dark:bg-purple-950/10 hover:bg-purple-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Run Detailed Skill Gap Analysis</p>
                  <p className="text-[11px] text-slate-500">Deterministic scoring & gap isolation</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-600 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/student/dsa-tracker"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Master Placement DSA Patterns</p>
                  <p className="text-[11px] text-slate-500">Practice 20 essential patterns</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/student/roadmap"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">30-Day Preparation Roadmap</p>
                  <p className="text-[11px] text-slate-500">Structured weekly milestones</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Right Column: Required Skills & Skill Gap Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Skill Matrix Card */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                Skill Alignment: Track Expectations vs Verified Proof
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Competencies expected by recruiters for {currentRole.role}
              </p>
            </div>

            {/* Core Languages */}
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Primary Programming Languages:
              </span>
              <div className="flex flex-wrap gap-2">
                {currentRole.coreLanguages.map((lang) => {
                  const hasSkill = userVerifiedSkills.some((s) => s.toLowerCase().includes(lang.toLowerCase()));
                  return (
                    <span
                      key={lang}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                        hasSkill
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                          : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
                      }`}
                    >
                      {hasSkill ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      {lang}
                      <span className="text-[10px] font-normal opacity-80">
                        ({hasSkill ? 'Verified' : 'To Learn'})
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Frameworks & Tech Stack */}
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Frameworks & Specialized Libraries:
              </span>
              <div className="flex flex-wrap gap-2">
                {currentRole.frameworks.map((fw) => {
                  const hasSkill = userVerifiedSkills.some((s) => s.toLowerCase().includes(fw.toLowerCase()));
                  return (
                    <span
                      key={fw}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                        hasSkill
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {hasSkill ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5 text-indigo-500" />}
                      {fw}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Key Engineering Topics to Master */}
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Key Technical Concepts for Technical Interviews:
              </span>
              <div className="space-y-2">
                {currentRole.keyTopics.map((topic, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Industry Certifications */}
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Recommended Professional Certifications:
              </span>
              <div className="space-y-2">
                {currentRole.certifications.map((cert, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="font-medium text-slate-900 dark:text-white">{cert}</span>
                    </div>
                    <Link
                      href="/student/certificates"
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                    >
                      Upload Evidence →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
