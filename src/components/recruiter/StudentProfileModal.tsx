
'use client';

import {
  X,
  UserRound,
  GraduationCap,
  Award,
  FolderGit2,
  ExternalLink,
  FileText,
} from 'lucide-react';
import type { FullStudentProfile } from '@/types';

interface StudentProfileModalProps {
  student: FullStudentProfile;
  onClose: () => void;
}

export default function StudentProfileModal({
  student,
  onClose,
}: StudentProfileModalProps) {
  const { profile, academic_record, semester_marks, skills, evidence_submissions } =
    student;

  const certificates = evidence_submissions.filter(
    (item) => item.type === 'certificate'
  );

  const projects = evidence_submissions.filter(
    (item) => item.type !== 'certificate'
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-profile-title"
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
              <UserRound className="h-6 w-6" />
            </div>
            <div>
              <h2
                id="student-profile-title"
                className="text-xl font-bold text-slate-900 dark:text-white"
              >
                {profile.full_name}
              </h2>
              <p className="text-sm text-slate-500">
                {profile.usn || 'USN unavailable'} ·{' '}
                {profile.department_code || 'Department unavailable'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close student profile"
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
            <p className="text-xs text-slate-500">CGPA</p>
            <p className="mt-1 text-xl font-bold">
              {academic_record?.cgpa ?? 'N/A'}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
            <p className="text-xs text-slate-500">Active Backlogs</p>
            <p className="mt-1 text-xl font-bold">
              {academic_record?.active_backlogs ?? 'N/A'}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
            <p className="text-xs text-slate-500">Semester</p>
            <p className="mt-1 text-xl font-bold">
              {profile.semester ?? 'N/A'}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
            <p className="text-xs text-slate-500">Graduation Year</p>
            <p className="mt-1 text-xl font-bold">
              {profile.graduation_year ?? 'N/A'}
            </p>
          </div>
        </div>

        <section className="mt-6">
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <GraduationCap className="h-5 w-5" />
            Contact & Profiles
          </h3>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <p>Email: {profile.email}</p>
            {profile.phone && <p>Phone: {profile.phone}</p>}
            <div className="flex flex-wrap gap-3">
              {profile.github_username && (
                <a
                  href={`https://github.com/${profile.github_username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  GitHub <ExternalLink className="inline h-3 w-3" />
                </a>
              )}
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  LinkedIn <ExternalLink className="inline h-3 w-3" />
                </a>
              )}
              {profile.portfolio_url && (
                <a
                  href={profile.portfolio_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Portfolio <ExternalLink className="inline h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6">
          <h3 className="mb-3 font-semibold">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skills.length ? skills.map((skill) => (
              <span
                key={skill.id}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
              >
                {skill.skill_name}
                {skill.verification_badge ? ' ✓ Verified' : ''}
              </span>
            )) : <p className="text-sm text-slate-500">No skills recorded.</p>}
          </div>
        </section>

        <section className="mt-6">
          <h3 className="mb-3 font-semibold">Semester Results</h3>
          {semester_marks.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b dark:border-slate-700">
                    <th className="p-2">Semester</th>
                    <th className="p-2">SGPA</th>
                    <th className="p-2">Credits</th>
                    <th className="p-2">Backlogs</th>
                  </tr>
                </thead>
                <tbody>
                  {semester_marks.map((mark) => (
                    <tr key={mark.id} className="border-b dark:border-slate-800">
                      <td className="p-2">{mark.semester}</td>
                      <td className="p-2">{mark.sgpa}</td>
                      <td className="p-2">{mark.credits_earned}</td>
                      <td className="p-2">{mark.backlogs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No semester results available.</p>
          )}
        </section>

        <section className="mt-6">
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <FolderGit2 className="h-5 w-5" />
            Projects & Evidence
          </h3>
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <p className="font-medium">{project.title}</p>
                <p className="mt-1 text-sm text-slate-500">{project.description}</p>
                {project.github_repo_url && (
                  <a
                    href={project.github_repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm text-indigo-600"
                  >
                    View Project <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
            {!projects.length && (
              <p className="text-sm text-slate-500">No projects recorded.</p>
            )}
          </div>
        </section>

        <section className="mt-6">
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <Award className="h-5 w-5" />
            Certificates
          </h3>
          <div className="space-y-3">
            {certificates.map((certificate) => (
              <div key={certificate.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <div>
                  <p className="font-medium">{certificate.title}</p>
                  <p className="text-sm text-slate-500">
                    {certificate.issuer_or_organization} · {certificate.status}
                  </p>
                </div>
                {certificate.credential_url && (
                  <a
                    href={certificate.credential_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                  >
                    <Award className="h-4 w-4" />
                    View Certificate
                  </a>
                )}
                {!certificate.credential_url && certificate.document_storage_path && (
                  <span className="text-xs text-slate-500">
                    Certificate file recorded; file access needs connecting.
                  </span>
                )}
              </div>
            ))}
            {!certificates.length && (
              <p className="text-sm text-slate-500">No certificates recorded.</p>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <h3 className="mb-2 flex items-center gap-2 font-semibold">
            <FileText className="h-5 w-5" />
            Resume
          </h3>
          <p className="text-sm text-slate-500">
            Resume viewing will be connected to the existing upload storage.
          </p>
        </section>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}
