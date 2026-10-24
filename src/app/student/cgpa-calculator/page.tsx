'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { FullStudentProfile } from '@/types';
import CgpaCalculator from '@/components/CgpaCalculator';
import { Calculator, ArrowLeft, RefreshCw, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function StudentCgpaCalculatorPage() {
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
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading student credits from database...</p>
      </div>
    );
  }

  const currentCgpa = student?.academic_record?.cgpa || 8.0;
  const completedCredits = student?.academic_record?.total_earned_credits || 120;
  const totalCredits = 160;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Deterministic Math Engine
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Calculator className="w-6 h-6 text-sky-500" />
            <span>CGPA Simulation Planner & Target Optimizer</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Calculate the exact minimum SGPA required in remaining semesters to achieve your placement cutoffs without guessing.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs font-semibold self-start sm:self-center">
          <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Current Base</span>
          <span className="text-sky-700 dark:text-sky-300 font-extrabold text-sm">{currentCgpa.toFixed(2)} CGPA</span>
          <span className="text-slate-400 text-[11px]"> ({completedCredits} / {totalCredits} Credits)</span>
        </div>
      </div>

      {/* Main CGPA Calculator Component */}
      <CgpaCalculator
        currentCgpa={currentCgpa}
        initialTargetCgpa={8.5}
        earnedCredits={completedCredits}
        totalCredits={totalCredits}
      />
    </div>
  );
}
