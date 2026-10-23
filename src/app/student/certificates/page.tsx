'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import Link from 'next/link';

interface CertificateItem {
  id: string;
  title: string;
  skillName: string;
  issuer: string;
  date: string;
  credentialUrl?: string;
  fileName: string;
  fileSize: string;
  status: 'verified' | 'pending' | 'revision';
  verifiedBy?: string;
}

export default function CertificatesPage() {
  const { user } = useAuth();

  // Local state for certificates
  const [certificates, setCertificates] = useState<CertificateItem[]>([
    {
      id: 'cert-1',
      title: 'AWS Certified Solutions Architect – Associate',
      skillName: 'Cloud Computing & AWS Architecture',
      issuer: 'Amazon Web Services (AWS)',
      date: 'Aug 2025',
      credentialUrl: 'https://aws.amazon.com/verification/AWS-98765432',
      fileName: 'AWS_Solutions_Architect_Certificate.pdf',
      fileSize: '1.4 MB',
      status: 'verified',
      verifiedBy: 'Dr. Srinivas Rao (Faculty Mentor)',
    },
    {
      id: 'cert-2',
      title: 'Deep Learning Specialization with PyTorch',
      skillName: 'Machine Learning & Deep Neural Networks',
      issuer: 'DeepLearning.AI / Coursera',
      date: 'Nov 2025',
      credentialUrl: 'https://coursera.org/verify/DL-AI-2025',
      fileName: 'Deep_Learning_PyTorch_Specialization.pdf',
      fileSize: '820 KB',
      status: 'verified',
      verifiedBy: 'Prof. Ananya Shenoy (CSE Dept)',
    },
    {
      id: 'cert-3',
      title: 'NPTEL Elite Certificate in Distributed Systems',
      skillName: 'Distributed Systems & Concurrency',
      issuer: 'IIT Kharagpur / NPTEL',
      date: 'Jan 2026',
      fileName: 'NPTEL_Distributed_Systems_Elite.pdf',
      fileSize: '2.1 MB',
      status: 'pending',
    },
  ]);

  // Upload modal / form state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [certTitle, setCertTitle] = useState('');
  const [skillName, setSkillName] = useState('');
  const [issuer, setIssuer] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certTitle || !skillName) return;

    setSubmitting(true);
    try {
      // Call /api/evidence
      const payload = {
        student_id: user?.usn || user?.id || user?.email || '4NM22CS120',
        title: certTitle,
        skill_name: skillName,
        credential_url: credentialUrl || undefined,
        document_storage_path: selectedFile ? `/uploads/${selectedFile.name}` : '/uploads/cert_evidence.pdf',
        type: 'certificate',
        description: `Certificate from ${issuer || 'Authorized Issuing Body'}. Verified credentials.`,
      };

      await fetch('/api/evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Append to local state
      const newCert: CertificateItem = {
        id: `cert-${Date.now()}`,
        title: certTitle,
        skillName,
        issuer: issuer || 'Authorized Certification Board',
        date: 'Today',
        credentialUrl: credentialUrl || undefined,
        fileName: selectedFile ? selectedFile.name : 'Uploaded_Credential_Document.pdf',
        fileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.1 MB',
        status: 'pending',
      };

      setCertificates([newCert, ...certificates]);
      setSuccessMsg('Certificate submitted successfully! Routed to Faculty Mentor Review Desk.');
      setCertTitle('');
      setSkillName('');
      setIssuer('');
      setCredentialUrl('');
      setSelectedFile(null);
      setTimeout(() => {
        setShowUploadModal(false);
        setSuccessMsg('');
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
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
              Cryptographic Skill Passport Integration
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Submit authentic course certificates and technical credentials for faculty mentor audit and cryptographic endorsement.
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
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload New Certificate</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">Total Uploaded</span>
            <Award className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {certificates.length}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Credentials recorded on system</p>
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
          <p className="mt-1 text-[11px] text-slate-400">Endorsed into Skill Passport</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
              Pending Review
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {certificates.filter((c) => c.status === 'pending').length}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Under faculty evaluation</p>
        </div>
      </div>

      {/* Certificates List */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Recorded Credentials & Proof Documents
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div>
                {/* Status Badge & Issuer */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {cert.issuer}
                  </span>

                  {cert.status === 'verified' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified by Faculty
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                      <Clock className="w-3 h-3" />
                      Pending Audit
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {cert.title}
                </h3>
                <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                  Associated Competency: {cert.skillName}
                </p>

                {/* File Details */}
                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
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
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">{cert.date}</span>

                <div className="flex items-center gap-2">
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
          ))}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-indigo-600" />
                Submit Certificate for Faculty Endorsement
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleFileUpload} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Certificate Title / Qualification *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Certified Developer Associate"
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
                  placeholder="e.g. Cloud Computing, Python, Generative AI"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Issuing Organization / Institution
                </label>
                <input
                  type="text"
                  placeholder="e.g. Amazon Web Services, IIT Madras, Coursera"
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
                  Upload PDF or Certificate Image (.pdf, .png, .jpg)
                </label>
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:border-indigo-500 transition-colors bg-slate-50/50 dark:bg-slate-950/50">
                  <UploadCloud className="w-6 h-6 text-indigo-500 mb-1" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {selectedFile ? selectedFile.name : 'Choose file or drag & drop'}
                  </span>
                  <span className="text-[10px] text-slate-400">Up to 10MB</span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
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
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
                >
                  {submitting ? 'Submitting to Desk...' : 'Submit to Faculty Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
