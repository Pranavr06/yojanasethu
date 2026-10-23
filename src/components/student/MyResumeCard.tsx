'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  X,
  FileCheck,
  Loader2,
} from 'lucide-react';
import { StudentUploadedResume } from '@/types';

interface MyResumeCardProps {
  studentId?: string;
  onUpdate?: () => void;
}

export default function MyResumeCard({ studentId, onUpdate }: MyResumeCardProps) {
  const [resume, setResume] = useState<StudentUploadedResume | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchResumeStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = studentId
        ? `/api/student/resume/status?student_id=${encodeURIComponent(studentId)}`
        : '/api/student/resume/status';
      const res = await fetch(url);
      const data = await res.json();

      if (res.ok && data.hasResume && data.resume) {
        setResume(data.resume);
      } else {
        setResume(null);
      }
    } catch (err: any) {
      console.error('Failed to load resume status:', err);
      setError('Unable to fetch resume status. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumeStatus();
  }, [studentId]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setError('Please select a valid PDF file (.pdf).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError('File size exceeds the 15MB limit.');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccessMsg(null);

      const formData = new FormData();
      formData.append('file', file);
      if (studentId) {
        formData.append('student_id', studentId);
      }

      const res = await fetch('/api/student/resume/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload resume.');
      }

      setResume(data.resume);
      setSuccessMsg(
        resume ? 'Permanent resume updated successfully!' : 'Official resume uploaded and permanently stored!'
      );
      if (onUpdate) onUpdate();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Error uploading resume. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteResume = async () => {
    if (!confirm('Are you sure you want to remove your permanent resume? You will need to upload a new resume for mentors and placement coordinators.')) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);

      const url = studentId
        ? `/api/student/resume/delete?student_id=${encodeURIComponent(studentId)}`
        : '/api/student/resume/delete';
      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete resume.');
      }

      setResume(null);
      setSuccessMsg('Resume removed successfully.');
      if (onUpdate) onUpdate();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || 'Error removing resume.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Just now';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const streamingUrl = resume
    ? `/api/recruiter/resume/file?path=${encodeURIComponent(resume.storage_path)}`
    : '';
  const downloadUrl = resume
    ? `/api/recruiter/resume/file?path=${encodeURIComponent(resume.storage_path)}&download=true`
    : '';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50/50 to-slate-100/60 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950 p-6 shadow-sm hover:shadow-md transition-all">
      {/* Decorative ambient gradient */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="application/pdf,.pdf"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">My Resume</h2>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Permanent Storage
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your official resume accessible to verified mentors, placement coordinators, and campus recruiters.
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {loading ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking...
            </span>
          ) : resume ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Resume on File</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Resume Not Uploaded</span>
            </span>
          )}
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Body Content */}
      <div className="mt-5">
        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mb-2" />
            <p className="text-xs text-slate-400">Verifying resume in Supabase documents repository...</p>
          </div>
        ) : resume ? (
          /* Resume Exists State */
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-slate-900 dark:text-white break-all">
                    {resume.file_name}
                  </span>
                  {resume.file_size && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {resume.file_size}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                  <span>Last updated: {formatDate(resume.updated_at || resume.uploaded_at)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" /> Synced to Placements & Mentors
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap self-end lg:self-center shrink-0">
              {/* View */}
              <button
                onClick={() => setIsViewerOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                title="View Resume Document"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View</span>
              </button>

              {/* Download */}
              <a
                href={downloadUrl}
                download={resume.file_name}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Download Resume PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>

              {/* Replace */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50"
                title="Replace with updated version"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${uploading ? 'animate-spin' : ''}`} />
                <span>{uploading ? 'Uploading...' : 'Replace'}</span>
              </button>

              {/* Delete */}
              <button
                onClick={handleDeleteResume}
                disabled={deleting}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors disabled:opacity-50"
                title="Remove uploaded resume"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Empty / Upload Prompt State */
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 text-center sm:text-left">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                No official resume uploaded yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                Upload your latest PDF resume. Once uploaded, it is permanently stored and automatically visible to your assigned mentor, placement coordinator, and campus recruiters.
              </p>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow transition-all disabled:opacity-50 shrink-0"
            >
              <Upload className={`w-4 h-4 ${uploading ? 'animate-spin' : ''}`} />
              <span>{uploading ? 'Uploading PDF...' : 'Upload Resume (PDF)'}</span>
            </button>
          </div>
        )}

        {/* Footer: Distinction from AI Resume Builder */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Need to craft a targeted resume or audit your ATS score?</span>
          </span>
          <Link
            href="/student/resume-builder"
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Open AI Resume Builder & ATS Analyzer</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {isViewerOpen && resume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-4xl h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate max-w-md">
                  {resume.file_name}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800/40">
                  Permanent Resume
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={downloadUrl}
                  download={resume.file_name}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  title="Download PDF"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setIsViewerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: Embedded PDF */}
            <div className="flex-1 bg-slate-100 dark:bg-slate-950">
              <iframe
                src={`${streamingUrl}#toolbar=1&navpanes=0`}
                title="Student Resume Viewer"
                className="w-full h-full border-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
