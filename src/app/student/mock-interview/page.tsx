'use client';

import React from 'react';
import Link from 'next/link';
import MockInterviewAssistant from '@/components/student/MockInterviewAssistant';
import { ArrowLeft, Bot, Sparkles, ShieldCheck } from 'lucide-react';

export default function StudentMockInterviewPage() {
  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <Link
            href="/student"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors shadow-sm"
            title="Return to Student Career Workspace"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
                <Bot className="w-3.5 h-3.5" />
                AI Career Simulation
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                NexusAI Placement Engine
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Autonomous AI Voice Mock Interviewer
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Voice & Audio AI Active</span>
          </span>
        </div>
      </div>

      {/* Main Assistant Component */}
      <MockInterviewAssistant />
    </div>
  );
}
