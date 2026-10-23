'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { useTheme } from '@/lib/themeContext';
import { AppRole, APP_ROLES } from '@/lib/rbac';
import {
  Compass,
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Check,
  ShieldAlert,
  Info,
} from 'lucide-react';

export default function SignupPage() {
  const { signUp } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole | ''>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available signup roles (Strictly excluding 'admin')
  const signupRoles = useMemo(() => {
    return APP_ROLES.filter((r) => r.value !== 'admin');
  }, []);

  // Password strength calculations
  const passwordCriteria = useMemo(() => {
    return {
      length: password.length >= 8,
      hasLetter: /[a-zA-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  }, [password]);

  const strengthScore = useMemo(() => {
    let score = 0;
    if (passwordCriteria.length) score++;
    if (passwordCriteria.hasLetter) score++;
    if (passwordCriteria.hasNumber) score++;
    if (passwordCriteria.hasSpecial) score++;
    return score;
  }, [passwordCriteria]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedRole) {
      setError('Please select your institutional or corporate role.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (strengthScore < 3) {
      setError('Please meet at least 3 password strength requirements (min 8 chars, letters, numbers, symbols).');
      return;
    }

    setLoading(true);

    const res = await signUp({
      fullName,
      email,
      password,
      role: selectedRole,
    });

    if (!res.success) {
      setError(res.error || 'Failed to create account.');
      setLoading(false);
    }
  };

  const isPrivilegedRole = selectedRole && selectedRole !== 'student';

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
            Create YojanaSethu Account
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Proof-Based Verification & Career Opportunity Gateway
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Full Name */}
          <div>
            <label
              htmlFor="signup-name"
              className="block text-slate-700 dark:text-slate-300 font-semibold mb-1"
            >
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" aria-hidden="true" />
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                placeholder="e.g. Pranav R"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                aria-required="true"
                disabled={loading}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 text-xs font-medium transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="signup-email"
              className="block text-slate-700 dark:text-slate-300 font-semibold mb-1"
            >
              Institutional Email / Corporate Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" aria-hidden="true" />
              <input
                id="signup-email"
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

          {/* Role Selection (Single-select dropdown with NO default selection) */}
          <div>
            <label
              htmlFor="signup-role"
              className="block text-slate-700 dark:text-slate-300 font-semibold mb-1"
            >
              Application Role
            </label>
            <select
              id="signup-role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as AppRole)}
              required
              aria-required="true"
              disabled={loading}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 text-xs font-medium transition-colors disabled:opacity-50"
            >
              <option value="" disabled>
                -- Select your application role --
              </option>
              {signupRoles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label} {r.publicSignupAllowed ? '(Instant Direct Access)' : '(Requires Admin Approval)'}
                </option>
              ))}
            </select>
          </div>

          {/* Role notice banner if requesting privileged role */}
          {isPrivilegedRole && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              <span>
                <strong>Approval Required:</strong> Mentor, Recruiter, and Placement Officer roles require verification by the Head of Department or Placement Cell before dashboard access is unlocked.
              </span>
            </div>
          )}

          {/* Password */}
          <div>
            <label
              htmlFor="signup-password"
              className="block text-slate-700 dark:text-slate-300 font-semibold mb-1"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" aria-hidden="true" />
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Create strong password"
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

            {/* Password Strength Checklist */}
            {password.length > 0 && (
              <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-1 text-[11px]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Password Strength:</span>
                  <span
                    className={`font-bold ${
                      strengthScore <= 1
                        ? 'text-rose-500'
                        : strengthScore <= 3
                        ? 'text-amber-500'
                        : 'text-emerald-500'
                    }`}
                  >
                    {strengthScore <= 1 ? 'Weak' : strengthScore <= 3 ? 'Medium' : 'Strong'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  <span className={`flex items-center gap-1 ${passwordCriteria.length ? 'text-emerald-500' : 'text-slate-400'}`}>
                    <Check className="w-3 h-3" /> Min 8 characters
                  </span>
                  <span className={`flex items-center gap-1 ${passwordCriteria.hasLetter ? 'text-emerald-500' : 'text-slate-400'}`}>
                    <Check className="w-3 h-3" /> Letters
                  </span>
                  <span className={`flex items-center gap-1 ${passwordCriteria.hasNumber ? 'text-emerald-500' : 'text-slate-400'}`}>
                    <Check className="w-3 h-3" /> Numbers
                  </span>
                  <span className={`flex items-center gap-1 ${passwordCriteria.hasSpecial ? 'text-emerald-500' : 'text-slate-400'}`}>
                    <Check className="w-3 h-3" /> Special symbol
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="signup-confirm-password"
              className="block text-slate-700 dark:text-slate-300 font-semibold mb-1"
            >
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" aria-hidden="true" />
              <input
                id="signup-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                aria-required="true"
                disabled={loading}
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 text-xs font-medium transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                Registering account...
              </>
            ) : (
              <>
                {isPrivilegedRole ? 'Submit Role Request' : 'Create Student Account'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Existing account link */}
        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4">
          Already registered?{' '}
          <Link
            href="/login"
            className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
