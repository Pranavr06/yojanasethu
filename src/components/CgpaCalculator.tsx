'use client';

import React, { useState } from 'react';
import { calculateTargetSgpa } from '@/lib/rulesEngine';
import { Calculator, CheckCircle, Info } from 'lucide-react';

interface Props {
  currentCgpa: number;
  initialTargetCgpa: number;
  earnedCredits: number;
  totalCredits: number;
}

export default function CgpaCalculator({
  currentCgpa,
  initialTargetCgpa,
  earnedCredits = 120,
  totalCredits = 160,
}: Props) {
  const [targetCgpa, setTargetCgpa] = useState<number>(initialTargetCgpa || 7.5);

  const math = calculateTargetSgpa(currentCgpa, targetCgpa, earnedCredits, totalCredits);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'already_achieved':
      case 'achievable':
        return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30';
      case 'challenging':
        return 'text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/30';
      case 'hard_push':
        return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30';
      case 'impossible':
        return 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30';
      default:
        return 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Contineo Academic Target Planner
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Deterministic credit math (Exam Cell verified)
            </p>
          </div>
        </div>

        <span className="text-[11px] px-2.5 py-1 rounded-full font-medium bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
          Sem 7 & 8 Forecast
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
        {/* Current CGPA */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Current CGPA (Sem 1-6)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-mono">
              {currentCgpa.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ 10.00</span>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-medium">
            <CheckCircle className="w-3 h-3" /> 120 Credits Earned
          </span>
        </div>

        {/* Target Slider */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Target CGPA</span>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono">
              {targetCgpa.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="6.0"
            max="9.5"
            step="0.05"
            value={targetCgpa}
            onChange={(e) => setTargetCgpa(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 my-2"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>6.00</span>
            <span>7.50</span>
            <span>9.50</span>
          </div>
        </div>

        {/* Required SGPA Output */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Required Avg SGPA</span>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold tracking-tight font-mono ${
              math.isAchievable ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {math.requiredSgpa.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              in Sem 7 & 8 ({math.remainingCredits} credits)
            </span>
          </div>
          <div className="mt-1">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getDifficultyColor(
                math.difficulty
              )}`}
            >
              {math.difficulty.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Actionable Advice & Formula Box */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p>{math.advice}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            Formula: Required SGPA = (({targetCgpa.toFixed(2)} × 160) - ({currentCgpa.toFixed(2)} × 120)) / 40
          </p>
        </div>
      </div>
    </div>
  );
}
