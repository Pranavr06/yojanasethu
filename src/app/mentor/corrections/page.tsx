'use client';

import React, { useEffect, useState } from 'react';
import MentorCorrectionDesk from '@/components/MentorCorrectionDesk';
import { AcademicCorrectionRequest } from '@/types';
import { FileCheck2, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MentorCorrectionsPage() {
  const [requests, setRequests] = useState<AcademicCorrectionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCorrections = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/mentor/corrections');
      const data = await res.json();
      if (data.requests) setRequests(data.requests);
    } catch (e) {
      console.error('Failed to fetch academic correction requests:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCorrections();
  }, []);

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
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Contineo ERP • Examination Cell Gate
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FileCheck2 className="w-6 h-6 text-purple-500" />
            <span>Academic ERP Correction Desk</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Validate student revaluation outcomes, cleared backlogs, and rectify Contineo ERP synchronization discrepancies.
          </p>
        </div>

        <button
          onClick={fetchCorrections}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 text-xs font-bold hover:bg-purple-100 transition-colors self-start sm:self-center disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Requests</span>
        </button>
      </div>

      {/* Main Correction Desk Component */}
      <MentorCorrectionDesk
        requests={requests}
        onRefresh={fetchCorrections}
      />
    </div>
  );
}
