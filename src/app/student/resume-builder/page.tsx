import Link from 'next/link';
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/authContext';
import {
  ResumeData,
  ResumeAnalysisResult,
  SavedResume,
  ResumeTemplateType,
} from '@/types';
import ResumePreviewDocument from '@/components/student/ResumePreviewDocument';
import {
  FileText,
  Sparkles,
  UploadCloud,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  Eye,
  Edit3,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  Code2,
  Award,
  Layers,
  ArrowRight,
  Plus,
  Trash2,
  Save,
  Check,
  ChevronDown,
  X,
  FileCheck,
  HelpCircle,
  Search,
  BookOpen,
  ArrowUpDown,
  FileSearch,
  Wand2,
} from 'lucide-react';

const TARGET_ROLE_PRESETS = [
  'Software Development Engineer',
  'Full Stack Developer',
  'Frontend Engineer',
  'Backend Engineer',
  'AI/ML Engineer',
  'Cloud & DevOps Engineer',
  'Data Engineer',
  'Cybersecurity Analyst',
];

export default function ResumeBuilderPage() {
  const { user } = useAuth();

  // Workflow tab: 1: Input, 2: Analysis, 3: Editor & Live Preview
  const [currentStep, setCurrentStep] = useState<'input' | 'analysis' | 'editor'>('input');
  const [template, setTemplate] = useState<ResumeTemplateType>('modern');

  // Saved resumes state
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
  const [resumeTitle, setResumeTitle] = useState('My Technical Resume');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Target Role & Job Description
  const [targetRole, setTargetRole] = useState('Software Development Engineer');
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [showJdModal, setShowJdModal] = useState(false);

  // Upload & File handling state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Loading states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isEnhancingSection, setIsEnhancingSection] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Analysis result
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);

  // Core Resume Data state
  const [resume, setResume] = useState<ResumeData>({
    contact: {
      fullName: user?.full_name || 'Pranav R',
      email: user?.email || 'pranav.r@nmamit.in',
      phone: '+91 98765 43210',
      location: 'Nitte, Karnataka, India',
      linkedin: 'linkedin.com/in/pranav-r',
      github: 'github.com/pranavr06',
    },
    summary:
      'Proactive Computer Science & Engineering undergraduate with deep competence in Full-Stack Development, Distributed Systems, and Machine Learning. Passionate about architecting resilient cloud systems and solving complex algorithmic challenges.',
    targetRole: 'Software Development Engineer',
    education: {
      institution: 'NMAM Institute of Technology, Nitte (Autonomous)',
      degree: 'Bachelor of Technology',
      field: 'Computer Science & Engineering',
      cgpa: '8.85 / 10.0',
      startYear: '2022',
      endYear: '2026',
      location: 'Nitte, Karnataka',
      isVerified: true,
    },
    skills: {
      languages: ['TypeScript', 'Python', 'Java', 'SQL', 'C++'],
      frameworks: ['Next.js', 'React', 'Node.js', 'Express', 'Tailwind CSS'],
      toolsAndCloud: ['Docker', 'Git', 'GitHub', 'PostgreSQL', 'AWS', 'Redis'],
      coreCompetencies: ['Data Structures & Algorithms', 'System Design', 'RESTful APIs', 'Microservices'],
    },
    projects: [
      {
        id: 'p-1',
        title: 'YojanaSethu — Autonomous Career & Placement Transparency Engine',
        techStack: ['Next.js 14', 'TypeScript', 'Supabase', 'PostgreSQL', 'Tailwind CSS'],
        githubUrl: 'https://github.com/Pranavr06/yojanasethu',
        description:
          'Engineered an enterprise-grade placement platform with 5-role RBAC, Contineo ERP synchronization, verifiable cryptographic skill passports, and deterministic CGPA simulation.',
      },
      {
        id: 'p-2',
        title: 'Distributed Real-time Telemetry Engine',
        techStack: ['Go', 'Apache Kafka', 'Redis', 'InfluxDB', 'Docker'],
        githubUrl: 'https://github.com/pranavr06/telemetry-engine',
        description:
          'Constructed an event-driven telemetry pipeline processing 15k+ events/sec with sub-50ms query latencies and automated failure recovery.',
      },
    ],
    experience: [
      {
        id: 'e-1',
        role: 'Full Stack Engineering Intern',
        company: 'Nexus AI Technologies',
        location: 'Bengaluru, India',
        startDate: 'June 2025',
        endDate: 'August 2025',
        description:
          'Spearheaded development of microfrontend dashboards used by 10k+ enterprise users. Reduced client bundle payload by 38% via lazy hydration and code-splitting.',
      },
    ],
    certifications: [
      {
        id: 'c-1',
        name: 'Google Cloud Certified Associate Cloud Engineer',
        issuer: 'Google Cloud',
        date: '2025',
        isVerified: true,
        score: 94,
      },
      {
        id: 'c-2',
        name: 'HackerRank 5-Star Problem Solving Gold Badge',
        issuer: 'HackerRank',
        date: '2024',
        isVerified: false,
      },
    ],
    achievements: [
      'Top 5% Cohort Academic Honor Roll across School of Computing at NMAMIT',
      'Finalist in National Level Hackathon (Nexathon 2026) for institutional ERP innovation',
    ],
  });

  // 1. Fetch Saved Resumes from Supabase on mount
  const fetchSavedResumes = async () => {
    try {
      const studentId = user?.id || '11111111-1111-1111-1111-111111111111';
      const res = await fetch(`/api/resume?student_id=${encodeURIComponent(studentId)}`);
      const data = await res.json();
      if (data?.resumes && Array.isArray(data.resumes)) {
        setSavedResumes(data.resumes);
        if (data.resumes.length > 0 && !activeResumeId) {
          const first = data.resumes[0];
          setActiveResumeId(first.id);
          setResumeTitle(first.title);
          setTemplate(first.template || 'modern');
          setTargetRole(first.target_role || 'Software Development Engineer');
          if (first.resume_data) setResume(first.resume_data);
          if (first.analysis_result) setAnalysisResult(first.analysis_result);
        }
      }
    } catch (err) {
      console.warn('Failed to load saved resumes:', err);
    }
  };

  useEffect(() => {
    fetchSavedResumes();
  }, [user]);

  // 2. Import Profile from YojanaSethu database
  const handleImportProfile = async () => {
    setIsImporting(true);
    setErrorMessage(null);
    try {
      const studentId = user?.id || user?.usn || '4NM22CS120';
      const res = await fetch(`/api/resume/import-profile?student_id=${encodeURIComponent(studentId)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to import profile.');
      }

      if (data.resumeData) {
        setResume(data.resumeData);
        if (data.resumeData.targetRole) {
          setTargetRole(data.resumeData.targetRole);
        }
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error importing profile from institutional database.');
    } finally {
      setIsImporting(false);
    }
  };

  // 3. File Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setFileError(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'doc', 'txt'].includes(ext || '')) {
      setFileError('Invalid file type. Please upload a PDF or DOCX resume document.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File size exceeds the 10MB limit. Please upload a smaller document.');
      return;
    }
    setSelectedFile(file);
  };

  // 4. Trigger AI Resume Analysis
  const handleAnalyzeResume = async () => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      let res: Response;
      const effectiveRole = isCustomRole ? customRoleInput : targetRole;

      if (selectedFile) {
        // Multipart upload
        const fd = new FormData();
        fd.append('file', selectedFile);
        fd.append('targetRole', effectiveRole);
        if (jobDescription) fd.append('jobDescription', jobDescription);

        res = await fetch('/api/resume/analyze', {
          method: 'POST',
          body: fd,
        });
      } else {
        // JSON payload from current editor state
        res = await fetch('/api/resume/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumeData: resume,
            targetRole: effectiveRole,
            jobDescription,
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze resume.');
      }

      setAnalysisResult(data);

      // If AI extracted sections from the uploaded file, populate them into the editor!
      if (data.extractedSections && Object.keys(data.extractedSections).length > 0) {
        const ext = data.extractedSections;
        setResume((prev) => ({
          ...prev,
          contact: {
            ...prev.contact,
            fullName: ext.contact?.fullName || prev.contact.fullName,
            email: ext.contact?.email || prev.contact.email,
            phone: ext.contact?.phone || prev.contact.phone,
            location: ext.contact?.location || prev.contact.location,
            linkedin: ext.contact?.linkedin || prev.contact.linkedin,
            github: ext.contact?.github || prev.contact.github,
          },
          summary: ext.summary || prev.summary,
          education: ext.education
            ? { ...prev.education, ...ext.education }
            : prev.education,
          skills: ext.skills
            ? { ...prev.skills, ...ext.skills }
            : prev.skills,
          projects: ext.projects && ext.projects.length > 0
            ? ext.projects.map((p: any, idx: number) => ({
                id: p.id || `proj-ext-${idx}`,
                title: p.title || 'Project',
                techStack: Array.isArray(p.techStack) ? p.techStack : ['Full-Stack'],
                description: p.description || '',
                githubUrl: p.githubUrl,
              }))
            : prev.projects,
          experience: ext.experience && ext.experience.length > 0
            ? ext.experience.map((e: any, idx: number) => ({
                id: e.id || `exp-ext-${idx}`,
                role: e.role || 'Intern',
                company: e.company || 'Company',
                startDate: e.startDate || '',
                endDate: e.endDate || '',
                description: e.description || '',
              }))
            : prev.experience,
        }));
      }

      setCurrentStep('analysis');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error executing AI resume audit.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 5. Trigger Full AI Generation / Enhancement
  const handleGenerateAiResume = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const effectiveRole = isCustomRole ? customRoleInput : targetRole;
      const res = await fetch('/api/resume/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeData: resume,
          targetRole: effectiveRole,
          targetJobDescription: jobDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate enhanced resume.');
      }

      if (data.resume) {
        setResume(data.resume);
        setCurrentStep('editor');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error generating AI enhanced resume.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 6. Enhance a specific section via AI
  const handleEnhanceSection = async (section: 'summary' | 'projects' | 'experience' | 'skills') => {
    setIsEnhancingSection(section);
    setErrorMessage(null);
    try {
      const effectiveRole = isCustomRole ? customRoleInput : targetRole;
      const content =
        section === 'summary'
          ? resume.summary
          : section === 'projects'
          ? resume.projects
          : section === 'experience'
          ? resume.experience
          : resume.skills;

      const res = await fetch('/api/resume/enhance-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section,
          content,
          targetRole: effectiveRole,
          targetJobDescription: jobDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to enhance section.');

      if (data.enhanced) {
        setResume((prev) => ({
          ...prev,
          [section]: data.enhanced,
        }));
      }
    } catch (err: any) {
      setErrorMessage(err.message || `Error enhancing ${section} section.`);
    } finally {
      setIsEnhancingSection(null);
    }
  };

  // 7. Save Resume to Supabase Cloud
  const handleSaveToCloud = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const studentId = user?.id || '11111111-1111-1111-1111-111111111111';
      const effectiveRole = isCustomRole ? customRoleInput : targetRole;

      const res = await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeResumeId || undefined,
          student_id: studentId,
          title: resumeTitle,
          target_role: effectiveRole,
          target_job_description: jobDescription || undefined,
          template,
          resume_data: resume,
          analysis_result: analysisResult,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save resume.');

      if (data.resume) {
        setActiveResumeId(data.resume.id);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        fetchSavedResumes();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving resume to cloud.');
    } finally {
      setIsSaving(false);
    }
  };

  // 8. Create a new empty / template resume
  const handleCreateNewResume = () => {
    setActiveResumeId(null);
    setResumeTitle(`Technical Resume ${savedResumes.length + 1}`);
    setAnalysisResult(null);
    setSelectedFile(null);
    setCurrentStep('input');
  };

  // 9. Load a selected saved resume
  const handleSelectSavedResume = (savedId: string) => {
    const found = savedResumes.find((r) => r.id === savedId);
    if (found) {
      setActiveResumeId(found.id);
      setResumeTitle(found.title);
      setTemplate(found.template || 'modern');
      setTargetRole(found.target_role || 'Software Development Engineer');
      setJobDescription(found.target_job_description || '');
      setResume(found.resume_data);
      setAnalysisResult(found.analysis_result || null);
      setCurrentStep('editor');
    }
  };

  // Print / Save to PDF
  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* ===================================================================== */}
      {/* 1. TOP HEADER & TOOLBAR */}
      {/* ===================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5 print:hidden">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 shadow-sm">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  AI Resume Builder & ATS Analyzer
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Gemini AI Powered
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Analyze existing resumes for ATS readability or build an evidenced technical resume backed by your verified Contineo records.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* My Permanent Resume Navigation Button */}
          <Link
            href="/student"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
            title="Go to permanent resume storage in Student Dashboard"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-500" />
            <span>My Permanent Resume</span>
          </Link>

          {/* Saved Resumes Selector */}
          {savedResumes.length > 0 && (
            <select
              value={activeResumeId || ''}
              onChange={(e) => handleSelectSavedResume(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            >
              {savedResumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.target_role})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleCreateNewResume}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            title="Create a new resume from scratch"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>

          <button
            onClick={handleSaveToCloud}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 text-slate-800 dark:text-slate-200 shadow-sm transition-all"
            title="Save changes to your private cloud storage"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
            ) : saveSuccess ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Save className="w-3.5 h-3.5 text-indigo-500" />
            )}
            <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save'}</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
            title="Download crisp ATS-friendly PDF via print preview"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Permanent Resume vs AI Drafts Clarification Banner */}
      <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="text-slate-700 dark:text-slate-300">
            <strong>Workspace Notice:</strong> AI-generated resumes and edits here remain private drafts until you download or export them. They do not overwrite your official permanent resume stored on your dashboard.
          </span>
        </div>
        <Link
          href="/student"
          className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 shrink-0 text-[11px]"
        >
          <span>Manage Official Resume</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. WORKFLOW STEP TABS */}
      {/* ===================================================================== */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 max-w-2xl print:hidden">
        <button
          onClick={() => setCurrentStep('input')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
            currentStep === 'input'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>1. Input & Profile</span>
        </button>

        <button
          onClick={() => setCurrentStep('analysis')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
            currentStep === 'analysis'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileSearch className="w-3.5 h-3.5" />
          <span>2. AI ATS Audit {analysisResult ? `(${analysisResult.atsScoreEstimate}%)` : ''}</span>
        </button>

        <button
          onClick={() => setCurrentStep('editor')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
            currentStep === 'editor'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>3. Editor & Live Preview</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* 3. STEP 1: RESUME INPUT & PROFILE SYNC */}
      {/* ===================================================================== */}
      {currentStep === 'input' && (
        <div className="space-y-6 print:hidden animate-in fade-in">
          {/* Target Role & Job Description Configuration Card */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-500" />
                  <span>Target Role & Placement Alignment</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  The AI tailors keywords, summary statements, and ATS evaluations specifically for this position.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowJdModal(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  jobDescription
                    ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                <span>{jobDescription ? 'Job Description Linked ✓' : '+ Add Job Description'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {TARGET_ROLE_PRESETS.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    setTargetRole(role);
                    setIsCustomRole(false);
                  }}
                  className={`p-3 rounded-2xl text-left border text-xs font-semibold transition-all ${
                    !isCustomRole && targetRole === role
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{role}</span>
                    {!isCustomRole && targetRole === role && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    )}
                  </div>
                </button>
              ))}

              {/* Custom Role Input */}
              <div
                onClick={() => setIsCustomRole(true)}
                className={`p-2.5 rounded-2xl border text-xs transition-all ${
                  isCustomRole
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40'
                }`}
              >
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Custom Target Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Systems Engineer"
                  value={customRoleInput}
                  onChange={(e) => {
                    setCustomRoleInput(e.target.value);
                    setIsCustomRole(true);
                  }}
                  className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Dual Action: Upload Existing Resume vs Import from YojanaSethu Profile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* OPTION A: Upload Resume (PDF / DOCX) */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                    <UploadCloud className="w-4 h-4" />
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Option A: Upload Existing Resume
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upload your current PDF or DOCX resume. Gemini AI will extract all sections, evaluate ATS readability, and identify gaps.
                </p>
              </div>

              {/* Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center space-y-2.5 cursor-pointer ${
                  isDragging
                    ? 'border-purple-500 bg-purple-50/40 dark:bg-purple-950/20'
                    : selectedFile
                    ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-purple-400 bg-slate-50/50 dark:bg-slate-950/40'
                }`}
                onClick={() => document.getElementById('resume-file-picker')?.click()}
              >
                <input
                  id="resume-file-picker"
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileInput}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="space-y-1">
                    <FileCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB · Ready to analyze
                    </p>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Drop your PDF or DOCX resume here, or <span className="text-purple-600 underline">browse</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Supports PDF and DOCX up to 10MB
                      </p>
                    </div>
                  </>
                )}
              </div>

              {fileError && (
                <div className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fileError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleAnalyzeResume}
                disabled={isAnalyzing || !selectedFile}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Gemini AI is parsing and evaluating document...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Uploaded Resume with AI →</span>
                  </>
                )}
              </button>
            </div>

            {/* OPTION B: 1-Click Import from YojanaSethu Profile */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Option B: Import from YojanaSethu Profile
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Instant synchronization with your Contineo ERP verified CGPA, faculty-endorsed Skill Passport, and submitted GitHub projects.
                </p>
              </div>

              {/* Verified records highlight card */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/50 space-y-2 text-xs">
                <div className="flex items-center justify-between text-indigo-900 dark:text-indigo-200 font-bold">
                  <span>Verified Profile Records Available:</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Live ERP
                  </span>
                </div>
                <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Verified Academic CGPA & Exam Cell Validation</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Faculty-Verified Skill Passport Badges</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Submitted Project Repositories & Evidence URLs</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Proctored Certification Assessment Scores</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleImportProfile}
                  disabled={isImporting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${isImporting ? 'animate-spin' : ''}`} />
                  <span>{isImporting ? 'Syncing...' : '1-Click Profile Import'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep('editor')}
                  className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
                >
                  <span>Manual Entry →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. STEP 2: AI RESUME ANALYSIS & ATS RECOMMENDATIONS */}
      {/* ===================================================================== */}
      {currentStep === 'analysis' && (
        <div className="space-y-6 print:hidden animate-in fade-in">
          {analysisResult ? (
            <div className="space-y-6">
              {/* ATS Score Header Card */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                        AI ATS Readability & Gap Audit
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                        Target: {isCustomRole ? customRoleInput : targetRole}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                      Resume Quality Assessment
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 max-w-2xl leading-relaxed">
                      {analysisResult.summaryFeedback}
                    </p>
                  </div>

                  {/* Circular / Large Score Badge */}
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 shrink-0">
                    <div className="text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        ESTIMATED ATS SCORE
                      </span>
                      <div className="text-4xl font-black text-purple-600 dark:text-purple-400 font-mono">
                        {analysisResult.atsScoreEstimate}
                        <span className="text-lg font-normal text-slate-400">/100</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 block">
                        {analysisResult.atsScoreEstimate >= 80 ? 'ATS Ready & Competitive' : 'Improvements Recommended'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Bars */}
                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase">Clarity</span>
                    <div className="font-extrabold text-slate-900 dark:text-white text-base mt-0.5">
                      {analysisResult.scoreBreakdown.clarity}%
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${analysisResult.scoreBreakdown.clarity}%` }} />
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase">Structure</span>
                    <div className="font-extrabold text-slate-900 dark:text-white text-base mt-0.5">
                      {analysisResult.scoreBreakdown.structure}%
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${analysisResult.scoreBreakdown.structure}%` }} />
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase">Role Relevance</span>
                    <div className="font-extrabold text-slate-900 dark:text-white text-base mt-0.5">
                      {analysisResult.scoreBreakdown.relevance}%
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${analysisResult.scoreBreakdown.relevance}%` }} />
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase">ATS Readability</span>
                    <div className="font-extrabold text-slate-900 dark:text-white text-base mt-0.5">
                      {analysisResult.scoreBreakdown.atsReadability}%
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${analysisResult.scoreBreakdown.atsReadability}%` }} />
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase">Impact Metrics</span>
                    <div className="font-extrabold text-slate-900 dark:text-white text-base mt-0.5">
                      {analysisResult.scoreBreakdown.impactMetrics}%
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${analysisResult.scoreBreakdown.impactMetrics}%` }} />
                    </div>
                  </div>
                </div>

                {/* Important Disclaimer Notice */}
                <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Advisory Note:</strong> {analysisResult.disclaimer}
                  </span>
                </div>
              </div>

              {/* Strengths & Missing Skills Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths Card */}
                <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Identified Strengths ({analysisResult.strengths.length})</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {analysisResult.strengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-2 p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                        <span className="text-emerald-600 font-bold shrink-0">✓</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Missing Skills Card */}
                <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Missing Skills for {isCustomRole ? customRoleInput : targetRole}</span>
                  </h3>
                  <div className="space-y-2 text-xs">
                    {analysisResult.missingSkills.map((ms, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">{ms.skill}</span>
                          <span className="text-[10px] text-slate-400 block">{ms.category} · {ms.reason}</span>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          ms.importance === 'high'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}>
                          {ms.importance.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Identified Issues & Recommendations */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-purple-600" />
                  <span>Actionable Improvements & Weak Description Audits</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {analysisResult.issues.map((iss, i) => (
                    <div key={i} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white capitalize">
                          {iss.category.replace(/_/g, ' ')}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          iss.severity === 'critical'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {iss.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px]">{iss.description}</p>
                      <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 text-[11px] text-purple-700 dark:text-purple-300 font-medium">
                        <strong>Fix:</strong> {iss.recommendation}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Transition to Generator / Editor */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500">
                    Ready to apply these improvements to your resume document?
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleGenerateAiResume}
                      disabled={isGenerating}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all disabled:opacity-50"
                    >
                      <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                      <span>{isGenerating ? 'Elevating with AI...' : 'Apply AI Suggestions & Elevate Resume →'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep('editor')}
                      className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                    >
                      Open Editor
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3">
              <FileSearch className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No Resume Analysis Run Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Upload your resume in Step 1 or click the button below to audit your current profile details against your target role.
              </p>
              <button
                type="button"
                onClick={handleAnalyzeResume}
                disabled={isAnalyzing}
                className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-sm"
              >
                {isAnalyzing ? 'Analyzing...' : 'Run AI Audit on Current Resume'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. STEP 3: INTERACTIVE EDITOR & LIVE PREVIEW (PRINT COMPLIANT) */}
      {/* ===================================================================== */}
      {currentStep === 'editor' && (
        <div className="space-y-6">
          {/* Editor Header Toolbar (Template selection) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Resume Template:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['modern', 'classic', 'minimal', 'technical'] as ResumeTemplateType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTemplate(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                      template === t
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {t === 'classic' ? 'Harvard / Clean' : t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGenerateAiResume}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800 transition-all disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Enhancing...' : 'AI Full Polish'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrintPdf}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>

          {/* Main Grid: Form Sections (Left) vs Live Paper Preview (Right) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Left 6 Cols: Form Sections */}
            <div className="xl:col-span-6 space-y-5 print:hidden">
              {/* Section 1: Contact Information */}
              <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-indigo-500" />
                  <span>1. Contact & Social Profiles</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[11px] font-medium text-slate-500">Full Name</label>
                    <input
                      type="text"
                      value={resume.contact.fullName}
                      onChange={(e) =>
                        setResume({
                          ...resume,
                          contact: { ...resume.contact, fullName: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-500">Email Address</label>
                    <input
                      type="email"
                      value={resume.contact.email}
                      onChange={(e) =>
                        setResume({
                          ...resume,
                          contact: { ...resume.contact, email: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-500">Phone</label>
                    <input
                      type="text"
                      value={resume.contact.phone}
                      onChange={(e) =>
                        setResume({
                          ...resume,
                          contact: { ...resume.contact, phone: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-500">Location</label>
                    <input
                      type="text"
                      value={resume.contact.location}
                      onChange={(e) =>
                        setResume({
                          ...resume,
                          contact: { ...resume.contact, location: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-500">GitHub URL</label>
                    <input
                      type="text"
                      value={resume.contact.github || ''}
                      onChange={(e) =>
                        setResume({
                          ...resume,
                          contact: { ...resume.contact, github: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-500">LinkedIn URL</label>
                    <input
                      type="text"
                      value={resume.contact.linkedin || ''}
                      onChange={(e) =>
                        setResume({
                          ...resume,
                          contact: { ...resume.contact, linkedin: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Professional Summary */}
              <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <span>2. Professional Summary</span>
                  </h3>

                  <button
                    type="button"
                    onClick={() => handleEnhanceSection('summary')}
                    disabled={isEnhancingSection === 'summary'}
                    className="flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 font-bold hover:underline"
                  >
                    <Sparkles className={`w-3 h-3 ${isEnhancingSection === 'summary' ? 'animate-spin' : ''}`} />
                    <span>AI Polish</span>
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={resume.summary}
                  onChange={(e) => setResume({ ...resume, summary: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              {/* Section 3: Education & Academic Truth */}
              <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-indigo-500" />
                    <span>3. Education & Academic Truth</span>
                  </h3>
                  {resume.education.isVerified && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Contineo Verified</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-medium text-slate-500">Institution Name</label>
                    <input
                      type="text"
                      value={resume.education.institution}
                      onChange={(e) =>
                        setResume({
                          ...resume,
                          education: { ...resume.education, institution: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-500">Degree & Field</label>
                    <input
                      type="text"
                      value={resume.education.field}
                      onChange={(e) =>
                        setResume({
                          ...resume,
                          education: { ...resume.education, field: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-500">CGPA / Percentage</label>
                    <input
                      type="text"
                      value={resume.education.cgpa}
                      onChange={(e) =>
                        setResume({
                          ...resume,
                          education: { ...resume.education, cgpa: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Technical Skills */}
              <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-indigo-500" />
                    <span>4. Technical Skills</span>
                  </h3>

                  <button
                    type="button"
                    onClick={() => handleEnhanceSection('skills')}
                    disabled={isEnhancingSection === 'skills'}
                    className="flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 font-bold hover:underline"
                  >
                    <Sparkles className={`w-3 h-3 ${isEnhancingSection === 'skills' ? 'animate-spin' : ''}`} />
                    <span>AI Organize</span>
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[11px] font-medium text-slate-500">Programming Languages (comma-separated)</label>
                    <input
                      type="text"
                      value={resume.skills.languages?.join(', ') || ''}
                      onChange={(e) =>
                        setResume({
                          ...resume,
                          skills: {
                            ...resume.skills,
                            languages: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                          },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-500">Frameworks & Libraries</label>
                    <input
                      type="text"
                      value={resume.skills.frameworks?.join(', ') || ''}
                      onChange={(e) =>
                        setResume({
                          ...resume,
                          skills: {
                            ...resume.skills,
                            frameworks: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                          },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-500">Cloud, Databases & Tools</label>
                    <input
                      type="text"
                      value={resume.skills.toolsAndCloud?.join(', ') || ''}
                      onChange={(e) =>
                        setResume({
                          ...resume,
                          skills: {
                            ...resume.skills,
                            toolsAndCloud: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                          },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Featured Projects */}
              <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    <span>5. Featured Projects ({resume.projects.length})</span>
                  </h3>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEnhanceSection('projects')}
                      disabled={isEnhancingSection === 'projects'}
                      className="text-[11px] text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <Sparkles className={`w-3 h-3 ${isEnhancingSection === 'projects' ? 'animate-spin' : ''}`} />
                      <span>AI Polish All</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setResume({
                          ...resume,
                          projects: [
                            ...resume.projects,
                            {
                              id: `p-${Date.now()}`,
                              title: 'New Engineering Project',
                              techStack: ['Python', 'PostgreSQL'],
                              description: 'Architected and implemented high-performance backend services with automated testing.',
                            },
                          ],
                        })
                      }
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {resume.projects.map((proj, idx) => (
                    <div key={proj.id || idx} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={proj.title}
                          placeholder="Project Title"
                          onChange={(e) => {
                            const updated = [...resume.projects];
                            updated[idx].title = e.target.value;
                            setResume({ ...resume, projects: updated });
                          }}
                          className="font-bold text-slate-900 dark:text-white bg-transparent outline-none flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setResume({
                              ...resume,
                              projects: resume.projects.filter((_, i) => i !== idx),
                            });
                          }}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={proj.techStack?.join(', ') || ''}
                        placeholder="Tech Stack (e.g. Next.js, PostgreSQL, Docker)"
                        onChange={(e) => {
                          const updated = [...resume.projects];
                          updated[idx].techStack = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                          setResume({ ...resume, projects: updated });
                        }}
                        className="w-full text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold bg-transparent outline-none"
                      />

                      <textarea
                        rows={3}
                        value={proj.description}
                        placeholder="Project impact, architecture, and measurable outcomes..."
                        onChange={(e) => {
                          const updated = [...resume.projects];
                          updated[idx].description = e.target.value;
                          setResume({ ...resume, projects: updated });
                        }}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none leading-relaxed"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 6: Experience & Internships */}
              <div className="glass-panel p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-indigo-500" />
                    <span>6. Internships & Experience</span>
                  </h3>

                  <button
                    type="button"
                    onClick={() =>
                      setResume({
                        ...resume,
                        experience: [
                          ...resume.experience,
                          {
                            id: `e-${Date.now()}`,
                            role: 'Software Engineering Intern',
                            company: 'Tech Partner',
                            startDate: 'June 2025',
                            endDate: 'August 2025',
                            description: 'Engineered microservices and frontend features.',
                          },
                        ],
                      })
                    }
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    + Add Experience
                  </button>
                </div>

                <div className="space-y-3">
                  {resume.experience.map((exp, idx) => (
                    <div key={exp.id || idx} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <div className="grid grid-cols-2 gap-2 flex-1">
                          <input
                            type="text"
                            value={exp.role}
                            placeholder="Role (e.g. Full Stack Intern)"
                            onChange={(e) => {
                              const updated = [...resume.experience];
                              updated[idx].role = e.target.value;
                              setResume({ ...resume, experience: updated });
                            }}
                            className="font-bold text-slate-900 dark:text-white bg-transparent outline-none"
                          />
                          <input
                            type="text"
                            value={exp.company}
                            placeholder="Company Name"
                            onChange={(e) => {
                              const updated = [...resume.experience];
                              updated[idx].company = e.target.value;
                              setResume({ ...resume, experience: updated });
                            }}
                            className="text-slate-600 dark:text-slate-300 font-semibold bg-transparent outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setResume({
                              ...resume,
                              experience: resume.experience.filter((_, i) => i !== idx),
                            });
                          }}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <textarea
                        rows={2}
                        value={exp.description}
                        onChange={(e) => {
                          const updated = [...resume.experience];
                          updated[idx].description = e.target.value;
                          setResume({ ...resume, experience: updated });
                        }}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none leading-relaxed"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 6 Cols: Live Printable Resume Preview Document */}
            <div className="xl:col-span-6 sticky top-20">
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/40 p-4 sm:p-6 shadow-lg space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium pb-2 border-b border-slate-200 dark:border-slate-800 print:hidden">
                  <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
                    <Eye className="w-4 h-4" />
                    <span>Live ATS Print Preview ({template.toUpperCase()})</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Ready for Campus Recruitment Drives
                  </span>
                </div>

                {/* The Printable Document Component */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-md">
                  <ResumePreviewDocument resume={resume} template={template} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* JOB DESCRIPTION MODAL */}
      {/* ===================================================================== */}
      {showJdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl glass-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Target Job Description & ATS Keywords
                </h3>
              </div>
              <button onClick={() => setShowJdModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Paste the job description from a company drive (e.g. Google, Amazon, Capgemini, Infosys). The AI will cross-reference your resume to surface missing mandatory skills and keyword gaps.
            </p>

            <textarea
              rows={8}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description requirements, responsibilities, and qualifications here..."
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white outline-none focus:border-purple-500"
            />

            <div className="flex items-center justify-between pt-2">
              {jobDescription && (
                <button
                  type="button"
                  onClick={() => setJobDescription('')}
                  className="text-xs text-rose-500 font-semibold hover:underline"
                >
                  Clear Description
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setShowJdModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white"
                >
                  Save & Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
