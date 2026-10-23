'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { FullStudentProfile } from '@/types';
import RoadmapView from '@/components/RoadmapView';
import { Calendar, ArrowLeft, RefreshCw, Sparkles, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function StudentRoadmapPage() {
  const { user } = useAuth();
  const [student, setStudent] = useState<FullStudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStudentData = async () => {
    try {
      const studentIdentifier = user?.usn || user?.id || user?.email;
      if (!studentIdentifier) {
        setLoading(false);
        return;
      }
      const param = studentIdentifier.includes('@')
        ? `id=${encodeURIComponent(studentIdentifier)}`
        : `usn=${encodeURIComponent(studentIdentifier)}`;
      const res = await fetch(`/api/students?${param}`);
      const data = await res.json();
      if (data.student) setStudent(data.student);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [user]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading personalized roadmap from database...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="py-20 text-center bg-white dark:bg-slate-900/60 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
          No student record found in database.
        </p>
      </div>
    );
  }

  const { roadmaps, target_role, profile } = student;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/student"
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Back to Student Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Targeted Career Acceleration
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-amber-500" />
            <span>30-Day Targeted Career Roadmap</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Milestone progression tailored to your target industry role:{' '}
            <strong className="text-indigo-600 dark:text-indigo-400">{target_role}</strong>.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-semibold self-start sm:self-center">
          <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Goal Role</span>
          <span className="text-amber-700 dark:text-amber-300 font-extrabold text-sm">{target_role}</span>
        </div>
      </div>

      {/* Roadmap Component */}
      <RoadmapView
        initialRoadmaps={roadmaps}
        studentId={profile.id}
      />
    </div>
  );
}
