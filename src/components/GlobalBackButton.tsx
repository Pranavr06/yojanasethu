'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useNavigationGuard } from '@/lib/navigationGuardContext';

interface GlobalBackButtonProps {
  className?: string;
  fallbackLabel?: string;
}

export default function GlobalBackButton({
  className = '',
  fallbackLabel,
}: GlobalBackButtonProps) {
  const pathname = usePathname();
  const { navigateBack, canGoBack, isRootDashboard } = useNavigationGuard();

  // Exclude auth and login pages where a back button would create confusing loops
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname.startsWith('/auth/');

  if (isAuthPage) {
    return null;
  }

  const isDisabled = isRootDashboard && !canGoBack;

  return (
    <div className={`mb-4 flex items-center ${className}`}>
      <button
        type="button"
        onClick={navigateBack}
        disabled={isDisabled}
        className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold text-xs transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-slate-700 dark:disabled:hover:text-slate-200 disabled:hover:bg-white/90 dark:disabled:hover:bg-slate-900/90"
        title={isDisabled ? 'You are on the primary dashboard' : 'Go back to previous page'}
        aria-label="Back"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
        <span>Back</span>
        {fallbackLabel && (
          <span className="hidden text-[10px] text-slate-400 sm:inline">
            • {fallbackLabel}
          </span>
        )}
      </button>
    </div>
  );
}
