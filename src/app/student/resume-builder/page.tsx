'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import {
  FileText,
  Sparkles,
  Download,
  Printer,
  CheckCircle2,
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
} from 'lucide-react';
import Link from 'next/link';

interface ResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  objective: string;
  education: {
    institution: string;
    degree: string;
    field: string;
    cgpa: string;
    year: string;
  };
  skills: string;
  projects: {
    title: string;
    techStack: string;
    link: string;
    description: string;
  }[];
  experience: {
    role: string;
    company: string;
    duration: string;
    details: string;
  }[];
  certifications: string;
}

export default function ResumeBuilderPage() {
  const { user } = useAuth();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [template, setTemplate] = useState<'modern' | 'minimal' | 'academic'>('modern');
  const [atsScore, setAtsScore] = useState(88);

  const [resume, setResume] = useState<ResumeData>({
    name: user?.full_name || 'Pranav R',
    email: user?.email || 'pranav.r@nmamit.in',
    phone: '+91 98765 43210',
    location: 'Nitte, Karnataka, India',
    linkedin: 'linkedin.com/in/pranav-r',
    github: 'github.com/pranavr06',
    objective:
      'Proactive Computer Science & Engineering undergraduate with deep competence in Full-Stack Development, Distributed Systems, and Machine Learning. Passionate about architecting resilient cloud systems and solving complex algorithmic challenges.',
    education: {
      institution: 'NMAM Institute of Technology, Nitte (Autonomous)',
      degree: 'Bachelor of Technology',
      field: 'Computer Science & Engineering',
      cgpa: '8.85 / 10.0',
      year: '2022 – 2026',
    },
    skills:
      'TypeScript, Next.js, React, Node.js, Python, PostgreSQL, Supabase, Tailwind CSS, Docker, Git, REST APIs, Data Structures & Algorithms',
    projects: [
      {
        title: 'YojanaSethu — Autonomous Career & Placement Transparency Engine',
        techStack: 'Next.js 14, TypeScript, Supabase, Tailwind CSS, PostgreSQL',
        link: 'https://github.com/Pranavr06/yojanasethu',
        description:
          'Engineered an enterprise-grade placement platform with 5-role RBAC, Contineo ERP synchronization, verifiable cryptographic skill passports, and deterministic CGPA simulation.',
      },
      {
        title: 'Distributed Real-time Telemetry Engine',
        techStack: 'Go, Apache Kafka, Redis, InfluxDB, Docker',
        link: 'https://github.com/pranavr06/telemetry-engine',
        description:
          'Constructed an event-driven telemetry pipeline processing 15k+ events/sec with sub-50ms query latencies and automated failure recovery.',
      },
    ],
    experience: [
      {
        role: 'Full Stack Engineering Intern',
        company: 'Nexus AI Technologies',
        duration: 'June 2025 – August 2025',
        details:
          'Spearheaded development of microfrontend dashboards used by 10k+ enterprise users. Reduced client bundle payload by 38% via lazy hydration and code-splitting.',
      },
    ],
    certifications:
      'AWS Certified Solutions Architect Associate, Google Cloud Digital Leader, HackerRank 5-Star Problem Solving',
  });

  // Auto-fill from student ERP database
  const autoFillFromProfile = async () => {
    setLoadingProfile(true);
    try {
      const studentIdentifier = user?.usn || user?.id || user?.email || '4NM22CS120';
      const param = studentIdentifier.includes('@')
        ? `id=${encodeURIComponent(studentIdentifier)}`
        : `usn=${encodeURIComponent(studentIdentifier)}`;

      const res = await fetch(`/api/students?${param}`);
      const data = await res.json();

      if (data?.student) {
        const s = data.student;
        setResume((prev) => ({
          ...prev,
          name: s.name || prev.name,
          email: s.email || prev.email,
          phone: s.phone || prev.phone,
          education: {
            ...prev.education,
            institution: s.college || prev.education.institution,
            cgpa: s.current_cgpa ? `${s.current_cgpa} / 10.0` : prev.education.cgpa,
            field: s.branch || prev.education.field,
          },
          skills: s.skills && s.skills.length > 0 ? s.skills.join(', ') : prev.skills,
        }));
      }
    } catch (e) {
      console.error('Failed to auto-populate from profile:', e);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              AI Resume Builder
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              ATS Score: {atsScore}%
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Craft an ATS-optimized, high-impact technical resume backed by your verified Contineo records.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={autoFillFromProfile}
            disabled={loadingProfile}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors shadow-sm disabled:opacity-50"
            title="Auto-fill with verified ERP and Skill Passport records"
          >
            <Sparkles className={`w-3.5 h-3.5 ${loadingProfile ? 'animate-spin' : ''}`} />
            <span>{loadingProfile ? 'Syncing...' : 'Auto-Fill from ERP'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form Editor vs Live Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Form Sections (7 cols) */}
        <div className="xl:col-span-6 space-y-5 print:hidden">
          {/* Personal Info Card */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-indigo-500" />
              1. Personal & Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Full Name</label>
                <input
                  type="text"
                  value={resume.name}
                  onChange={(e) => setResume({ ...resume, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Email Address</label>
                <input
                  type="email"
                  value={resume.email}
                  onChange={(e) => setResume({ ...resume, email: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Phone</label>
                <input
                  type="text"
                  value={resume.phone}
                  onChange={(e) => setResume({ ...resume, phone: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Location</label>
                <input
                  type="text"
                  value={resume.location}
                  onChange={(e) => setResume({ ...resume, location: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">LinkedIn Profile</label>
                <input
                  type="text"
                  value={resume.linkedin}
                  onChange={(e) => setResume({ ...resume, linkedin: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">GitHub Profile</label>
                <input
                  type="text"
                  value={resume.github}
                  onChange={(e) => setResume({ ...resume, github: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Career Objective</label>
              <textarea
                rows={3}
                value={resume.objective}
                onChange={(e) => setResume({ ...resume, objective: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white leading-relaxed"
              />
            </div>
          </div>

          {/* Education & Skills Card */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-500" />
              2. Education & Technical Skills
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Institution / College</label>
                <input
                  type="text"
                  value={resume.education.institution}
                  onChange={(e) =>
                    setResume({
                      ...resume,
                      education: { ...resume.education, institution: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Degree & Branch</label>
                <input
                  type="text"
                  value={resume.education.field}
                  onChange={(e) =>
                    setResume({
                      ...resume,
                      education: { ...resume.education, field: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">CGPA / Percentage</label>
                <input
                  type="text"
                  value={resume.education.cgpa}
                  onChange={(e) =>
                    setResume({
                      ...resume,
                      education: { ...resume.education, cgpa: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Technical Skills (comma-separated)</label>
              <textarea
                rows={2}
                value={resume.skills}
                onChange={(e) => setResume({ ...resume, skills: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Key Projects Card */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-500" />
              3. Featured Projects
            </h2>

            {resume.projects.map((proj, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-950/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={proj.title}
                    placeholder="Project Title"
                    onChange={(e) => {
                      const newP = [...resume.projects];
                      newP[idx].title = e.target.value;
                      setResume({ ...resume, projects: newP });
                    }}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-xs font-semibold outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={proj.techStack}
                    placeholder="Tech Stack (e.g. Next.js, PostgreSQL)"
                    onChange={(e) => {
                      const newP = [...resume.projects];
                      newP[idx].techStack = e.target.value;
                      setResume({ ...resume, projects: newP });
                    }}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
                <textarea
                  rows={2}
                  value={proj.description}
                  placeholder="Project impact, architecture, and measurable outcomes"
                  onChange={(e) => {
                    const newP = [...resume.projects];
                    newP[idx].description = e.target.value;
                    setResume({ ...resume, projects: newP });
                  }}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>
            ))}
          </div>

          {/* Certifications & Badges */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-500" />
              4. Certifications & Badges
            </h2>
            <textarea
              rows={2}
              value={resume.certifications}
              onChange={(e) => setResume({ ...resume, certifications: e.target.value })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Right Column: Live Interactive Resume Preview (6 cols) */}
        <div className="xl:col-span-6">
          <div className="sticky top-20 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-md">
            {/* Template Header Toolbar */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800 print:hidden">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live ATS Paper Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Ready for Placement Drives</span>
              </div>
            </div>

            {/* Printable Resume Document Canvas */}
            <div className="space-y-5 text-slate-900 dark:text-slate-100 font-sans print:text-black">
              {/* Name & Contact Header */}
              <div className="border-b-2 border-indigo-600 pb-3">
                <h1 className="text-2xl font-black uppercase tracking-tight text-slate-950 dark:text-white print:text-black">
                  {resume.name}
                </h1>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600 dark:text-slate-400 print:text-slate-700 font-medium">
                  <span>{resume.email}</span>
                  <span>•</span>
                  <span>{resume.phone}</span>
                  <span>•</span>
                  <span>{resume.location}</span>
                  {resume.linkedin && (
                    <>
                      <span>•</span>
                      <span>{resume.linkedin}</span>
                    </>
                  )}
                  {resume.github && (
                    <>
                      <span>•</span>
                      <span>{resume.github}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Summary / Objective */}
              {resume.objective && (
                <div>
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 print:text-indigo-800 border-b border-slate-200 dark:border-slate-800 pb-0.5 mb-1.5">
                    Career Objective
                  </h2>
                  <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 print:text-slate-800">
                    {resume.objective}
                  </p>
                </div>
              )}

              {/* Education */}
              <div>
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 print:text-indigo-800 border-b border-slate-200 dark:border-slate-800 pb-0.5 mb-1.5">
                  Education
                </h2>
                <div className="flex justify-between items-baseline text-xs">
                  <div>
                    <strong className="font-bold text-slate-900 dark:text-white print:text-black">
                      {resume.education.institution}
                    </strong>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 print:text-slate-700">
                      {resume.education.degree} in {resume.education.field}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 print:text-indigo-800">
                      CGPA: {resume.education.cgpa}
                    </span>
                    <div className="text-[10px] text-slate-500">{resume.education.year}</div>
                  </div>
                </div>
              </div>

              {/* Technical Skills */}
              {resume.skills && (
                <div>
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 print:text-indigo-800 border-b border-slate-200 dark:border-slate-800 pb-0.5 mb-1.5">
                    Technical Core Skills
                  </h2>
                  <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 print:text-slate-800">
                    {resume.skills}
                  </p>
                </div>
              )}

              {/* Experience */}
              {resume.experience.length > 0 && (
                <div>
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 print:text-indigo-800 border-b border-slate-200 dark:border-slate-800 pb-0.5 mb-1.5">
                    Internship Experience
                  </h2>
                  <div className="space-y-2">
                    {resume.experience.map((exp, i) => (
                      <div key={i} className="text-xs">
                        <div className="flex justify-between font-bold">
                          <span>
                            {exp.role} — <span className="font-medium text-slate-600 dark:text-slate-400">{exp.company}</span>
                          </span>
                          <span className="text-[11px] text-slate-500">{exp.duration}</span>
                        </div>
                        <p className="text-[11px] mt-0.5 text-slate-700 dark:text-slate-300 print:text-slate-800">
                          {exp.details}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {resume.projects.length > 0 && (
                <div>
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 print:text-indigo-800 border-b border-slate-200 dark:border-slate-800 pb-0.5 mb-1.5">
                    Projects & Engineering Achievements
                  </h2>
                  <div className="space-y-3">
                    {resume.projects.map((proj, i) => (
                      <div key={i} className="text-xs">
                        <div className="flex justify-between font-bold text-slate-900 dark:text-white print:text-black">
                          <span>{proj.title}</span>
                        </div>
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 print:text-indigo-800 font-semibold mb-0.5">
                          {proj.techStack}
                        </div>
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 print:text-slate-800 leading-relaxed">
                          {proj.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {resume.certifications && (
                <div>
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 print:text-indigo-800 border-b border-slate-200 dark:border-slate-800 pb-0.5 mb-1.5">
                    Certifications & Licenses
                  </h2>
                  <p className="text-xs text-slate-700 dark:text-slate-300 print:text-slate-800">
                    {resume.certifications}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Proof Watermark */}
            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-[10px] text-slate-400">
              Verified by YojanaSethu Career Gateway · NMAMIT 2026
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
