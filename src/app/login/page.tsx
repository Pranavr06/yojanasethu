'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { useTheme } from '@/lib/themeContext';
import { AppRole, APP_ROLES } from '@/lib/rbac';
import {
  Compass,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sun,
  Moon,
  Eye,
  EyeOff,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export default function LoginPage() {
  const { signIn } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [selectedRole, setSelectedRole] = useState<AppRole | ''>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      setError('Please select your role from the dropdown.');
      return;
    }
    if (!email || !password) {
      setError('Please provide both institutional email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await signIn(email, password, selectedRole);
    if (!res.success) {
      setError(res.error || 'Failed to authenticate. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoRole: AppRole) => {
    setEmail(demoEmail);
    setPassword('Password@123');
    setSelectedRole(demoRole);
    setError(null);
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
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-indigo-500/20">
            <Compass className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Sign in to YojanaSethu
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Autonomous Examination Cell & Proof-Based Career Intelligence Gateway
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* 1. Five Roles Dropdown */}
          <div>
            <label
              htmlFor="login-role"
              className="block text-slate-700 dark:text-slate-300 font-semibold mb-1"
            >
              Select Role / Portal
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" aria-hidden="true" />
              <select
                id="login-role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as AppRole)}
                required
                aria-required="true"
                disabled={loading}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 text-xs font-medium transition-colors disabled:opacity-50 appearance-none cursor-pointer"
              >
                <option value="" disabled>
                  -- Select your role / portal --
                </option>
                <option value="student">Student (Student Dashboard)</option>
                <option value="mentor">Teacher / Mentor (Faculty Mentor Desk)</option>
                <option value="placements">Placements (Training & Placement Cell)</option>
                <option value="recruiter">Recruiter (Industry Talent Pipeline)</option>
                <option value="admin">Admin (System Administration)</option>
              </select>
            </div>
          </div>

          {/* 2. Email */}
          <div>
            <label
              htmlFor="login-email"
              className="block text-slate-700 dark:text-slate-300 font-semibold mb-1"
            >
              Institutional Email / Recruiter ID
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" aria-hidden="true" />
              <input
                id="login-email"
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

          {/* 3. Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="login-password"
                className="text-slate-700 dark:text-slate-300 font-semibold"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold focus:outline-none"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" aria-hidden="true" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-required="true"
                disabled={loading}
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 text-xs font-medium transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
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
                Authenticating session...
              </>
            ) : (
              <>
                Sign in to Dashboard
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Signup Link */}
        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
          Need a new account?{' '}
          <Link
            href="/signup"
            className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
          >
            Create an account
          </Link>
        </div>

        {/* Quick Demo Logins for Pair Programming & Testing */}
        <div className="mt-6 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            Quick Demo Logins (Password: Password@123):
          </p>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <button
              type="button"
              onClick={() => handleQuickLogin('pranav.r@nmamit.in', 'student')}
              className={`p-2 text-left rounded-lg border transition-colors ${
                selectedRole === 'student' && email === 'pranav.r@nmamit.in'
                  ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:border-indigo-500/50'
              }`}
            >
              <div className="font-semibold text-slate-800 dark:text-slate-200">Student</div>
              <div className="text-slate-400 truncate">pranav.r@nmamit.in</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('sharma.faculty@nmamit.in', 'mentor')}
              className={`p-2 text-left rounded-lg border transition-colors ${
                selectedRole === 'mentor' && email === 'sharma.faculty@nmamit.in'
                  ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:border-indigo-500/50'
              }`}
            >
              <div className="font-semibold text-slate-800 dark:text-slate-200">Teacher / Mentor</div>
              <div className="text-slate-400 truncate">sharma.faculty@nmamit.in</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('priya.nair@nexusai.com', 'recruiter')}
              className={`p-2 text-left rounded-lg border transition-colors ${
                selectedRole === 'recruiter' && email === 'priya.nair@nexusai.com'
                  ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:border-indigo-500/50'
              }`}
            >
              <div className="font-semibold text-slate-800 dark:text-slate-200">Recruiter</div>
              <div className="text-slate-400 truncate">priya.nair@nexusai.com</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('tpo@nmamit.in', 'admin')}
              className={`p-2 text-left rounded-lg border transition-colors ${
                (selectedRole === 'admin' || selectedRole === 'placements') && email === 'tpo@nmamit.in'
                  ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:border-indigo-500/50'
              }`}
            >
              <div className="font-semibold text-slate-800 dark:text-slate-200">Admin / Placements</div>
              <div className="text-slate-400 truncate">tpo@nmamit.in</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
