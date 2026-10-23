'use client';

import React, { useEffect, useState } from 'react';
import MentorApprovalDesk from '@/components/MentorApprovalDesk';
import { EvidenceSubmission } from '@/types';
import { useAuth } from '@/lib/authContext';
import { ShieldCheck, RefreshCw, ArrowLeft, Filter } from 'lucide-react';
import Link from 'next/link';

export default function MentorVerificationsPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<EvidenceSubmission[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [departments, setDepartments] = useState<{ code: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const [subRes, deptRes] = await Promise.all([
        fetch(`/api/mentor/submissions?status=all&dept=${selectedDept}`),
        fetch('/api/mentor/departments'),
      ]);
      const [subData, deptData] = await Promise.all([subRes.json(), deptRes.json()]);

      if (subData.submissions) setSubmissions(subData.submissions);
      if (deptData.departments) setDepartments(deptData.departments);
    } catch (e) {
      console.error('Failed to fetch verification submissions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
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
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Mentor Workspace • Proof Gate
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
            <span>Faculty Evidence Verification Desk</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review student codebases, live deployments, and credentials. Approvals unlock recruiter match rankings.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          {/* Branch Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All 15 Branches</option>
              {departments.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchSubmissions}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-bold hover:bg-indigo-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Main Verification Desk */}
      <MentorApprovalDesk
        pendingSubmissions={submissions}
        onRefresh={fetchSubmissions}
        reviewerName={user?.full_name ? `${user.full_name} (Faculty Mentor)` : undefined}
      />
    </div>
  );
}
