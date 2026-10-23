'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import {
  Code2,
  CheckCircle2,
  Circle,
  Search,
  Filter,
  Sparkles,
  Zap,
  Target,
  ExternalLink,
  Flame,
  Award,
  Layers,
  Clock,
  HelpCircle,
  AlertCircle,
  Play,
  RotateCcw,
  BookOpen,
  Building2,
  ShieldCheck,
  Check,
  ChevronRight,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { DSAProblem, DSAAttemptRecord } from '@/types';
import {
  COMPREHENSIVE_DSA_PROBLEMS,
  calculateProblemMastery,
  selectAdaptiveNextProblem,
} from '@/lib/dsaProblemCatalog';

const TARGET_COMPANIES = [
  'All',
  'Google',
  'Amazon',
  'Microsoft',
  'Cisco',
  'Infosys SP',
  'TCS Digital',
  'Nexus AI',
];

function DSATrackerContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams?.get('category') || 'All';
  const initialCompany = searchParams?.get('company') || 'All';
  const initialProblemId = searchParams?.get('problemId') || null;

  const { user } = useAuth();
  const studentId = user?.id || user?.usn || 'demo-student';

  const [problems, setProblems] = useState<DSAProblem[]>(COMPREHENSIVE_DSA_PROBLEMS);
  const [attempts, setAttempts] = useState<Record<string, DSAAttemptRecord>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedCompany, setSelectedCompany] = useState<string>(initialCompany);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [categoryTypeFilter, setCategoryTypeFilter] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  // Active Problem Solving Workspace State
  const [activeProblem, setActiveProblem] = useState<DSAProblem | null>(null);
  const [selectedLang, setSelectedLang] = useState<'python' | 'java' | 'cpp' | 'typescript'>('python');
  const [userCode, setUserCode] = useState<string>('');
  const [revealedHintsCount, setRevealedHintsCount] = useState<number>(0);
  const [showSolutionConfirm, setShowSolutionConfirm] = useState<boolean>(false);
  const [isSolutionRevealed, setIsSolutionRevealed] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    passedTests: number;
    totalTests: number;
    masteryScore: number;
    feedback: string;
    errorMessage?: string;
  } | null>(null);

  // AI Problem Generation State
  const [isGeneratingProblem, setIsGeneratingProblem] = useState<boolean>(false);
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);

  // Load problem attempts from API or localStorage
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/dsa?company=${selectedCompany}&category=${selectedCategory}&studentId=${encodeURIComponent(studentId)}`);
        const data = await res.json();
        if (data.problems) setProblems(data.problems);
        if (data.attempts) setAttempts(data.attempts);
      } catch (err) {
        console.warn('Fallback to local problem catalog:', err);
      }
    }
    loadData();
  }, [selectedCompany, selectedCategory, studentId]);

  // Handle URL deep linking to problem
  useEffect(() => {
    if (initialProblemId) {
      const match = problems.find((p) => p.id === initialProblemId);
      if (match) openProblemWorkspace(match);
    }
  }, [initialProblemId, problems]);

  const openProblemWorkspace = (problem: DSAProblem) => {
    setActiveProblem(problem);
    const existing = attempts[problem.id];
    setUserCode(existing?.code || problem.starter_code[selectedLang] || '');
    setRevealedHintsCount(existing?.hints_used || 0);
    setIsSolutionRevealed(existing?.viewed_solution || false);
    setSubmissionResult(null);
    setShowSolutionConfirm(false);
  };

  const handleLanguageChange = (lang: 'python' | 'java' | 'cpp' | 'typescript') => {
    setSelectedLang(lang);
    if (activeProblem) {
      setUserCode(activeProblem.starter_code[lang] || '');
    }
  };

  const handleRevealNextHint = () => {
    if (activeProblem && revealedHintsCount < activeProblem.hints.length) {
      setRevealedHintsCount((prev) => prev + 1);
    }
  };

  const handleConfirmRevealSolution = () => {
    setIsSolutionRevealed(true);
    setShowSolutionConfirm(false);
  };

  const handleSubmitSolution = async () => {
    if (!activeProblem) return;
    setSubmitting(true);
    setSubmissionResult(null);

    try {
      const res = await fetch('/api/dsa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: activeProblem.id,
          code: userCode,
          language: selectedLang,
          hintsUsed: revealedHintsCount,
          viewedSolution: isSolutionRevealed,
          studentId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmissionResult({
          success: data.isSolved,
          passedTests: data.passedTests,
          totalTests: data.totalTests,
          masteryScore: data.masteryScore,
          feedback: data.feedback,
          errorMessage: data.errorMessage,
        });

        if (data.attempt) {
          setAttempts((prev) => ({
            ...prev,
            [activeProblem.id]: data.attempt,
          }));
        }
      } else {
        setSubmissionResult({
          success: false,
          passedTests: 0,
          totalTests: activeProblem.test_cases.length || 3,
          masteryScore: 0,
          feedback: data.error || 'Execution error during test execution.',
          errorMessage: data.error,
        });
      }
    } catch (err: any) {
      setSubmissionResult({
        success: false,
        passedTests: 0,
        totalTests: 3,
        masteryScore: 0,
        feedback: err.message || 'Network error executing code.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateAIProblem = async () => {
    setIsGeneratingProblem(true);
    setGenerationNotice(null);

    try {
      const res = await fetch('/api/dsa/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: selectedCategory === 'All' ? 'Dynamic Programming' : selectedCategory,
          difficulty: difficultyFilter === 'All' ? 'Medium' : difficultyFilter,
          targetCompany: selectedCompany === 'All' ? 'Google' : selectedCompany,
          studentId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.problem) {
        setProblems((prev) => [data.problem, ...prev]);
        setGenerationNotice(`Generated new ${data.problem.difficulty} problem: "${data.problem.title}"`);
        openProblemWorkspace(data.problem);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingProblem(false);
    }
  };

  // Adaptive recommendation
  const adaptiveNext = selectAdaptiveNextProblem(problems, attempts, selectedCompany);

  // Compute stats
  const solvedCount = Object.values(attempts).filter((a) => a.status === 'solved').length;
  const verifiedCount = problems.filter((p) => p.category_type === 'verified_historical').length;
  const frequentCount = problems.filter((p) => p.category_type === 'frequently_reported').length;
  const aiGenCount = problems.filter((p) => p.category_type === 'ai_generated').length;

  const categories = ['All', ...Array.from(new Set(problems.map((d) => d.category)))];

  const filteredProblems = problems.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesDiff = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
    const matchesType = categoryTypeFilter === 'All' || p.category_type === categoryTypeFilter;
    const matchesComp =
      selectedCompany === 'All' ||
      p.target_companies.some((c) => c.toLowerCase().includes(selectedCompany.toLowerCase()));
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.core_pattern.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesDiff && matchesType && matchesComp && matchesSearch;
  });

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Code2 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Adaptive DSA Tracker & Company Prep
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              Evidence-Based
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Persistent algorithmic mastery tracker. Distinguishes verified interview questions, frequently reported patterns, and AI-generated practice.
          </p>
        </div>

        {/* Global Stats */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateAIProblem}
            disabled={isGeneratingProblem}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGeneratingProblem ? 'Synthesizing...' : 'Generate AI Problem'}</span>
          </button>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-2 rounded-xl shadow-sm text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Problems Solved</span>
            <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
              {solvedCount} / {problems.length}
            </span>
          </div>
        </div>
      </div>

      {generationNotice && (
        <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl text-xs text-purple-700 dark:text-purple-300 flex items-center justify-between">
          <span>{generationNotice}</span>
          <button onClick={() => setGenerationNotice(null)} className="text-purple-500 hover:text-purple-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Adaptive Next Recommendation Banner */}
      <div className="rounded-2xl border border-indigo-200 dark:border-indigo-800/80 bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-white dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-600 text-white">
              Adaptive Next Recommendation
            </span>
            <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
              Rule: {adaptiveNext.adaptiveRuleTriggered}
            </span>
          </div>

          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{adaptiveNext.recommendedProblem.title}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              adaptiveNext.recommendedProblem.difficulty === 'Easy'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                : adaptiveNext.recommendedProblem.difficulty === 'Medium'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
            }`}>
              {adaptiveNext.recommendedProblem.difficulty}
            </span>
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            {adaptiveNext.reason}
          </p>
        </div>

        <button
          onClick={() => openProblemWorkspace(adaptiveNext.recommendedProblem)}
          className="self-start md:self-center shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Solve Recommended Problem</span>
        </button>
      </div>

      {/* Target Company Selector & 3-Tier Categorization */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Target Company Preparation</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select your focus campus recruitment drive to prioritize relevant coding rounds.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
              Verified Reported: {verifiedCount}
            </span>
            <span className="text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
              Frequent Patterns: {frequentCount}
            </span>
            <span className="text-[11px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800">
              AI-Generated: {aiGenCount}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {TARGET_COMPANIES.map((company) => {
            const isSelected = selectedCompany === company;
            return (
              <button
                key={company}
                onClick={() => setSelectedCompany(company)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                {company}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search problems or patterns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Category */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Difficulty */}
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
        >
          <option value="All">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        {/* Source Category Type */}
        <select
          value={categoryTypeFilter}
          onChange={(e) => setCategoryTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
        >
          <option value="All">All 3 Categories</option>
          <option value="verified_historical">Verified Historical Reported</option>
          <option value="frequently_reported">Frequently Reported Patterns</option>
          <option value="ai_generated">AI-Generated Practice</option>
        </select>
      </div>

      {/* Problem Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProblems.map((problem) => {
          const attempt = attempts[problem.id];
          const isSolved = attempt?.status === 'solved';
          const mastery = attempt?.mastery_score || 0;

          return (
            <div
              key={problem.id}
              onClick={() => openProblemWorkspace(problem)}
              className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-700 transition-all cursor-pointer shadow-sm hover:shadow-md space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Category Type Badge */}
                    {problem.category_type === 'verified_historical' ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Verified Historical</span>
                      </span>
                    ) : problem.category_type === 'ai_generated' ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>AI-Generated</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        <span>Frequent Pattern</span>
                      </span>
                    )}

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      problem.difficulty === 'Easy'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        : problem.difficulty === 'Medium'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                    }`}>
                      {problem.difficulty}
                    </span>

                    <span className="text-[10px] font-semibold text-slate-400">
                      {problem.category}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white pt-1">
                    {problem.title}
                  </h4>
                </div>

                {/* Solved Status Indicator */}
                {isSolved ? (
                  <div className="flex flex-col items-end shrink-0">
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{mastery}% Mastery</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {attempt.hints_used > 0 ? `${attempt.hints_used} hint(s)` : 'Independent'}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0">
                    <Circle className="w-3.5 h-3.5" />
                    <span>Unsolved</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                {problem.statement}
              </p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Pattern: <strong className="text-slate-700 dark:text-slate-300">{problem.core_pattern}</strong></span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                  <span>Solve in Workspace</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Problem Solving Modal Workspace */}
      {activeProblem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <Code2 className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {activeProblem.title}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      activeProblem.difficulty === 'Easy'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : activeProblem.difficulty === 'Medium'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}>
                      {activeProblem.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {activeProblem.category} • Core Pattern: {activeProblem.core_pattern}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveProblem(null)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Left Statement & Right Code Editor */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
              {/* Left Pane: Statement, Examples, Hints (5 cols) */}
              <div className="lg:col-span-5 p-5 space-y-4 overflow-y-auto text-xs">
                {/* Source attribution callout */}
                {activeProblem.source_attribution && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[11px]">
                    <strong>Source Attribution:</strong> {activeProblem.source_attribution}
                    {activeProblem.source_url && (
                      <a
                        href={activeProblem.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 ml-1 font-semibold"
                      >
                        [Report Source <ExternalLink className="w-3 h-3 inline" />]
                      </a>
                    )}
                  </div>
                )}

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                    Problem Statement
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {activeProblem.statement}
                  </p>
                </div>

                {/* Examples */}
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-2">
                    Examples
                  </h4>
                  <div className="space-y-2">
                    {activeProblem.examples.map((ex, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/70 font-mono text-[11px] space-y-1">
                        <div><strong className="text-slate-500">Input:</strong> {ex.input}</div>
                        <div><strong className="text-slate-500">Output:</strong> {ex.output}</div>
                        {ex.explanation && (
                          <div className="font-sans text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                            {ex.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progressive Hints Section */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                      <span>Progressive Hints ({revealedHintsCount}/{activeProblem.hints.length})</span>
                    </h4>

                    {revealedHintsCount < activeProblem.hints.length && (
                      <button
                        onClick={handleRevealNextHint}
                        className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                      >
                        Reveal Hint {revealedHintsCount + 1}
                      </button>
                    )}
                  </div>

                  {revealedHintsCount === 0 && (
                    <p className="text-[11px] text-slate-400">
                      Hints reveal algorithmic strategy step-by-step. Solving independently yields maximum 100% mastery.
                    </p>
                  )}

                  {activeProblem.hints.slice(0, revealedHintsCount).map((hint, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-200">
                      <strong>Hint {idx + 1}:</strong> {hint}
                    </div>
                  ))}
                </div>

                {/* Solution View & Penalty Gate */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  {!isSolutionRevealed && !showSolutionConfirm && (
                    <button
                      onClick={() => setShowSolutionConfirm(true)}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline"
                    >
                      View Reference Solution & Complexity Analysis
                    </button>
                  )}

                  {showSolutionConfirm && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-800 dark:text-rose-200 space-y-2">
                      <p>
                        <strong>Warning:</strong> Viewing the official reference solution caps maximum problem mastery at 50% and logs this attempt as guided.
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleConfirmRevealSolution}
                          className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold"
                        >
                          Confirm & View Solution
                        </button>
                        <button
                          onClick={() => setShowSolutionConfirm(false)}
                          className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {isSolutionRevealed && (
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-[11px] space-y-2">
                      <div className="flex items-center justify-between text-slate-400 font-sans">
                        <span>Official Reference ({selectedLang})</span>
                        <span>Time: {activeProblem.time_complexity} • Space: {activeProblem.space_complexity}</span>
                      </div>
                      <pre className="overflow-x-auto text-emerald-400">
                        {activeProblem.reference_solution[selectedLang] || '// Reference solution unavailable'}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Pane: Code Editor & Test Runner (7 cols) */}
              <div className="lg:col-span-7 flex flex-col bg-slate-950 text-white">
                {/* Editor Bar */}
                <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {(['python', 'java', 'cpp', 'typescript'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => handleLanguageChange(lang)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                          selectedLang === lang
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setUserCode(activeProblem.starter_code[selectedLang] || '')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                    title="Reset to starter code"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Code Textarea */}
                <div className="flex-1 p-3">
                  <textarea
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    placeholder="// Write your algorithmic solution here..."
                    className="w-full h-80 lg:h-96 bg-transparent text-emerald-400 font-mono text-xs focus:outline-none resize-none leading-relaxed"
                    spellCheck={false}
                  />
                </div>

                {/* Test Results Output */}
                {submissionResult && (
                  <div className={`p-4 border-t ${
                    submissionResult.success
                      ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                      : 'bg-rose-950/60 border-rose-800 text-rose-200'
                  } text-xs space-y-1`}>
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        {submissionResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                        <span>{submissionResult.feedback}</span>
                      </span>
                      <span>Mastery: {submissionResult.masteryScore}%</span>
                    </div>
                    {submissionResult.errorMessage && (
                      <p className="font-mono text-[11px] text-rose-300">
                        {submissionResult.errorMessage}
                      </p>
                    )}
                  </div>
                )}

                {/* Modal Footer */}
                <div className="p-3 border-t border-slate-800 flex items-center justify-between bg-slate-900/60">
                  <div className="text-[11px] text-slate-400">
                    {activeProblem.test_cases.length} deterministic test cases loaded
                  </div>

                  <button
                    onClick={handleSubmitSolution}
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Running Tests...' : 'Run & Submit Code'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DSATrackerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading DSA Tracker...</div>}>
      <DSATrackerContent />
    </Suspense>
  );
}
