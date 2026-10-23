'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { useTheme } from '@/lib/themeContext';
import {
  Compass,
  Clock,
  ShieldAlert,
  ArrowLeft,
  LogOut,
  Sun,
  Moon,
  MailCheck,
} from 'lucide-react';

export default function PendingApprovalPage() {
  const { signOut, user, supabaseUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const email = user?.email || supabaseUser?.email || 'your account email';
  const role = user?.role || supabaseUser?.user_metadata?.role || 'privileged role';

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-8 px-4">
      {/* Top right theme toggle */}
      <div className="w-full max-w-md flex justify-end mb-4">
        <button
          onClick={toggleTheme}
          type="button"
          aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl bg-white/95 dark:bg-slate-900/90 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto mb-4 shadow-lg shadow-amber-500/10">
          <Clock className="w-7 h-7 animate-pulse" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Role Approval Pending
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          YojanaSethu Role-Based Access Control
        </p>

        <div className="my-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-left space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Registered Email:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
              {email}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Requested Access:</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400 capitalize">
              {role}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Current Status:</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
              Under Review
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
          To ensure strict campus data governance and protect student academic records, Mentor, Recruiter, and Placement Officer accounts must be verified by the Head of Department or Autonomous Cell administrator.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => signOut()}
            className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold flex items-center justify-center gap-2 text-xs transition-colors shadow-sm"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            Sign Out of Account
          </button>

          <Link
            href="/login"
            className="inline-block text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
          >
            Back to Sign in page
          </Link>
        </div>
      </div>
    </div>
  );
}
