
'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/lib/authContext';
import { useTheme } from '@/lib/themeContext';
import {
  Menu,
  Sun,
  Moon,
  ShieldCheck,
  Building2,
  GraduationCap,
  Briefcase,
  Radio,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isLoginPage = pathname === '/login';
  const isStudentDashboard = pathname === '/student';

  if (isLoginPage || isStudentDashboard) {
    return (
      <main className="min-h-screen w-full bg-slate-50 text-slate-900">
        {children}
      </main>
    );
  }

  const role = user?.role || 'student';

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-[#070B14] dark:text-slate-100">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col transition-all lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-[#0B1120]/90 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="rounded-xl border border-slate-200 p-2 dark:border-slate-800 lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <span className="inline-flex flex-wrap items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400">
              {role === 'student' ? (
                <>
                  <GraduationCap className="h-4 w-4" />
                  STUDENT CAREER DESK
                </>
              ) : role === 'faculty' ? (
                <>
                  <Building2 className="h-4 w-4" />
                  FACULTY MENTOR DESK
                </>
              ) : role === 'placement' ? (
                <>
                  <Building2 className="h-4 w-4" />
                  TRAINING & PLACEMENT
                </>
              ) : (
                <>
                  <Briefcase className="h-4 w-4" />
                  RECRUITER TALENT DESK
                </>
              )}
            </span>

            <span className="hidden items-center gap-1 text-xs text-emerald-600 md:inline-flex">
              <Radio className="h-3 w-3" />
              Contineo Verified
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="rounded-xl border border-slate-200 p-2 dark:border-slate-800"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {user && (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 p-2 text-xs dark:border-slate-800"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
                    {user.full_name?.charAt(0) || 'U'}
                  </span>
                  <span className="hidden max-w-[120px] truncate sm:inline">
                    {user.full_name}
                  </span>
                  <ChevronDown size={14} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                    <p className="truncate text-sm font-bold">{user.full_name}</p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>

                    <Link
                      href="/login"
                      onClick={() => setProfileOpen(false)}
                      className="mt-3 block rounded-lg p-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Switch Persona
                    </Link>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>

        <footer className="border-t border-slate-200 py-5 text-center text-xs text-slate-500 dark:border-slate-800">
          Nexathon 2026 · Team Neural Forge
        </footer>
      </div>
    </div>
  );
}
