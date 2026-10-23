'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/lib/themeContext';
import {
  Compass,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sun,
  Moon,
  KeyRound,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const { theme, toggleTheme } = useTheme();
  const [supabase] = useState(() => createClient());

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (resetError) {
        // Even on error, do not expose account existence if it's rate limit or generic
        console.warn('Password reset response:', resetError.message);
      }

      // Always show generic message per security requirements
      setSubmitted(true);
    } catch (err: any) {
      console.error('Password reset failure:', err);
      // Still show generic message to avoid timing / enumeration attacks
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

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

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl bg-white/95 dark:bg-slate-900/90">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-indigo-500/20">
            <KeyRound className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            YojanaSethu Secure Account Recovery
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <div>
                <p className="font-semibold text-sm mb-1">Check Your Inbox</p>
                <p className="leading-relaxed">
                  If an account exists for <strong>{email}</strong>, you'll receive a password-reset link shortly.
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Please check your spam or institutional filter if the email does not arrive within a few minutes.
            </p>

            <Link
              href="/login"
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold flex items-center justify-center gap-2 text-xs transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
              Enter your registered institutional or corporate email address. We will send you an authorized password reset link.
            </p>

            {error && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="forgot-email"
                className="block text-slate-700 dark:text-slate-300 font-semibold mb-1"
              >
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" aria-hidden="true" />
                <input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  placeholder="e.g. pranav.r@nmamit.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-required="true"
                  disabled={loading}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 text-xs font-medium transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending recovery link...
                </>
              ) : (
                <>
                  Send Recovery Link
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="mt-4 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
