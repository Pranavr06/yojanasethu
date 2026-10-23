'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { useTheme } from '@/lib/themeContext';
import {
  Compass,
  GraduationCap,
  Building2,
  Briefcase,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await login(email, password);
    if (!res.success) {
      setError(res.error || 'Failed to sign in');
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-8 px-4">
      {/* Top right theme toggle */}
      <div className="w-full max-w-md flex justify-end mb-4">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl bg-white/95 dark:bg-slate-900/90">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-indigo-500/20">
            <Compass className="w-6 h-6" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Sign in to PathPilot
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            NMAMIT Contineo ERP & Proof-Based Career Intelligence
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
              Institutional Email / Recruiter ID
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                placeholder="e.g. pranav.r@nmamit.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold">
                Password
              </label>
              <span className="text-[10px] text-slate-400">Default: password123</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 text-xs font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating with Database...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Logins for Evaluator/Judges */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Quick Select Role for Evaluation:
            </span>
          </div>

          <div className="space-y-1.5">
            <div>
              <button
                type="button"
                onClick={() => handleQuickLogin('pranav.r@nmamit.in')}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left border transition-all text-xs ${
                  email === 'pranav.r@nmamit.in'
                    ? 'border-indigo-500/50 bg-indigo-50 dark:bg-indigo-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-500" />
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block leading-tight">
                      Pranav R (Student — Team Neural Forge)
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">pranav.r@nmamit.in · NNM24IS159</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  ISE · 8.45 CGPA
                </span>
              </button>

              {/* Team Neural Forge Members & Evaluator Switcher */}
              <div className="flex items-center gap-1.5 mt-1.5 px-1 overflow-x-auto pb-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Switch ISE:</span>
                {[
                  { name: 'Pranav R', email: 'pranav.r@nmamit.in', usn: 'IS159' },
                  { name: 'Preethika', email: 'preethika@nmamit.in', usn: 'IS174' },
                  { name: 'Prajwala', email: 'prajwala.vg@nmamit.in', usn: 'IS156' },
                  { name: 'Prathwik', email: 'prathwik.shetty@nmamit.in', usn: 'IS171' },
                ].map((member) => (
                  <button
                    key={member.email}
                    type="button"
                    onClick={() => handleQuickLogin(member.email)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition-colors shrink-0 ${
                      email === member.email
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-400'
                    }`}
                  >
                    {member.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleQuickLogin('sharma.faculty@nmamit.in')}
              className={`w-full flex items-center justify-between p-2 rounded-xl text-left border transition-all text-xs ${
                email === 'sharma.faculty@nmamit.in'
                  ? 'border-indigo-500/50 bg-indigo-50 dark:bg-indigo-950/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-500" />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block leading-tight">
                    Dr. K. Sharma (Faculty Mentor)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">sharma.faculty@nmamit.in</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                Verification Desk
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('priya.nair@nexusai.com')}
              className={`w-full flex items-center justify-between p-2 rounded-xl text-left border transition-all text-xs ${
                email === 'priya.nair@nexusai.com'
                  ? 'border-indigo-500/50 bg-indigo-50 dark:bg-indigo-950/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-500" />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block leading-tight">
                    Priya Nair (Recruiter)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">priya.nair@nexusai.com</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Nexus AI
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('tpo@nmamit.in')}
              className={`w-full flex items-center justify-between p-2 rounded-xl text-left border transition-all text-xs ${
                email === 'tpo@nmamit.in'
                  ? 'border-indigo-500/50 bg-indigo-50 dark:bg-indigo-950/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-500" />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block leading-tight">
                    Prof. Sudesh Rao (Placement Cell / TPO)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">tpo@nmamit.in</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                TPO Head
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
