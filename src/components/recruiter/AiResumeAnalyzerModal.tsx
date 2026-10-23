'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Loader2,
  ShieldCheck,
  RefreshCw,
  Award,
  GraduationCap,
  Briefcase,
  Layers,
  ArrowRight,
  Info,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import type { FullStudentProfile, PlacementDrive } from '@/types';
import type { ResumeAnalysisResult } from '@/app/api/analyze-resume/route';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  student: FullStudentProfile;
  drive?: PlacementDrive;
  resumeUrl?: string;
  resumeFileName?: string;
}

export default function AiResumeAnalyzerModal({
  isOpen,
  onClose,
  student,
  drive,
  resumeUrl,
  resumeFileName,
}: Props) {
  const [activeTab, setActiveTab] = useState<'split' | 'resume' | 'analysis'>('split');
  const [analysis, setAnalysis] = useState<ResumeAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { profile } = student;
  const targetRole = drive?.role_title || 'AI/ML & Full Stack Specialist';
  const companyName = drive?.company_name || 'Placement Partner';

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student,
          drive,
          targetRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze candidate resume.');
      }

      setAnalysis(data);
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
      setError(err.message || 'Unable to complete AI resume audit.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAnalysis();
    }
  }, [isOpen, student.profile.id, drive?.id]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-analyzer-title"
        className={`flex flex-col w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden transition-all ${
          isFullscreen ? 'w-full h-full rounded-none' : 'max-w-7xl h-[92vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  id="ai-analyzer-title"
                  className="text-base font-bold text-slate-900 dark:text-white"
                >
                  AI Resume & Skill Gap Analyzer
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                  {companyName} • {targetRole}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Candidate: <span className="font-semibold text-slate-800 dark:text-slate-200">{profile.full_name}</span> ({profile.usn})
              </p>
            </div>
          </div>

          {/* Center Tabs for Small Screens */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 text-xs font-semibold lg:hidden">
            <button
              onClick={() => setActiveTab('split')}
              className={`px-2.5 py-1 rounded-lg ${activeTab === 'split' ? 'bg-white dark:bg-slate-900 shadow-sm text-purple-600' : 'text-slate-500'}`}
            >
              Split
            </button>
            <button
              onClick={() => setActiveTab('resume')}
              className={`px-2.5 py-1 rounded-lg ${activeTab === 'resume' ? 'bg-white dark:bg-slate-900 shadow-sm text-purple-600' : 'text-slate-500'}`}
            >
              Resume
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-2.5 py-1 rounded-lg ${activeTab === 'analysis' ? 'bg-white dark:bg-slate-900 shadow-sm text-purple-600' : 'text-slate-500'}`}
            >
              Analysis
            </button>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchAnalysis}
              title="Re-run AI Analysis"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:block"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Analyzer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Wide Split-Screen Body */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
          {/* ========================================================
              LEFT PANEL: SCROLLABLE RESUME PDF VIEWER (50% on desktop)
             ======================================================== */}
          <div
            className={`w-full lg:w-1/2 flex flex-col h-full bg-slate-100 dark:bg-slate-950 overflow-hidden ${
              activeTab === 'analysis' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* PDF Viewer Mini Header */}
            <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span className="font-semibold truncate max-w-xs">{resumeFileName || 'Candidate Official Resume Document'}</span>
              </div>
              {resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-semibold"
                >
                  <span>Open PDF in Tab</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Scrollable PDF Iframe */}
            <div className="flex-1 w-full h-full relative">
              {resumeUrl ? (
                <iframe
                  src={`${resumeUrl}#toolbar=1&navpanes=0`}
                  title={`${profile.full_name} Resume PDF`}
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <FileText className="w-12 h-12 text-slate-400 mb-3" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No PDF Document Attached
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    AI analysis is evaluating candidate qualifications against Contineo ERP academic records and verified skill passports.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================
              RIGHT PANEL: AI RESUME & SKILL AUDIT (50% on desktop)
             ======================================================== */}
          <div
            className={`w-full lg:w-1/2 flex flex-col h-full bg-white dark:bg-slate-900 overflow-y-auto p-5 space-y-5 ${
              activeTab === 'resume' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* AI Status / Provider Banner */}
            {analysis && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  analysis.ai_status === 'gemini_live'
                    ? 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-500/30 text-purple-900 dark:text-purple-200'
                    : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-200'
                }`}
              >
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">
                    {analysis.ai_status === 'gemini_live'
                      ? '⚡ Live Gemini Intelligence Engine'
                      : 'ℹ️ Deterministic ERP & Proof Parser (Gemini Key Unconfigured)'}
                  </span>
                  <p className="text-[11px] mt-0.5 opacity-90">{analysis.provider_note}</p>
                </div>
              </div>
            )}

            {loading ? (
              <div className="py-24 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Parsing resume language & cross-auditing verified faculty proof...
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Extracting skills, comparing against {companyName} requirements, and checking Contineo ERP criteria.
                </p>
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={fetchAnalysis}
                  className="px-3 py-1 rounded-lg bg-rose-600 text-white font-semibold text-xs"
                >
                  Retry
                </button>
              </div>
            ) : analysis ? (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* 1. Decision Header: Evidence Match vs Hard Eligibility */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Evidence Match Score
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold font-mono text-purple-600 dark:text-purple-400">
                        {analysis.match_summary.match_score}%
                      </span>
                      <span className="text-[11px] text-slate-500">Criteria Fit</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      2x Mentor-verified proof weight
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Contineo ERP Gate
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xl font-extrabold px-3 py-0.5 rounded-lg ${
                          analysis.match_summary.eligibility_gate === 'PASS'
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                            : 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30'
                        }`}
                      >
                        {analysis.match_summary.eligibility_gate}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1 truncate">
                      {analysis.match_summary.eligibility_reason}
                    </span>
                  </div>
                </div>

                {/* 2. Executive Resume Summary */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                    Resume Summary
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {analysis.resume_summary}
                  </p>
                </div>

                {/* 3. Job Requirements Comparison (Drive Alignment) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-purple-500" />
                      Placement Drive Requirements Audit: {targetRole}
                    </h3>
                  </div>

                  {/* Matched Skills */}
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block mb-1.5">
                      ✓ Supported & Matched Skills ({analysis.job_requirement_comparison.matched_skills.length}):
                    </span>
                    <div className="space-y-1.5">
                      {analysis.job_requirement_comparison.matched_skills.map((skill, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 flex items-start justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 dark:text-white">{skill.name}</span>
                              <span
                                className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                                  skill.status === 'mentor_verified'
                                    ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                                }`}
                              >
                                {skill.status === 'mentor_verified' ? 'Faculty Verified' : 'Self-Declared'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">{skill.supporting_evidence}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 capitalize shrink-0 font-medium">{skill.importance}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  {analysis.job_requirement_comparison.missing_requirements.length > 0 && (
                    <div>
                      <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 block mb-1.5">
                        ✕ Requirements Not Found in Resume ({analysis.job_requirement_comparison.missing_requirements.length}):
                      </span>
                      <div className="space-y-1.5">
                        {analysis.job_requirement_comparison.missing_requirements.map((missing, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg border border-rose-200 dark:border-rose-950/50 bg-rose-50/40 dark:bg-rose-950/10 flex items-start justify-between gap-2 text-xs"
                          >
                            <div>
                              <span className="font-bold text-rose-800 dark:text-rose-300">{missing.name}</span>
                              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">{missing.note}</p>
                            </div>
                            <span className="text-[10px] text-rose-400 uppercase font-bold shrink-0">{missing.importance}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Transferable Skills */}
                  {analysis.job_requirement_comparison.transferable_skills.length > 0 && (
                    <div>
                      <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 block mb-1.5">
                        ↔ Transferable & Related Competencies:
                      </span>
                      <div className="space-y-1.5">
                        {analysis.job_requirement_comparison.transferable_skills.map((ts, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg border border-indigo-200 dark:border-indigo-950/50 bg-indigo-50/40 dark:bg-indigo-950/10 text-xs"
                          >
                            <div className="flex items-center gap-1.5 font-bold text-indigo-900 dark:text-indigo-300">
                              <span>{ts.candidate_skill}</span>
                              <ArrowRight className="w-3 h-3 text-indigo-500" />
                              <span>{ts.required_counterpart}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">{ts.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Extracted Skills: Explicit vs Inferred vs Soft */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    Extracted Candidate Skills Inventory
                  </h3>

                  {/* Explicit Technical */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Explicitly Claimed Technical Skills:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.extracted_skills.explicit_technical.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Inferred Skills */}
                  {analysis.extracted_skills.inferred_skills.length > 0 && (
                    <div>
                      <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 block mb-1">
                        Inferred from Project Evidence & Architecture:
                      </span>
                      <div className="space-y-1">
                        {analysis.extracted_skills.inferred_skills.map((inf, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/20 text-xs flex items-center justify-between"
                          >
                            <span className="font-semibold text-purple-900 dark:text-purple-300">{inf.name}</span>
                            <span className="text-[10px] text-slate-500">{inf.inferred_from}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Verified Education & Academics */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                    Education (Contineo ERP Verified)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400">Degree</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{analysis.education.degree}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Branch</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{analysis.education.branch}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">CGPA</p>
                      <p className="font-mono font-bold text-slate-900 dark:text-white">
                        {analysis.education.cgpa ? `${analysis.education.cgpa.toFixed(2)} / 10.0` : 'Not recorded'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Institution</p>
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{analysis.education.institution}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Graduation Year</p>
                      <p className="font-semibold text-slate-900 dark:text-white">{analysis.education.graduation_year || '2026'}</p>
                    </div>
                  </div>
                </div>

                {/* 6. Projects & Contributions */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                    Projects & Verifiable Repositories ({analysis.projects.length})
                  </h3>
                  <div className="space-y-2">
                    {analysis.projects.map((proj, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">{proj.title}</span>
                          {proj.evidence_url && (
                            <a
                              href={proj.evidence_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-semibold text-[11px]"
                            >
                              <span>View Code</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {proj.technologies.map((t, ti) => (
                            <span key={ti} className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono">
                              {t}
                            </span>
                          ))}
                        </div>
                        {proj.contribution && (
                          <p className="text-[11px] text-slate-500 mt-1">{proj.contribution}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 7. Certifications */}
                {analysis.internships_and_certifications.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-indigo-500" />
                      Certificates & Credentials
                    </h3>
                    <div className="space-y-1.5">
                      {analysis.internships_and_certifications.map((c, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs flex items-center justify-between"
                        >
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white">{c.title}</span>
                            <span className="text-slate-500 text-[11px] block">{c.issuer}</span>
                          </div>
                          {c.credential_url && (
                            <a
                              href={c.credential_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:underline text-[11px] flex items-center gap-1 font-semibold"
                            >
                              Verify <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 8. Ethical AI Disclaimer & Scoring Criteria */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
                  <p>
                    <strong className="text-slate-700 dark:text-slate-300">Scoring Framework:</strong> {analysis.match_summary.scoring_criteria}
                  </p>
                  <p className="italic text-slate-400">
                    {analysis.match_summary.advisory_disclaimer}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
