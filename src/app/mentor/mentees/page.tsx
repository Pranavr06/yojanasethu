'use client';

import React, { useEffect, useState } from 'react';
import MentorMenteeDirectory from '@/components/MentorMenteeDirectory';
import { Users, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MentorMenteesPage() {
  const [mentees, setMentees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<{ code: string; name: string }[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  const fetchMentees = async () => {
    setLoading(true);
    try {
      const [mRes, dRes] = await Promise.all([
        fetch(`/api/mentor/mentees?dept=${selectedDept}`),
        fetch('/api/mentor/departments'),
      ]);
      const [mData, dData] = await Promise.all([mRes.json(), dRes.json()]);

      if (mData.mentees) setMentees(mData.mentees);
      if (dData.departments) setDepartments(dData.departments);
    } catch (e) {
      console.error('Failed to fetch mentees:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentees();
  }, [selectedDept]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/mentor"
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Back to Overview"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Cohort Tracking • Academic Records
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-500" />
            <span>Mentee Student Directory & Academic Standings</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Autonomous examination cell standings, active backlogs, earned credits, and verified skill counts across all branches.
          </p>
        </div>

        <button
          onClick={fetchMentees}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-bold hover:bg-blue-100 transition-colors self-start sm:self-center disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Roster</span>
        </button>
      </div>

      {/* Directory Component */}
      <MentorMenteeDirectory
        mentees={mentees}
        departments={departments}
        selectedDept={selectedDept}
        onSelectDept={setSelectedDept}
      />
    </div>
  );
}
