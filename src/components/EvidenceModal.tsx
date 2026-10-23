'use client';

import React, { useState } from 'react';
import {
  X,
  Upload,
  Github,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  defaultSkill?: string;
  onSuccess: () => void;
}

export default function EvidenceModal({
  isOpen,
  onClose,
  studentId,
  defaultSkill = 'Python',
  onSuccess,
}: Props) {
  const [activeTab, setActiveTab] = useState<'github' | 'certificate'>('github');
  const [skillName, setSkillName] = useState(defaultSkill);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);
    setIsError(false);

    try {
      let documentStoragePath: string | undefined;
      let credentialUrl: string | undefined;

      // 1. If certificate PDF was selected, upload to Supabase Storage bucket first
      if (activeTab === 'certificate' && selectedFile) {
        setStatusMessage('Uploading certificate PDF to Supabase Storage bucket...');
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('folder', 'certificates');
        formData.append('studentId', 'NNM24IS159');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || 'Failed to upload PDF to Supabase Storage');
        }

        documentStoragePath = uploadData.document_storage_path;
        credentialUrl = uploadData.file_url;
      }

      // 2. Submit Evidence record to Database
      setStatusMessage('Saving evidence to database and notifying faculty mentor...');
      const evidencePayload = {
        student_id: studentId,
        title: title || (activeTab === 'github' ? 'Machine Learning Pipeline Repo' : 'Verified Course Certificate'),
        skill_name: skillName,
        github_repo_url: activeTab === 'github' ? (githubUrl || undefined) : undefined,
        document_storage_path: documentStoragePath,
        credential_url: credentialUrl,
        type: activeTab === 'certificate' ? 'certificate' : 'github_repo',
        description: description || 'Submitted for faculty mentor review.',
      };

      const res = await fetch('/api/evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evidencePayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit evidence');
      }

      setStatusMessage('Evidence submitted successfully! Status set to Pending Mentor Approval.');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 900);
    } catch (err: any) {
      setIsError(true);
      setStatusMessage(err.message || 'Error submitting evidence');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg glass-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Submit Verifiable Evidence
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transforms claims into faculty-verified achievements
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 gap-2 my-4 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('github')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
              activeTab === 'github'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Github className="w-4 h-4" />
            GitHub Repository
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('certificate')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
              activeTab === 'certificate'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            Certificate PDF (S3 Bucket)
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
              Target Skill to Evidencify
            </label>
            <select
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="Python">Python (Currently Self-Declared on Resume)</option>
              <option value="SQL">SQL (Identified Missing Gap)</option>
              <option value="PyTorch">PyTorch (Deep Learning)</option>
              <option value="Data Analysis">Data Analysis & Pandas</option>
              <option value="Git & GitHub">Git & GitHub</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
              Project / Credential Title
            </label>
            <input
              type="text"
              placeholder="e.g. End-to-End Sentiment Classification Pipeline"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {activeTab === 'github' ? (
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                GitHub Repository URL
              </label>
              <input
                type="url"
                placeholder="https://github.com/username/project-repo"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                required={activeTab === 'github'}
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                Must include clean commits, README, and reproducible code.
              </span>
            </div>
          ) : (
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                Upload Certificate PDF (Supabase Storage)
              </label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-slate-700 rounded-xl p-4 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-950/50 transition-colors">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="pdf-upload"
                  required={activeTab === 'certificate'}
                />
                <label htmlFor="pdf-upload" className="cursor-pointer block">
                  <Upload className="w-6 h-6 text-indigo-500 dark:text-indigo-400 mx-auto mb-1" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium block">
                    {selectedFile ? selectedFile.name : 'Click to select certificate PDF'}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Max 10MB • Stores in Supabase documents bucket
                  </span>
                </label>
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
              Technical Description & Notes for Mentor
            </label>
            <textarea
              rows={2}
              placeholder="Explain algorithms used, datasets, and how you evaluated performance..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Feedback message */}
          {statusMessage && (
            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs ${
                isError
                  ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300'
                  : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              {isError ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-medium shadow-md shadow-indigo-600/20 disabled:opacity-60 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Submit Proof for Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
