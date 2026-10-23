'use client';

import React, { useState } from 'react';
import {
  X,
  FileSearch,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tag,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetRole: string;
}

export default function ResumeAnalyzerModal({ isOpen, onClose, targetRole }: Props) {
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, targetRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze resume');
      setAnalysis(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl glass-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                AI Resume & Skill Gap Parser
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audits resume text for verifiable evidence vs unverified claims
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Text Input Area */}
        <div className="my-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Resume Content / Extracted PDF Text
            </label>
            {resumeText && (
              <button
                type="button"
                onClick={() => setResumeText('')}
                className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
              >
                Clear text
              </button>
            )}
          </div>
          <textarea
            rows={6}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste candidate resume text or project descriptions to analyze against industry requirements..."
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-300 focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || !resumeText.trim()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Resume Language & Verifying Proof...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Analyze Skills & Find Role Gaps for {targetRole}</span>
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Analysis Results Display */}
        {analysis && (
          <div className="mt-5 space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800 animate-in fade-in">
            {/* AI Summary */}
            <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/30 text-xs text-purple-900 dark:text-purple-200">
              <span className="font-bold text-purple-900 dark:text-white block mb-1">
                AI Audit Summary:
              </span>
              <p>{analysis.ai_summary}</p>
            </div>

            {/* Extracted Skills: Claimed vs Evidenced */}
            <div>
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Extracted Skills & Verification Status:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {analysis.detected_skills.map((s: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-slate-900 dark:text-white">{s.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        s.status === 'evidenced'
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                          : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                      }`}
                    >
                      {s.status === 'evidenced' ? 'Evidenced' : 'Self-Declared'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Gaps for Target Role */}
            {analysis.identified_gaps && analysis.identified_gaps.length > 0 && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 text-xs">
                <span className="font-bold text-rose-800 dark:text-rose-300 block mb-1">
                  Critical Skill Gaps for {targetRole}:
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {analysis.identified_gaps.map((gap: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-500/30 font-semibold"
                    >
                      {gap}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
