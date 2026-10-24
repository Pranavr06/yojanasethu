'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, X } from 'lucide-react';
import { useAuth } from './authContext';

export interface NavigationGuardConfig {
  isActive: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirmLeave?: () => Promise<void> | void;
}

interface NavigationGuardContextType {
  guard: NavigationGuardConfig | null;
  setNavigationGuard: (guard: NavigationGuardConfig | null) => void;
  triggerGuardedNavigation: (onProceed: () => void) => void;
  navigateBack: () => void;
  canGoBack: boolean;
  isRootDashboard: boolean;
}

const NavigationGuardContext = createContext<NavigationGuardContextType | null>(null);

const SESSION_HISTORY_KEY = '__yojana_nav_history';

export function NavigationGuardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [guard, setGuard] = useState<NavigationGuardConfig | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const pendingNavigationCallbackRef = useRef<(() => void) | null>(null);

  // In-memory navigation history tracking
  const historyStackRef = useRef<string[]>([]);
  const currentUrlRef = useRef<string>('');

  // Track page transitions within the app
  useEffect(() => {
    const fullUrl = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    if (currentUrlRef.current && currentUrlRef.current !== fullUrl) {
      // Don't push auth/login URLs into the history stack
      const isAuthUrl =
        currentUrlRef.current.startsWith('/login') ||
        currentUrlRef.current.startsWith('/signup') ||
        currentUrlRef.current.startsWith('/forgot-password') ||
        currentUrlRef.current.startsWith('/reset-password');

      if (!isAuthUrl) {
        historyStackRef.current.push(currentUrlRef.current);
        // Keep stack bounded
        if (historyStackRef.current.length > 25) {
          historyStackRef.current.shift();
        }
      }
    }
    currentUrlRef.current = fullUrl;
  }, [pathname, searchParams]);

  // Determine fallback dashboard based on role or current path
  const getFallbackRoute = useCallback((): string => {
    if (pathname.startsWith('/mentor')) return '/mentor';
    if (pathname.startsWith('/recruiter')) return '/recruiter';
    if (pathname.startsWith('/placement')) return '/placement';
    if (pathname.startsWith('/admin')) return '/admin';
    if (pathname.startsWith('/student')) return '/student';

    const role = user?.role;
    if (role === 'mentor' || role === 'faculty') return '/mentor';
    if (role === 'recruiter') return '/recruiter';
    if (role === 'admin') return '/admin';
    if (role === 'placement') return '/placement';
    return '/student';
  }, [pathname, user]);

  const isRootDashboard =
    pathname === '/student' ||
    pathname === '/mentor' ||
    pathname === '/recruiter' ||
    pathname === '/admin' ||
    pathname === '/placement' ||
    pathname === '/';

  const canGoBack = historyStackRef.current.length > 0 || !isRootDashboard;

  // Intercept navigation if guard is active
  const triggerGuardedNavigation = useCallback(
    (onProceed: () => void) => {
      if (guard && guard.isActive) {
        pendingNavigationCallbackRef.current = onProceed;
        setModalOpen(true);
      } else {
        onProceed();
      }
    },
    [guard]
  );

  // Smart back navigation
  const navigateBack = useCallback(() => {
    triggerGuardedNavigation(() => {
      // 1. If we have in-app history, pop the previous URL
      if (historyStackRef.current.length > 0) {
        const prevUrl = historyStackRef.current.pop();
        if (prevUrl && prevUrl !== currentUrlRef.current) {
          router.push(prevUrl);
          return;
        }
      }

      // 2. If no in-app history or direct visit, use browser back if referrer matches, else fallback
      if (typeof window !== 'undefined' && window.history.length > 2) {
        const fallback = getFallbackRoute();
        // If already on fallback, don't loop
        if (pathname === fallback) {
          return;
        }
        router.back();
      } else {
        router.push(getFallbackRoute());
      }
    });
  }, [getFallbackRoute, pathname, router, triggerGuardedNavigation]);

  // Handle modal actions
  const handleConfirmLeave = async () => {
    setModalOpen(false);
    if (guard?.onConfirmLeave) {
      try {
        await guard.onConfirmLeave();
      } catch (err) {
        console.warn('Error during guard onConfirmLeave:', err);
      }
    }
    setGuard(null);
    if (pendingNavigationCallbackRef.current) {
      const cb = pendingNavigationCallbackRef.current;
      pendingNavigationCallbackRef.current = null;
      cb();
    }
  };

  const handleCancelLeave = () => {
    setModalOpen(false);
    pendingNavigationCallbackRef.current = null;
  };

  // Browser level beforeunload interceptor (e.g. closing tab or refresh during interview)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (guard && guard.isActive) {
        e.preventDefault();
        e.returnValue = guard.message || 'An interview session is active. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [guard]);

  return (
    <NavigationGuardContext.Provider
      value={{
        guard,
        setNavigationGuard: setGuard,
        triggerGuardedNavigation,
        navigateBack,
        canGoBack,
        isRootDashboard,
      }}
    >
      {children}

      {/* Confirmation Modal when Leaving Active Interview */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header with warning icon */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 dark:bg-amber-400/10 dark:text-amber-400 border border-amber-500/20">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {guard?.title || 'Leave Interview Session?'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {guard?.message ||
                    'An active interview session is in progress. Leaving now will stop your microphone, cancel speech audio, and you may lose unsaved responses.'}
                </p>
              </div>
            </div>

            {/* Explanatory Callout */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                Session Protection:
              </span>{' '}
              Choose <span className="text-indigo-600 dark:text-indigo-400 font-bold">Continue Interview</span> to remain on this question and finish your evaluation.
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleCancelLeave}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                {guard?.cancelLabel || 'Continue Interview'}
              </button>
              <button
                type="button"
                onClick={handleConfirmLeave}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
              >
                {guard?.confirmLabel || 'Leave Interview'}
              </button>
            </div>
          </div>
        </div>
      )}
    </NavigationGuardContext.Provider>
  );
}

export function useNavigationGuard() {
  const context = useContext(NavigationGuardContext);
  if (!context) {
    throw new Error('useNavigationGuard must be used within NavigationGuardProvider');
  }
  return context;
}
