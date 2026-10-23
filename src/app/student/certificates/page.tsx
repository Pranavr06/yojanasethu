'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import {
  Award,
  UploadCloud,
  FileText,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Trash2,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Plus,
  BrainCircuit,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Loader2,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { AssessmentSubject, CertificateAssessment } from '@/types';
import { classifyCertificateSubject, SubjectClassificationResult } from '@/lib/subjectClassifier';
import { SUBJECT_METADATA } from '@/lib/assessmentQuestions';
import CertificateAssessmentModal from '@/components/CertificateAssessmentModal';

interface CertificateItem {
  id: string;
  title: string;
  skillName: string;
  subject: AssessmentSubject;
  subjectLabel: string;
  issuer: string;
  date: string;
  credentialUrl?: string;
  fileName: string;
  fileSize: string;
  status: 'verified' | 'pending' | 'pending_assessment' | 'retake_granted' | 'rejected';
  assessmentScore?: number | null;
  attemptsCount?: number;
  maxAttempts?: number;
  canRetake?: boolean;
  retakeFeedback?: string | null;
  verifiedBy?: string;
}

export default function CertificatesPage() {
  const { user } = useAuth();

  // Certificates list
  const [certificates, setCertificates] = useState<CertificateItem[]>([
    {
      id: 'sub-aws-01',
      title: 'AWS Certified Solutions Architect – Associate',
      skillName: 'Cloud Computing & AWS Architecture',
      subject: 'cloud_aws',
      subjectLabel: 'Cloud Computing & AWS Architecture',
      issuer: 'Amazon Web Services (AWS)',
      date: 'Aug 2025',
      credentialUrl: 'https://aws.amazon.com/verification/AWS-98765432',
      fileName: 'AWS_Solutions_Architect_Certificate.pdf',
      fileSize: '1.4 MB',
      status: 'verified',
      assessmentScore: 92.5,
      attemptsCount: 1,
      maxAttempts: 2,
      verifiedBy: 'Dr. Srinivas Rao (Faculty Mentor)',
    },
    {
      id: 'sub-dl-02',
      title: 'Deep Learning Specialization with PyTorch',
      skillName: 'Machine Learning & Deep Neural Networks',
      subject: 'machine_learning',
      subjectLabel: 'Machine Learning & Deep Neural Networks',
      issuer: 'DeepLearning.AI / Coursera',
      date: 'Nov 2025',
      credentialUrl: 'https://coursera.org/verify/DL-AI-2025',
      fileName: 'Deep_Learning_PyTorch_Specialization.pdf',
      fileSize: '820 KB',
      status: 'verified',
      assessmentScore: 88.0,
      attemptsCount: 1,
      maxAttempts: 2,
      verifiedBy: 'Prof. Ananya Shenoy (CSE Dept)',
    },
    {
      id: 'sub-nptel-03',
      title: 'NPTEL Elite Certificate in Distributed Systems',
      skillName: 'Distributed Systems & Concurrency',
      subject: 'cloud_aws',
      subjectLabel: 'Cloud Computing & AWS Architecture',
      issuer: 'IIT Kharagpur / NPTEL',
      date: 'Jan 2026',
      fileName: 'NPTEL_Distributed_Systems_Elite.pdf',
      fileSize: '2.1 MB',
      status: 'pending',
      assessmentScore: 80.0,
      attemptsCount: 1,
      maxAttempts: 2,
    },
  ]);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [certTitle, setCertTitle] = useState('');
  const [skillName, setSkillName] = useState('');
  const [issuer, setIssuer] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Partial upload retry cache (prevents duplicate storage uploads if DB registration fails)
  const [alreadyUploadedPath, setAlreadyUploadedPath] = useState<string | null>(null);
  const [alreadyUploadedUrl, setAlreadyUploadedUrl] = useState<string | null>(null);
  const [studentProfileId, setStudentProfileId] = useState<string>('');

  // Subject classification state
  const [classification, setClassification] = useState<SubjectClassificationResult | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<AssessmentSubject>('python');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Assessment runner state
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [activeAssessmentSub, setActiveAssessmentSub] = useState<CertificateItem | null>(null);

  // Resolve authenticated student profile on mount / auth change
  useEffect(() => {
    async function resolveStudent() {
      if (!user) return;
      try {
        const studentIdentifier = user.usn || user.id || user.email;
        if (!studentIdentifier) return;
        const param = studentIdentifier.includes('@')
          ? `id=${encodeURIComponent(studentIdentifier)}`
          : `usn=${encodeURIComponent(studentIdentifier)}`;

        const res = await fetch(`/api/students?${param}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.student?.profile?.id) {
            setStudentProfileId(data.student.profile.id);
          }
        }
      } catch (err) {
        console.warn('Student profile auto-resolve warning:', err);
      }
    }
    resolveStudent();
  }, [user]);

  // Auto classify subject whenever title, issuer, or skill changes
  useEffect(() => {
    if (!certTitle.trim() && !skillName.trim()) {
      setClassification(null);
      return;
    }

    const result = classifyCertificateSubject({
      title: certTitle,
      issuer,
      skillName,
    });

    setClassification(result);
    setSelectedSubject(result.subject);
  }, [certTitle, issuer, skillName]);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    // Validation
    if (!user) {
      setUploadError('Authentication required: Please sign in as a student to register certificates.');
      return;
    }
    if (!certTitle.trim()) {
      setUploadError('Please provide a certificate title.');
      return;
    }
    if (!skillName.trim()) {
      setUploadError('Please specify an associated technical skill.');
      return;
    }
    if (!selectedFile && !credentialUrl.trim() && !alreadyUploadedPath) {
      setUploadError('Please select a certificate document (.pdf) or provide a verifiable credential URL.');
      return;
    }
    if (selectedFile && selectedFile.size > 15 * 1024 * 1024) {
      setUploadError('Certificate file exceeds maximum allowed limit of 15MB.');
      return;
    }

    setSubmitting(true);

    try {
      let documentStoragePath: string | undefined = alreadyUploadedPath || undefined;
      let finalFileUrl: string | undefined = alreadyUploadedUrl || credentialUrl.trim() || undefined;

      // 1. Upload certificate PDF to storage (skipped if already uploaded during retry)
      if (selectedFile && !alreadyUploadedPath) {
        setUploadingFile(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('folder', 'certificates');
        formData.append('studentId', studentProfileId || user?.id || user?.usn || '');

        let uploadRes: Response;
        try {
          uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
        } catch (netErr: any) {
          setUploadingFile(false);
          throw new Error(
            `[Upload Network Error] Could not connect to the upload service at /api/upload: ${netErr.message || 'Server unreachable'}. Verify your dev server is active.`
          );
        }

        setUploadingFile(false);

        let uploadData: any;
        try {
          uploadData = await uploadRes.json();
        } catch {
          throw new Error(
            `[Upload Server Error] Server returned HTTP ${uploadRes.status} (${uploadRes.statusText}) with invalid format.`
          );
        }

        if (!uploadRes.ok) {
          throw new Error(uploadData?.error || `[Upload Error] HTTP ${uploadRes.status}: Unable to upload certificate.`);
        }

        documentStoragePath = uploadData.document_storage_path;
        finalFileUrl = uploadData.file_url || credentialUrl.trim() || undefined;

        // Cache upload results so retries do not create duplicate uploads
        setAlreadyUploadedPath(documentStoragePath || null);
        setAlreadyUploadedUrl(finalFileUrl || null);
      }

      // 2. Persist Evidence Submission to Database
      const effectiveStudentId = studentProfileId || user?.id || '';

      const evidencePayload = {
        student_id: effectiveStudentId,
        title: certTitle.trim(),
        skill_name: skillName.trim(),
        credential_url: finalFileUrl || undefined,
        document_storage_path: documentStoragePath,
        type: 'certificate',
        subject: selectedSubject,
        issuer_or_organization: issuer.trim() || 'Authorized Certifying Authority',
        description: `Certificate issued by ${issuer.trim() || 'Authorized Organization'} in ${SUBJECT_METADATA[selectedSubject]?.label || selectedSubject}. Verified academic credential.`,
      };

      let res: Response;
      try {
        res = await fetch('/api/evidence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(evidencePayload),
        });
      } catch (netErr: any) {
        throw new Error(
          `[Registration Network Error] Could not connect to /api/evidence: ${netErr.message || 'Server unreachable'}.`
        );
      }

      let data: any;
      try {
        data = await res.json();
      } catch {
        throw new Error(
          `[Registration Server Error] Server returned HTTP ${res.status} (${res.statusText}) with non-JSON response.`
        );
      }

      if (!res.ok) {
        throw new Error(data?.error || `[Registration Error] HTTP ${res.status}: Failed to register certificate submission.`);
      }

      if (!data?.submission?.id) {
        throw new Error('[Registration Error] Database registration did not return a valid submission ID. Please try again.');
      }

      const generatedId = data.submission.id;

      // Append new certificate in pending_assessment status
      const newCert: CertificateItem = {
        id: generatedId,
        title: certTitle.trim(),
        skillName: skillName.trim(),
        subject: selectedSubject,
        subjectLabel: SUBJECT_METADATA[selectedSubject]?.label || selectedSubject,
        issuer: issuer.trim() || 'Authorized Certification Board',
        date: 'Today',
        credentialUrl: finalFileUrl,
        fileName: selectedFile ? selectedFile.name : 'Verified_Credential.pdf',
        fileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.2 MB',
        status: 'pending_assessment',
        assessmentScore: null,
        attemptsCount: 0,
        maxAttempts: 2,
        canRetake: false,
      };

      setCertificates([newCert, ...certificates]);
      setSuccessMsg('Certificate registered successfully! Launching assessment exam...');

      // Open assessment after brief toast
      setTimeout(() => {
        setShowUploadModal(false);
        setSuccessMsg('');
        setCertTitle('');
        setSkillName('');
        setIssuer('');
        setCredentialUrl('');
        setSelectedFile(null);
        setAlreadyUploadedPath(null);
        setAlreadyUploadedUrl(null);
        // Prompt assessment immediately
        setActiveAssessmentSub(newCert);
        setAssessmentModalOpen(true);
      }, 1000);
    } catch (err: any) {
      setUploadError(err.message || 'An error occurred during submission.');
    } finally {
      setSubmitting(false);
      setUploadingFile(false);
    }
  };

  const handleAssessmentCompleted = (evalResult: CertificateAssessment) => {
    setCertificates((prev) =>
      prev.map((c) => {
        if (c.id === evalResult.submission_id) {
          return {
            ...c,
            status: 'pending',
            assessmentScore: evalResult.score_percentage,
            attemptsCount: evalResult.attempt_number,
            canRetake: false,
          };
        }
        return c;
      })
    );
  };

  const openAssessmentForCert = (cert: CertificateItem) => {
    setActiveAssessmentSub(cert);
    setAssessmentModalOpen(true);
  };

  const removeCert = (id: string) => {
    setCertificates(certificates.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Award className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Certificates & Verified Evidence
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              Deterministic Assessment Gate
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Upload course certificates, complete subject-specific assessments, and receive faculty mentor verification for your Skill Passport.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/student/skill-passport"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 transition-colors shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span>View Skill Passport</span>
          </Link>

          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 transition-all hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload New Certificate</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">Total Uploaded</span>
            <Award className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {certificates.length}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Credentials recorded</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              Verified by Faculty
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {certificates.filter((c) => c.status === 'verified').length}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Unlocked in Skill Passport</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
              Pending Mentor Review
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {certificates.filter((c) => c.status === 'pending').length}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Awaiting mentor decision</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
              Action Required
            </span>
            <BrainCircuit className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {certificates.filter((c) => c.status === 'pending_assessment' || c.status === 'retake_granted').length}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Exam or retake pending</p>
        </div>
      </div>

      {/* Certificates List */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Recorded Credentials & Proof Documents
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => {
            const hasScore = typeof cert.assessmentScore === 'number';

            return (
              <div
                key={cert.id}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div>
                  {/* Status Badge & Issuer */}
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {cert.issuer}
                    </span>

                    {cert.status === 'verified' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified by Faculty
                      </span>
                    ) : cert.status === 'retake_granted' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
                        <RotateCcw className="w-3 h-3 animate-spin" />
                        Retake Authorized
                      </span>
                    ) : cert.status === 'pending_assessment' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                        <Clock className="w-3 h-3" />
                        Assessment Required
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-500/30">
                        <Clock className="w-3 h-3" />
                        Pending Mentor Review
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {cert.title}
                  </h3>
                  <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    Domain: {cert.subjectLabel} ({cert.skillName})
                  </p>

                  {/* Assessment Score Snapshot */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4 text-indigo-500" />
                      <span className="text-slate-600 dark:text-slate-400 font-medium">
                        Verification Assessment:
                      </span>
                    </div>

                    {hasScore ? (
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-black font-mono px-2 py-0.5 rounded-md text-xs ${
                            cert.assessmentScore! >= 60.0
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {cert.assessmentScore}%
                        </span>
                        <span className="text-[10px] text-slate-400">
                          (Attempt {cert.attemptsCount || 1} of 2)
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                        Not taken yet
                      </span>
                    )}
                  </div>

                  {/* Retake feedback banner if granted */}
                  {cert.status === 'retake_granted' && cert.retakeFeedback && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
                      <span className="font-bold flex items-center gap-1 text-[11px]">
                        <RotateCcw className="w-3 h-3 text-indigo-600" />
                        Faculty Mentor Retake Feedback:
                      </span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 italic">
                        &quot;{cert.retakeFeedback}&quot;
                      </p>
                    </div>
                  )}

                  {/* File Details */}
                  <div className="mt-2.5 p-2 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                        {cert.fileName}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{cert.fileSize}</span>
                  </div>

                  {cert.verifiedBy && (
                    <p className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Endorsed by: <span className="text-slate-600 dark:text-slate-300">{cert.verifiedBy}</span>
                    </p>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] text-slate-400">{cert.date}</span>

                  <div className="flex items-center gap-2">
                    {/* Take / Retake Assessment Button */}
                    {(cert.status === 'pending_assessment' || cert.status === 'retake_granted') && (
                      <button
                        onClick={() => openAssessmentForCert(cert)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all"
                      >
                        <BrainCircuit className="w-3.5 h-3.5" />
                        <span>{cert.status === 'retake_granted' ? 'Retake Exam' : 'Take Exam'}</span>
                      </button>
                    )}

                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Open external credential URL"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}

                    <button
                      onClick={() => removeCert(cert.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Remove certificate"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Certificate Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-indigo-600" />
                <span>Upload Certificate for Verification</span>
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleFileUpload} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Certificate Title / Qualification *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Certified Solutions Architect Associate"
                  value={certTitle}
                  onChange={(e) => setCertTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Associated Core Skill *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud Computing, Machine Learning, Python, DSA"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Subject Classification & Confirmation */}
              {classification && (
                <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Detected Assessment Subject:
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      Confidence: {Math.round(classification.confidence * 100)}%
                    </span>
                  </div>

                  <div>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value as AssessmentSubject)}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                    >
                      {Object.entries(SUBJECT_METADATA).map(([key, meta]) => (
                        <option key={key} value={key}>
                          {meta.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {classification.needsConfirmation && (
                    <p className="text-[10px] text-amber-700 dark:text-amber-400">
                      Ambiguous subject detection. Please confirm or select the correct examination domain above.
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Issuing Organization / Institution
                </label>
                <input
                  type="text"
                  placeholder="e.g. Amazon Web Services, IIT Madras, Coursera, HackerRank"
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Online Verification URL (optional)
                </label>
                <input
                  type="url"
                  placeholder="https://credential.net/verify/..."
                  value={credentialUrl}
                  onChange={(e) => setCredentialUrl(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Upload PDF or Certificate Document (.pdf, max 10MB) *
                </label>
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:border-indigo-500 transition-colors bg-slate-50/50 dark:bg-slate-950/50">
                  <UploadCloud className="w-6 h-6 text-indigo-500 mb-1" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 text-center">
                    {selectedFile ? selectedFile.name : 'Select authentic certificate PDF'}
                  </span>
                  <span className="text-[10px] text-slate-400">PDF documents only (up to 10MB)</span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => { setSelectedFile(e.target.files?.[0] || null); setAlreadyUploadedPath(null); setAlreadyUploadedUrl(null); setUploadError(null); }}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingFile}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 flex items-center gap-1.5"
                >
                  {uploadingFile ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading PDF...</span>
                    </>
                  ) : submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Register & Take Exam</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Assessment Modal */}
      {activeAssessmentSub && (
        <CertificateAssessmentModal
          isOpen={assessmentModalOpen}
          onClose={() => {
            setAssessmentModalOpen(false);
            setActiveAssessmentSub(null);
          }}
          submissionId={activeAssessmentSub.id}
          studentId={studentProfileId || user?.id || ''}
          subject={activeAssessmentSub.subject}
          subjectLabel={activeAssessmentSub.subjectLabel}
          certificateTitle={activeAssessmentSub.title}
          onAssessmentCompleted={handleAssessmentCompleted}
        />
      )}
    </div>
  );
}
