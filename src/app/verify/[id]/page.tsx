'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  Award,
  Calendar,
  Building2,
  UserCheck,
  FileBadge2,
  Lock,
  Printer,
  Copy,
  Check,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import QRCodeSVG from '@/components/QRCodeSVG';

interface VerificationPayload {
  isValid: boolean;
  institution: string;
  maskedStudentName: string;
  maskedUsn: string;
  credentialTitle: string;
  verifiedSkill: string;
  subjectLabel: string;
  issuer: string;
  verifiedAt: string;
  verifiedBy: string;
  assessmentScore: number | null;
  status: 'verified' | 'unverified' | 'revoked';
}

export default function PublicVerifyCredentialPage({
  params,
}: {
  params: { id: string };
}) {
  const credentialId = params.id;
  const [data, setData] = useState<VerificationPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchVerification() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/verify/${encodeURIComponent(credentialId)}`);
        const json = await res.json();

        if (!res.ok || !json.verification) {
          setError(json.error || 'Credential not found or not publicly verifiable.');
          return;
        }

        setData(json.verification);
      } catch (err: any) {
        setError(err.message || 'Unable to retrieve verification records.');
      } finally {
        setLoading(false);
      }
    }

    if (credentialId) {
      fetchVerification();
    }
  }, [credentialId]);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://pathpilot.nmamit.in/verify/${credentialId}`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-200">
          Querying Institutional Blockchain & Verification Registry...
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Validating cryptographic hash against NMAMIT Faculty Ledger
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white mb-2">
            Credential Record Not Found
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
            {error || 'This credential identifier does not correspond to an active faculty-verified certificate on our registry.'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to PathPilot Home</span>
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = data.verifiedAt
    ? new Date(data.verifiedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Authenticated';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Institutional Header Card */}
        <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-600/30">
              Y
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Official Credential Verification Service
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {data.institution}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={copyShareLink}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs flex items-center gap-1.5 font-medium"
              title="Copy public verification link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors text-xs flex items-center gap-1.5 font-semibold"
              title="Print Certificate Verification Record"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Main Certificate Verification Badge Card */}
        <div className="relative bg-white dark:bg-slate-900 border-2 border-emerald-500/40 dark:border-emerald-500/30 rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden">
          {/* Top Verification Watermark Ribbon */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100 dark:border-slate-800/80">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Cryptographically Verified & Faculty Endorsed</span>
            </div>

            <div className="text-[11px] font-mono text-slate-400">
              ID: {credentialId.substring(0, 8)}...
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left Column: Details */}
            <div className="md:col-span-8 space-y-5">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Accredited Certification
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight mt-1">
                  {data.credentialTitle}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800">
                    {data.subjectLabel}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Issued by {data.issuer}</span>
                  </span>
                </div>
              </div>

              {/* Verified Student and Assessment Metadata */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Recipient Student
                  </span>
                  <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-indigo-500" />
                    <span>{data.maskedStudentName}</span>
                  </div>
                  <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    USN: {data.maskedUsn}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Faculty Endorsement
                  </span>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {data.verifiedBy}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
              </div>

              {/* Assessment Score Badge if proctored exam was completed */}
              {data.assessmentScore !== null && (
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                        Proctored Subject Assessment
                      </div>
                      <div className="text-[11px] text-indigo-700/80 dark:text-indigo-400">
                        Evaluated against authentic university question bank & rubric
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                      {Math.round(data.assessmentScore)}%
                    </span>
                    <span className="block text-[9px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                      Passed
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: QR Code & Cryptographic Seals */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-center">
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <QRCodeSVG
                  value={currentUrl}
                  size={140}
                  title={`Verification QR Code for ${data.credentialTitle}`}
                />
              </div>

              <span className="mt-3 text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Scan to Verify</span>
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                Points directly to this cryptographically sealed ledger record.
              </p>
            </div>
          </div>

          {/* Privacy & Zero-Knowledge Safeguard Footer */}
          <div className="mt-8 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>
                <strong>Privacy Guaranteed:</strong> Student contact info and raw document files are shielded under FERPA/institutional guidelines.
              </span>
            </div>
            <div className="font-mono text-[10px]">
              SHA256·LEDGER·AUTHENTICATED
            </div>
          </div>
        </div>

        {/* Back navigation */}
        <div className="text-center print:hidden">
          <Link
            href="/student/skill-passport"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to Student Skill Passport</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
