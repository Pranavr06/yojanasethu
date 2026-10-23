'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { ROLE_DASHBOARDS, normalizeRole } from '@/lib/rbac';
import Link from 'next/link';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  Lock,
  GraduationCap,
  Building2,
  Briefcase,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const role = normalizeRole(user.role);
      const target = role ? ROLE_DASHBOARDS[role] : '/student';
      router.push(target);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading session...</p>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-20 flex flex-col items-center justify-center text-center max-w-4xl mx-auto space-y-8">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>NMAMIT Autonomous • Contineo ERP Integrated</span>
      </div>

      {/* Main Headline */}
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Resumes show what students claim.{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-sky-500 to-emerald-500 bg-clip-text text-transparent">
            YojanaSethu shows what they can prove.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          The unified career-readiness intelligence platform connecting engineering students, college faculty mentors, and recruiters through verified evidence, deterministic Contineo ERP math, and AI guidance.
        </p>
      </div>

      {/* Auth Entry Button */}
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
        <Link
          href="/login"
          className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 transition-all hover:scale-105"
        >
          <Lock className="w-4 h-4" />
          <span>Sign In to Institutional Portal</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 3 Pillars of Security & Verification */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-8 text-left">
        <div className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mb-3">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Student Verified Passport
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Contineo SGPA/CGPA deterministic math with evidence-backed skill tagging.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 flex items-center justify-center mb-3">
            <Building2 className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Faculty Mentor Gate
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Faculty review desk for code repos and certificate PDFs before unlocking recruiter views.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center justify-center mb-3">
            <Briefcase className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Explainable Hiring
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Deterministic hard cutoffs and evidence-weighted talent ranking with zero hallucination.
          </p>
        </div>
      </div>
    </div>
  );
}
