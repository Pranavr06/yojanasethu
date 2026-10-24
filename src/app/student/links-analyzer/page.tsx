'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  Github,
  Linkedin,
  Code2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Save,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Layers,
  Target,
  FileText,
  Calendar,
  BookOpen,
  Award,
  TrendingUp,
  X,
  Loader2,
  Check,
  Terminal,
} from 'lucide-react';
import { LinksAnalysisReport, StudentProfileLinks } from '@/types';

const TARGET_ROLE_PRESETS = [
  'Software Development Engineer',
  'Full Stack Engineer',
  'AI/ML Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'Cloud & DevOps Engineer',
  'Data Engineer',
  'Cybersecurity Analyst',
];

export default function LinksAnalyzerPage() {
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [leetcodeUrl, setLeetcodeUrl] = useState('');
  const [targetRole, setTargetRole] = useState('Software Development Engineer');
  const [customRole, setCustomRole] = useState('');
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [showJdInput, setShowJdInput] = useState(false);

  // Loading & State
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Analysis Result
  const [report, setReport] = useState<LinksAnalysisReport | null>(null);
  const [activePlatformTab, setActivePlatformTab] = useState<'all' | 'linkedin' | 'github' | 'leetcode'>('all');

  // Load existing shared links and existing analysis report
  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoadingLinks(true);
        const [linksRes, reportRes] = await Promise.all([
          fetch('/api/student/links'),
          fetch('/api/student/links/analyze'),
        ]);

        if (linksRes.ok) {
          const linksData = await linksRes.json();
          if (linksData.links) {
            setLinkedinUrl(linksData.links.linkedin_url || '');
            setGithubUrl(linksData.links.github_url || '');
            setLeetcodeUrl(linksData.links.leetcode_url || '');
            if (linksData.links.target_role) {
              if (TARGET_ROLE_PRESETS.includes(linksData.links.target_role)) {
                setTargetRole(linksData.links.target_role);
                setIsCustomRole(false);
              } else {
                setCustomRole(linksData.links.target_role);
                setIsCustomRole(true);
              }
            }
          }
        }

        if (reportRes.ok) {
          const reportData = await reportRes.json();
          if (reportData.hasReport && reportData.report) {
            setReport(reportData.report);
          }
        }
      } catch (err) {
        console.error('Failed to load initial links data:', err);
      } finally {
        setIsLoadingLinks(false);
      }
    }

    loadInitialData();
  }, []);

  const effectiveRole = isCustomRole ? customRole || 'Software Development Engineer' : targetRole;

  // Save Links to Shared Storage
  const handleSaveLinks = async () => {
    try {
      setIsSaving(true);
      setErrorMsg(null);
      const res = await fetch('/api/student/links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkedin_url: linkedinUrl,
          github_url: githubUrl,
          leetcode_url: leetcodeUrl,
          target_role: effectiveRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save profile links');

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving profile links');
    } finally {
      setIsSaving(false);
    }
  };

  // Run AI Links Analysis
  const handleAnalyzeLinks = async () => {
    if (!linkedinUrl && !githubUrl && !leetcodeUrl) {
      setErrorMsg('Please enter at least one profile link (LinkedIn, GitHub, or LeetCode) to analyze.');
      return;
    }

    try {
      setIsAnalyzing(true);
      setErrorMsg(null);

      const res = await fetch('/api/student/links/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkedin_url: linkedinUrl,
          github_url: githubUrl,
          leetcode_url: leetcodeUrl,
          target_role: effectiveRole,
          target_job_description: jobDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze links');

      if (data.report) {
        setReport(data.report);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error running AI Links analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* ===================================================================== */}
      {/* 1. HEADER & BREADCRUMBS */}
      {/* ===================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
            <Link href="/student" className="hover:text-indigo-600 transition-colors">
              Student Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Links Analyzer</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 shadow-sm">
              <ExternalLink className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Links Analyzer & Profile Auditor
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  AI Powered
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Audit your LinkedIn, GitHub, and LeetCode profiles against hiring benchmarks for your target role.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/student/resume-builder"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
            title="Open Resume Builder using synced profile links"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-500" />
            <span>Open AI Resume Builder</span>
          </Link>

          <button
            onClick={handleSaveLinks}
            disabled={isSaving || isLoadingLinks}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 text-slate-800 dark:text-slate-200 shadow-sm transition-all disabled:opacity-50"
            title="Save links to shared profile storage"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
            ) : saveSuccess ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Save className="w-3.5 h-3.5 text-blue-500" />
            )}
            <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Links'}</span>
          </button>

          <button
            onClick={handleAnalyzeLinks}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Auditing Profiles...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Analyze Links</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Shared Storage Info Banner */}
      <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="text-slate-700 dark:text-slate-300">
            <strong>Shared Source of Truth:</strong> Profile links saved here automatically sync with your AI Resume Builder. Analysis recommendations are for your review only and will never alter your resume or external profiles without permission.
          </span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. PROFILE LINKS INPUT & TARGET ROLE CONFIGURATION */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Links Inputs Card (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-blue-500" />
              <span>Developer Profile Links</span>
            </h2>
            <span className="text-[11px] text-slate-400">
              Enter whichever links you have (none are mandatory)
            </span>
          </div>

          <div className="space-y-3.5">
            {/* 1. LinkedIn URL */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                <span>LinkedIn Profile URL</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/your-profile"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
                {linkedinUrl && (
                  <button
                    onClick={() => setLinkedinUrl('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 2. GitHub URL */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                <Github className="w-3.5 h-3.5 text-slate-800 dark:text-white" />
                <span>GitHub Portfolio URL</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://github.com/your-username"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
                {githubUrl && (
                  <button
                    onClick={() => setGithubUrl('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 3. LeetCode / Coding Platform URL */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                <Code2 className="w-3.5 h-3.5 text-amber-500" />
                <span>LeetCode / Coding Platform URL</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://leetcode.com/your-username (or Codeforces/HackerRank)"
                  value={leetcodeUrl}
                  onChange={(e) => setLeetcodeUrl(e.target.value)}
                  className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
                {leetcodeUrl && (
                  <button
                    onClick={() => setLeetcodeUrl('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Target Job Description Toggle */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowJdInput(!showJdInput)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{showJdInput ? 'Hide Job Description' : '+ Add Target Job Description (Optional)'}</span>
            </button>
            {showJdInput && (
              <textarea
                rows={3}
                placeholder="Paste the target job description or requirements here to tailor the profile audit..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="mt-2 w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />
            )}
          </div>
        </div>

        {/* Right: Target Role Selection (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" />
              <span>Target Role Benchmark</span>
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
              Campus 2026
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Profiles are evaluated against hiring expectations for this specific discipline.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TARGET_ROLE_PRESETS.slice(0, 6).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => {
                  setTargetRole(role);
                  setIsCustomRole(false);
                }}
                className={`p-2.5 rounded-xl text-left border text-xs font-medium transition-all ${
                  !isCustomRole && targetRole === role
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{role}</span>
                  {!isCustomRole && targetRole === role && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Custom Role Input */}
          <div
            onClick={() => setIsCustomRole(true)}
            className={`p-2.5 rounded-xl border text-xs transition-all ${
              isCustomRole
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40'
            }`}
          >
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Custom Role
            </label>
            <input
              type="text"
              placeholder="e.g. Distributed Systems Engineer"
              value={customRole}
              onChange={(e) => {
                setCustomRole(e.target.value);
                setIsCustomRole(true);
              }}
              className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-white outline-none"
            />
          </div>

          <button
            onClick={handleAnalyzeLinks}
            disabled={isAnalyzing}
            className="w-full mt-2 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Multi-Platform Audit...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Profile Audit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. STRUCTURED AI ANALYSIS REPORT */}
      {/* ===================================================================== */}
      {report && (
        <div className="space-y-6 animate-in fade-in">
          {/* Executive Assessment Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/25 shrink-0">
                  {report.overall_assessment.readiness_score}%
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Profile Hiring Readiness: {report.overall_assessment.visibility_rating}
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      Target: {report.target_role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Analyzed at {new Date(report.analyzed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Provider: {report.ai_provider === 'gemini' ? 'Gemini 2.5 Flash' : 'Benchmark Engine'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAnalyzeLinks}
                  disabled={isAnalyzing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>Reanalyze</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {report.overall_assessment.executive_summary}
            </p>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span>
                <strong>Key Takeaway:</strong> {report.overall_assessment.key_takeaway}
              </span>
            </div>
          </div>

          {/* Tri-Column Summary: Strengths, Missing Info, Improvement Areas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Strengths */}
            <div className="p-5 rounded-3xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Observed Strengths ({report.strengths.length})</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {report.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold shrink-0">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Missing Information */}
            <div className="p-5 rounded-3xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/20 dark:bg-amber-950/10 space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Missing Profiles / Sections ({report.missing_information.length})</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {report.missing_information.map((m, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold shrink-0">•</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvement Areas */}
            <div className="p-5 rounded-3xl border border-blue-200 dark:border-blue-800/50 bg-blue-50/20 dark:bg-blue-950/10 space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Priority Action Areas ({report.improvement_areas.length})</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {report.improvement_areas.map((imp, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-blue-600 font-bold shrink-0">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Platform-Specific Tabs */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 max-w-xl">
              <button
                onClick={() => setActivePlatformTab('all')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activePlatformTab === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All Platforms
              </button>
              <button
                onClick={() => setActivePlatformTab('linkedin')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activePlatformTab === 'linkedin'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                <span>LinkedIn</span>
              </button>
              <button
                onClick={() => setActivePlatformTab('github')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activePlatformTab === 'github'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Github className="w-3.5 h-3.5 text-slate-800 dark:text-white" />
                <span>GitHub</span>
              </button>
              <button
                onClick={() => setActivePlatformTab('leetcode')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activePlatformTab === 'leetcode'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-amber-500" />
                <span>LeetCode</span>
              </button>
            </div>

            {/* Platform Deep-Dive Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 1. LinkedIn Card */}
              {(activePlatformTab === 'all' || activePlatformTab === 'linkedin') && (
                <div className={`p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3.5 ${activePlatformTab !== 'all' ? 'lg:col-span-3' : ''}`}>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
                        <Linkedin className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">LinkedIn Analysis</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      report.linkedin_analysis?.status === 'accessible'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {report.linkedin_analysis?.status === 'accessible' ? 'Evaluated' : 'Not Provided'}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Headline Critique
                      </span>
                      <p className="text-slate-700 dark:text-slate-300">
                        {report.linkedin_analysis?.headline_critique}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        About / Summary Structure
                      </span>
                      <p className="text-slate-700 dark:text-slate-300">
                        {report.linkedin_analysis?.summary_critique}
                      </p>
                    </div>

                    {report.linkedin_analysis?.missing_sections && report.linkedin_analysis.missing_sections.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
                          Missing Sections & Gaps
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                          {report.linkedin_analysis.missing_sections.map((sec, i) => (
                            <li key={i}>{sec}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {report.linkedin_analysis?.actionable_tips && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                          Actionable Recommendations
                        </span>
                        <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                          {report.linkedin_analysis.actionable_tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. GitHub Card */}
              {(activePlatformTab === 'all' || activePlatformTab === 'github') && (
                <div className={`p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3.5 ${activePlatformTab !== 'all' ? 'lg:col-span-3' : ''}`}>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white">
                        <Github className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">GitHub Portfolio</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      report.github_analysis?.status === 'accessible'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {report.github_analysis?.status === 'accessible' ? 'Evaluated' : 'Not Provided'}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Portfolio Completeness
                      </span>
                      <p className="text-slate-700 dark:text-slate-300">
                        {report.github_analysis?.portfolio_completeness}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        README & Documentation Standards
                      </span>
                      <p className="text-slate-700 dark:text-slate-300">
                        {report.github_analysis?.readme_documentation_critique}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Code Quality & Stack Depth
                      </span>
                      <p className="text-slate-700 dark:text-slate-300">
                        {report.github_analysis?.code_quality_and_stack}
                      </p>
                    </div>

                    {report.github_analysis?.actionable_tips && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
                          Actionable Recommendations
                        </span>
                        <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                          {report.github_analysis.actionable_tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. LeetCode / Coding Platform Card */}
              {(activePlatformTab === 'all' || activePlatformTab === 'leetcode') && (
                <div className={`p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3.5 ${activePlatformTab !== 'all' ? 'lg:col-span-3' : ''}`}>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
                        <Code2 className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">LeetCode / Coding Platform</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      report.leetcode_analysis?.status === 'accessible'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {report.leetcode_analysis?.status === 'accessible' ? 'Evaluated' : 'Not Provided'}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Problem Solving Tier
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">
                        {report.leetcode_analysis?.problem_solving_tier}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Difficulty Ratio Critique
                      </span>
                      <p className="text-slate-700 dark:text-slate-300">
                        {report.leetcode_analysis?.difficulty_distribution_critique}
                      </p>
                    </div>

                    {report.leetcode_analysis?.dsa_preparation_gaps && report.leetcode_analysis.dsa_preparation_gaps.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 block mb-1">
                          DSA Gaps to Remediate
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {report.leetcode_analysis.dsa_preparation_gaps.map((gap, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 font-medium text-[11px]">
                              {gap}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {report.leetcode_analysis?.actionable_tips && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
                          Actionable Practice Tips
                        </span>
                        <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                          {report.leetcode_analysis.actionable_tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Personalized 4-Week Step-by-Step Improvement Roadmap */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Personalized 4-Week Profile & Placement Roadmap
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Step-by-step milestones to optimize candidate visibility prior to campus hiring drives.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {report.personalized_roadmap.map((phase) => (
                <div
                  key={phase.week}
                  className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      Week {phase.week}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    {phase.phase_title}
                  </h4>
                  <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                    {phase.tasks.map((task, tIdx) => (
                      <li key={tIdx} className="flex items-start gap-1.5">
                        <span className="text-blue-500 font-bold shrink-0">•</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Resume Builder Call-to-Action */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Ready to transform these substantiated links and projects into a polished resume?
              </span>
              <Link
                href="/student/resume-builder"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all shrink-0 self-start sm:self-auto"
              >
                <span>Generate Resume with Synced Links</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
