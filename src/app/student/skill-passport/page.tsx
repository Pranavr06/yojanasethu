'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { FullStudentProfile, VerifiedCredentialSummary } from '@/types';
import EvidenceModal from '@/components/EvidenceModal';
import QRCodeSVG from '@/components/QRCodeSVG';
import {
  ShieldCheck,
  UploadCloud,
  CheckCircle2,
  Clock,
  Github,
  ExternalLink,
  ArrowLeft,
  Eye,
  EyeOff,
  QrCode,
  Award,
  X,
  Copy,
  Check,
  Building2,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';

export default function StudentSkillPassportPage() {
  const { user } = useAuth();
  const [student, setStudent] = useState<FullStudentProfile | null>(null);
  const [verifiedCreds, setVerifiedCreds] = useState<VerifiedCredentialSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [selectedSkillForEvidence, setSelectedSkillForEvidence] = useState('Python');
  const [visibilityPublic, setVisibilityPublic] = useState(true);
  const [selectedCredForQR, setSelectedCredForQR] = useState<VerifiedCredentialSummary | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

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
      if (data.student) {
        setStudent(data.student);
        // Fetch verified credentials for QR passports
        const credRes = await fetch(`/api/students/credentials?student_id=${encodeURIComponent(data.student.profile.id)}`);
        const credData = await credRes.json();
        if (credData.credentials) {
          setVerifiedCreds(credData.credentials);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [user]);

  const copyVerifyUrl = (submissionId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://pathpilot.nmamit.in';
    navigator.clipboard.writeText(`${origin}/verify/${submissionId}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

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

        <div className="flex items-center gap-3 self-start sm:self-center flex-wrap">
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

      {/* Verified Credentials & QR Section */}
      {verifiedCreds.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-500" />
              <span>Accredited Certifications ({verifiedCreds.length})</span>
            </h2>
            <span className="text-xs text-slate-400">
              Cryptographically backed by faculty endorsement & proctored assessment
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {verifiedCreds.map((cred) => {
              const credId = cred.submission_id || cred.id;
              const subjectLabel = cred.subject_label || cred.subject;

              return (
                <div
                  key={credId}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/50 shadow-sm flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {subjectLabel}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                      {cred.title}
                    </h3>

                    <div className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{cred.issuer}</span>
                      </div>
                      {cred.assessment_score !== null && (
                        <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Assessment Score: {Math.round(cred.assessment_score)}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedCredForQR(cred)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5 text-indigo-500" />
                      <span>View QR</span>
                    </button>

                    <Link
                      href={`/verify/${credId}`}
                      target="_blank"
                      className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                    >
                      <span>Public Verify</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Skills Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-500" />
          <span>Technical Competencies ({skills.length})</span>
        </h2>

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
      </div>

      {/* QR Modal Popup */}
      {selectedCredForQR && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative">
            <button
              onClick={() => setSelectedCredForQR(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mb-3">
              <Award className="w-6 h-6" />
            </div>

            <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">
              {selectedCredForQR.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Faculty Endorsed · {selectedCredForQR.subject_label || selectedCredForQR.subject}
            </p>

            <div className="p-3 bg-white border border-slate-200 dark:border-slate-700 rounded-2xl inline-block shadow-inner mb-4">
              <QRCodeSVG
                value={
                  typeof window !== 'undefined'
                    ? `${window.location.origin}/verify/${selectedCredForQR.submission_id || selectedCredForQR.id}`
                    : `https://pathpilot.nmamit.in/verify/${selectedCredForQR.submission_id || selectedCredForQR.id}`
                }
                size={160}
                title="Credential QR Code"
              />
            </div>

            <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
              Scan with any mobile camera or QR reader to verify authenticity on the NMAMIT Registry.
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => copyVerifyUrl(selectedCredForQR.submission_id || selectedCredForQR.id)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
              </button>

              <Link
                href={`/verify/${selectedCredForQR.submission_id || selectedCredForQR.id}`}
                target="_blank"
                className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                <span>Open URL</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

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
