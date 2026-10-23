'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { FullStudentProfile } from '@/types';
import CgpaCalculator from '@/components/CgpaCalculator';
import EvidenceModal from '@/components/EvidenceModal';
import RoadmapView from '@/components/RoadmapView';
import ResumeAnalyzerModal from '@/components/ResumeAnalyzerModal';
import {
  ShieldCheck,
  Award,
  UploadCloud,
  FileSearch,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  EyeOff,
  Github,
  Globe,
} from 'lucide-react';

export default function StudentPage() {
  const { user } = useAuth();
  const [student, setStudent] = useState<FullStudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [isAnalyzerModalOpen, setIsAnalyzerModalOpen] = useState(false);
  const [selectedSkillForEvidence, setSelectedSkillForEvidence] = useState('Python');

  const fetchStudentData = async () => {
    try {
      const studentIdentifier = user?.usn || user?.id || user?.email;
      if (!studentIdentifier) {
        setLoading(false);
        setStudent(null);
        return;
      }
      const param = studentIdentifier.includes('@')
        ? `id=${encodeURIComponent(studentIdentifier)}`
        : `usn=${encodeURIComponent(studentIdentifier)}`;
      const res = await fetch(`/api/students?${param}`);
      const data = await res.json();
      if (data.student) {
        setStudent(data.student);
      } else {
        setStudent(null);
      }
    } catch (e) {
      console.error(e);
      setStudent(null);
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
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading student passport from database...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="py-20 text-center bg-white dark:bg-slate-900/60 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
          No student record found in database.
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Please verify your institutional email or sign in with an account seeded in the database.
        </p>
      </div>
    );
  }

  const { profile, academic_record, skills, roadmaps, target_role } = student;

  return (
    <div className="space-y-6">
      {/* 1. Student Hero Banner (Matching reference image UDP 22 style) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1B4B] via-[#0F172A] to-[#1E1B4B] border border-indigo-500/30 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <span>STUDENT COORDINATOR DESK</span>
              <span>•</span>
              <span>{profile.usn ? `${profile.usn} • ` : ''}NMAMIT Autonomous ERP</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              {profile.full_name}
            </h1>

            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {profile.department_code || 'Engineering'} • Semester {profile.semester || 'N/A'} • Batch of {profile.graduation_year || 'N/A'}. Verified academic records synced with NMAMIT Examination Cell. Target Role:{' '}
              <span className="text-indigo-400 font-bold">{target_role}</span>
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-300 pt-2 flex-wrap">
              {profile.github_username && (
                <a
                  href={`https://github.com/${profile.github_username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>github/{profile.github_username}</span>
                </a>
              )}
              {profile.portfolio_url && (
                <a
                  href={profile.portfolio_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Portfolio</span>
                </a>
              )}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Exam Cell Verified</span>
              </div>
            </div>
          </div>

          {/* Quick Action Triggers */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <button
              onClick={() => {
                setSelectedSkillForEvidence('Python');
                setIsEvidenceModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Submit Proof (Repo/Cert)</span>
            </button>

            <button
              onClick={() => setIsAnalyzerModalOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all backdrop-blur-md"
            >
              <FileSearch className="w-4 h-4 text-purple-300" />
              <span>AI Resume Auditor</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Side-by-Side Metric Cards (Matching reference picture COMMUTERS & BOARDING STOPS) */}
      <div id="academic-truth" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-400 dark:hover:border-slate-700">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
            VERIFIED CGPA
          </span>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
            {academic_record ? academic_record.cgpa.toFixed(2) : 'N/A'}
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
            {academic_record ? `${academic_record.active_backlogs} Active Backlog(s) • Exam Cell` : 'Not recorded in Exam Cell'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-400 dark:hover:border-slate-700">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
            EARNED CREDITS
          </span>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
            {academic_record ? academic_record.total_earned_credits : 0} <span className="text-xs font-normal text-slate-400">/ 160</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
            {academic_record?.is_verified_by_exam_cell ? 'Exam Cell Verified' : 'Pending Verification'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-400 dark:hover:border-slate-700">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
            SKILL PASSPORT
          </span>
          <div className="text-2xl md:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {skills.filter((s) => s.verification_badge).length} <span className="text-xs font-normal text-slate-400">of {skills.length}</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
            Verified with Proof
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-400 dark:hover:border-slate-700">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
            CAREER ROADMAP
          </span>
          <div className="text-2xl md:text-3xl font-extrabold text-purple-600 dark:text-purple-400">
            {roadmaps.length > 0 ? (
              <>
                {roadmaps.filter((r) => r.is_completed).length} <span className="text-xs font-normal text-slate-400">of {roadmaps.length} Done</span>
              </>
            ) : (
              <span className="text-base font-bold text-slate-400">None</span>
            )}
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
            {roadmaps.length > 0 ? `${target_role} Track` : 'No Active Roadmap'}
          </span>
        </div>
      </div>

      {/* 3. Academic CGPA Target Planner (Credit Math) */}
      <div id="cgpa-calculator">
        {academic_record ? (
          <CgpaCalculator
            currentCgpa={academic_record.cgpa}
            initialTargetCgpa={Math.min(10.0, academic_record.cgpa + 0.5)}
            earnedCredits={academic_record.total_earned_credits}
            totalCredits={160}
          />
        ) : (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
            Academic credit record not yet linked in database for this student.
          </div>
        )}
      </div>

      {/* 4. Student Skill Passport & Target Role Gap Analyzer */}
      <div id="skill-passport" className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200/80 dark:border-slate-800/80 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Verified Skill Passport vs {target_role} Requirements
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Skills must have verified evidence to unlock recruiter rankings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" /> Evidenced (+2 pts)
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
              <Clock className="w-3.5 h-3.5" /> Self-Declared (+1 pt)
            </span>
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {skills.length === 0 ? (
            <div className="col-span-full py-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              No skills recorded in passport yet in database. Use &quot;Add Evidence&quot; to submit GitHub repositories or certificates.
            </div>
          ) : (
            skills.map((skill) => (
              <div
                key={skill.id}
                className={`p-3.5 rounded-xl border glass-card flex flex-col justify-between ${
                  skill.verification_badge
                    ? 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/10'
                    : 'border-amber-200 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {skill.skill_name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        skill.verification_badge
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                          : 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                      }`}
                    >
                      {skill.verification_badge ? 'Faculty Verified' : 'Self-Declared'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                    Source: {skill.evidence_source}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between text-xs">
                  {skill.evidence_url ? (
                    <a
                      href={skill.evidence_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400 hover:underline font-medium"
                    >
                      <span>View Proof Repo</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-amber-700 dark:text-amber-400/90 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3" /> No Proof Attached
                    </span>
                  )}

                  {!skill.verification_badge && (
                    <button
                      onClick={() => {
                        setSelectedSkillForEvidence(skill.skill_name);
                        setIsEvidenceModalOpen(true);
                      }}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      + Add Proof
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. 30-Day Personalized AI Roadmap */}
      <div id="career-roadmap">
        <RoadmapView initialRoadmaps={roadmaps} studentId={profile.id} />
      </div>

      {/* Modals */}
      <EvidenceModal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        studentId={profile.id}
        defaultSkill={selectedSkillForEvidence}
        onSuccess={fetchStudentData}
      />

      <ResumeAnalyzerModal
        isOpen={isAnalyzerModalOpen}
        onClose={() => setIsAnalyzerModalOpen(false)}
        targetRole={target_role}
      />
    </div>
  );
}
