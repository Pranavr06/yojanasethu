'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { FullStudentProfile } from '@/types';
import EvidenceModal from '@/components/EvidenceModal';
import {
  ShieldCheck,
  UploadCloud,
  CheckCircle2,
  Clock,
  Github,
  Globe,
  ExternalLink,
  ArrowLeft,
  FileCheck,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function StudentSkillPassportPage() {
  const { user } = useAuth();
  const [student, setStudent] = useState<FullStudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [selectedSkillForEvidence, setSelectedSkillForEvidence] = useState('Python');
  const [visibilityPublic, setVisibilityPublic] = useState(true);

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
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading verified skill passport from database...</p>
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

  const { profile, skills } = student;
  const verifiedCount = skills.filter((s) => s.verification_badge).length;

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
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Evidence-Backed Credentials
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-indigo-500" />
            <span>Verifiable Skill Passport</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Every technical skill is tied to verifiable GitHub repositories, live deployments, or faculty endorsements.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          {/* Recruiter Visibility Toggle */}
          <button
            onClick={() => setVisibilityPublic(!visibilityPublic)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              visibilityPublic
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
            }`}
          >
            {visibilityPublic ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{visibilityPublic ? 'Unlocked for Recruiters' : 'Private'}</span>
          </button>

          {/* Submit Proof Trigger */}
          <button
            onClick={() => {
              setSelectedSkillForEvidence('Python');
              setIsEvidenceModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all hover:scale-105"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Submit Evidence Proof</span>
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-sky-500/10 to-emerald-500/10 border border-indigo-200 dark:border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Passport Verification Status
          </span>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {verifiedCount} of {skills.length} Skills Verified by Faculty Gate
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Unverified skills count as self-declared and do not award recruiter match ranking points until endorsed.
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {skills.length > 0 ? Math.round((verifiedCount / skills.length) * 100) : 0}%
          </span>
          <span className="block text-[11px] text-slate-400 font-semibold">Credibility Index</span>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => {
          const isVerified = skill.verification_badge;

          return (
            <div
              key={skill.id}
              className={`p-5 rounded-2xl border transition-all ${
                isVerified
                  ? 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
                  : 'bg-slate-50/60 dark:bg-slate-950/40 border-dashed border-slate-300 dark:border-slate-800 hover:border-amber-400'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {skill.skill_name}
                  </span>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {skill.category}
                  </span>
                </div>

                {isVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Verified</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                    <Clock className="w-3 h-3 text-amber-500" />
                    <span>Self-Declared</span>
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Confidence Score:</span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {skill.confidence_score || (isVerified ? 90 : 60)}%
                  </strong>
                </div>

                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  <strong>Proof Source: </strong>
                  <span>{skill.evidence_source}</span>
                </div>

                {skill.evidence_url && (
                  <a
                    href={skill.evidence_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 hover:underline pt-1 font-mono"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>View Repository Proof</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}

                {!isVerified && (
                  <button
                    onClick={() => {
                      setSelectedSkillForEvidence(skill.skill_name);
                      setIsEvidenceModalOpen(true);
                    }}
                    className="w-full mt-3 py-2 rounded-xl border border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 transition-colors text-xs flex items-center justify-center gap-1.5"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Submit Proof for Faculty Endorsement</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Evidence Submission Modal */}
      <EvidenceModal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        studentId={profile.id}
        defaultSkill={selectedSkillForEvidence}
        onSuccess={() => {
          setIsEvidenceModalOpen(false);
          fetchStudentData();
        }}
      />
    </div>
  );
}
