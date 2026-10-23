'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import NotificationBell from '@/components/NotificationBell';
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

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AppShell({ children, title, subtitle }: AppShellProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname.startsWith('/auth/');

  if (isAuthPage) {
    return <main className="min-h-screen bg-slate-50 dark:bg-[#070B14]">{children}</main>;
  }

  const role = user?.role || 'student';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      {/* 1. Left Sidebar Panel (Fixed on Desktop, Slide-over Drawer on Mobile) */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Area (Offset by sidebar on desktop lg:pl-72) */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0 transition-all">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            {/* Hamburger Button on Mobile */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Top Desk Pill Badge (matching reference screenshot's BUS COORDINATOR DESK) */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shadow-sm">
                {role === 'admin' ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>SYSTEM GOVERNANCE DESK</span>
                    <span className="text-slate-400 font-normal hidden sm:inline">• Administrative Control</span>
                  </>
                ) : role === 'student' ? (
                  <>
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>STUDENT CAREER DESK</span>
                    <span className="text-slate-400 font-normal hidden sm:inline">• NMAM Institute of Technology</span>
                  </>
                ) : role === 'faculty' || role === 'mentor' ? (
                  <>
                    <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>FACULTY MENTOR DESK</span>
                    <span className="text-slate-400 font-normal hidden sm:inline">• Academic Oversight</span>
                  </>
                ) : role === 'placement' || role === 'placements' ? (
                  <>
                    <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>TRAINING & PLACEMENT (TPO)</span>
                    <span className="text-slate-400 font-normal hidden sm:inline">• Corporate Relations</span>
                  </>
                ) : (
                  <>
                    <Briefcase className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>RECRUITER TALENT DESK</span>
                    <span className="text-slate-400 font-normal hidden sm:inline">• NexusAI Placement Intelligence</span>
                  </>
                )}
              </span>

              {/* Contineo Live indicator */}
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                <Radio className="w-2.5 h-2.5 text-emerald-500 animate-pulse" />
                <span>Contineo Verified</span>
              </span>
            </div>
          </div>

          {/* Right Controls: Notification Bell, Theme Switcher & User Profile Menu */}
          <div className="flex items-center gap-2.5">
            <NotificationBell />

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* User Dropdown / Sign Out */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 transition-colors text-xs font-semibold"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {user.full_name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden sm:inline font-medium max-w-[120px] truncate">
                    {user.full_name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 glass-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 text-xs z-50 animate-in fade-in duration-100">
                    <div className="p-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-slate-900 dark:text-white truncate">
                        {user.full_name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                      <div className="mt-1 flex items-center gap-1">
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                          {user.role}
                        </span>
                        {user.usn && (
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                            {user.usn}
                          </span>
                        )}
                      </div>
                    </div>

                    <Link
                      href="/login"
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-2 p-2 mt-1 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                    >
                      <span>Switch Persona</span>
                    </Link>

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 p-2 mt-1 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

        {/* Minimal Enterprise Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-[#0B1120]/50 py-5 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>
              Nexathon 2026 • SDIT Mangaluru •{' '}
              <span className="text-slate-800 dark:text-slate-200 font-semibold">
                Team Neural Forge
              </span>{' '}
              (Preethika, Prajwala, Pranav, Prathwik)
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              NMAMIT Autonomous Contineo ERP & Supabase Production Gateway
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default AppShell;
