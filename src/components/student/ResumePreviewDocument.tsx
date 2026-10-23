'use client';

import React from 'react';
import {
  ResumeData,
  ResumeTemplateType,
} from '@/types';
import {
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Github,
  Linkedin,
  Globe,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

interface Props {
  resume: ResumeData;
  template: ResumeTemplateType;
}

export default function ResumePreviewDocument({ resume, template }: Props) {
  const {
    contact,
    summary,
    education,
    skills,
    projects,
    experience,
    certifications,
    achievements,
  } = resume;

  // Flattened skill lists for fallback
  const allSkillsList = [
    ...(skills?.languages || []),
    ...(skills?.frameworks || []),
    ...(skills?.toolsAndCloud || []),
    ...(skills?.coreCompetencies || []),
  ];

  // =========================================================================
  // TEMPLATE 1: CLASSIC HARVARD / ATS CLEAN (100% ATS PARSER FRIENDLY)
  // =========================================================================
  if (template === 'classic') {
    return (
      <div
        id="resume-document-print"
        className="w-full bg-white text-black p-8 sm:p-12 font-serif text-[11pt] leading-normal shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0 print:m-0"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif', minHeight: '1050px' }}
      >
        {/* Header: Centered */}
        <div className="text-center border-b-2 border-black pb-3 mb-4">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-black">
            {contact.fullName}
          </h1>
          <div className="mt-1.5 flex flex-wrap justify-center items-center gap-x-2 text-[9.5pt] text-gray-800">
            {contact.location && <span>{contact.location}</span>}
            {contact.location && contact.phone && <span>•</span>}
            {contact.phone && <span>{contact.phone}</span>}
            {contact.phone && contact.email && <span>•</span>}
            {contact.email && <span className="underline">{contact.email}</span>}
            {contact.linkedin && <span>•</span>}
            {contact.linkedin && <span>{contact.linkedin}</span>}
            {contact.github && <span>•</span>}
            {contact.github && <span>{contact.github}</span>}
            {(contact.codingProfile || contact.leetcode) && <span>•</span>}
            {(contact.codingProfile || contact.leetcode) && <span>{contact.codingProfile || contact.leetcode}</span>}
          </div>
        </div>

        {/* Career Summary */}
        {summary && (
          <div className="mb-4">
            <h2 className="text-[11pt] font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
              Professional Summary
            </h2>
            <p className="text-[10pt] leading-relaxed text-justify text-gray-900">
              {summary}
            </p>
          </div>
        )}

        {/* Education */}
        <div className="mb-4">
          <h2 className="text-[11pt] font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
            Education
          </h2>
          <div className="flex justify-between items-baseline text-[10.5pt]">
            <div>
              <strong className="font-bold">{education.institution}</strong>
              <div className="italic text-[10pt]">
                {education.degree} in {education.field}
              </div>
            </div>
            <div className="text-right text-[10pt]">
              <div>{education.location || 'Karnataka, India'}</div>
              <div className="font-semibold">
                {education.startYear} – {education.endYear} {education.cgpa && `| CGPA: ${education.cgpa}`}
              </div>
            </div>
          </div>
        </div>

        {/* Technical Skills */}
        {allSkillsList.length > 0 && (
          <div className="mb-4">
            <h2 className="text-[11pt] font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
              Technical Skills
            </h2>
            <div className="text-[10pt] space-y-1">
              {skills?.languages && skills.languages.length > 0 && (
                <div>
                  <strong>Languages:</strong> {skills.languages.join(', ')}
                </div>
              )}
              {skills?.frameworks && skills.frameworks.length > 0 && (
                <div>
                  <strong>Frameworks & Libraries:</strong> {skills.frameworks.join(', ')}
                </div>
              )}
              {skills?.toolsAndCloud && skills.toolsAndCloud.length > 0 && (
                <div>
                  <strong>Cloud & Developer Tools:</strong> {skills.toolsAndCloud.join(', ')}
                </div>
              )}
              {skills?.coreCompetencies && skills.coreCompetencies.length > 0 && (
                <div>
                  <strong>Core Competencies:</strong> {skills.coreCompetencies.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <div className="mb-4">
            <h2 className="text-[11pt] font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
              Experience
            </h2>
            <div className="space-y-3">
              {experience.map((exp, i) => (
                <div key={exp.id || i} className="text-[10pt]">
                  <div className="flex justify-between items-baseline font-bold">
                    <span>
                      {exp.role} — <span className="italic font-normal">{exp.company}</span>
                    </span>
                    <span className="text-[9.5pt] font-normal">
                      {exp.startDate} – {exp.endDate} {exp.location && `| ${exp.location}`}
                    </span>
                  </div>
                  <p className="mt-1 text-[9.5pt] leading-relaxed text-gray-900">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <div className="mb-4">
            <h2 className="text-[11pt] font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
              Key Projects & Engineering Work
            </h2>
            <div className="space-y-3">
              {projects.map((proj, i) => (
                <div key={proj.id || i} className="text-[10pt]">
                  <div className="flex justify-between items-baseline font-bold">
                    <span>
                      {proj.title}
                      {proj.techStack && proj.techStack.length > 0 && (
                        <span className="italic font-normal text-gray-800 text-[9pt] ml-2">
                          ({proj.techStack.join(', ')})
                        </span>
                      )}
                    </span>
                    {proj.githubUrl && (
                      <span className="text-[9pt] font-normal underline">{proj.githubUrl}</span>
                    )}
                  </div>
                  <p className="mt-1 text-[9.5pt] leading-relaxed text-gray-900">
                    {proj.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <div className="mb-4">
            <h2 className="text-[11pt] font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
              Certifications & Credentials
            </h2>
            <ul className="list-disc list-inside text-[9.5pt] space-y-1 text-gray-900">
              {certifications.map((c, i) => (
                <li key={c.id || i}>
                  <strong>{c.name}</strong> — {c.issuer}
                  {c.isVerified && ' (Faculty Verified)'}
                  {c.score !== undefined && ` [Score: ${c.score}%]`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Achievements */}
        {achievements && achievements.length > 0 && (
          <div>
            <h2 className="text-[11pt] font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
              Honors & Achievements
            </h2>
            <ul className="list-disc list-inside text-[9.5pt] space-y-1 text-gray-900">
              {achievements.map((ach, i) => (
                <li key={i}>{ach}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // TEMPLATE 2: EXECUTIVE MINIMAL (SLEEK, CLEAN, HIGH DENSITY)
  // =========================================================================
  if (template === 'minimal') {
    return (
      <div
        id="resume-document-print"
        className="w-full bg-white text-slate-900 p-8 sm:p-10 font-sans text-xs leading-relaxed shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0 print:m-0"
        style={{ minHeight: '1050px' }}
      >
        {/* Header */}
        <div className="border-b border-slate-200 pb-4 mb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase">
              {contact.fullName}
            </h1>
            <p className="text-xs font-semibold text-slate-500 tracking-wide mt-0.5">
              {resume.targetRole || 'Software Development Engineer'}
            </p>
          </div>
          <div className="text-[11px] text-slate-600 sm:text-right space-y-0.5">
            <div>{contact.email} • {contact.phone}</div>
            <div>
              {contact.location}
              {contact.github && ` • ${contact.github}`}
              {contact.linkedin && ` • ${contact.linkedin}`}
              {(contact.codingProfile || contact.leetcode) && ` • ${contact.codingProfile || contact.leetcode}`}
            </div>
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className="mb-4">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Profile
            </h3>
            <p className="text-xs text-slate-700 leading-normal">
              {summary}
            </p>
          </div>
        )}

        {/* Education */}
        <div className="mb-4">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            Education
          </h3>
          <div className="flex justify-between items-baseline">
            <div>
              <span className="font-bold text-slate-900">{education.institution}</span>
              <div className="text-[11px] text-slate-600">
                {education.degree} in {education.field}
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-600">
              <span className="font-bold text-slate-900">{education.cgpa} CGPA</span>
              <div>{education.startYear} – {education.endYear}</div>
            </div>
          </div>
        </div>

        {/* Skills Grid */}
        {allSkillsList.length > 0 && (
          <div className="mb-4">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
              Competencies & Tech Stack
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
              {skills?.languages && skills.languages.length > 0 && (
                <div>
                  <span className="font-bold text-slate-700">Languages: </span>
                  <span className="text-slate-600">{skills.languages.join(', ')}</span>
                </div>
              )}
              {skills?.frameworks && skills.frameworks.length > 0 && (
                <div>
                  <span className="font-bold text-slate-700">Frameworks: </span>
                  <span className="text-slate-600">{skills.frameworks.join(', ')}</span>
                </div>
              )}
              {skills?.toolsAndCloud && skills.toolsAndCloud.length > 0 && (
                <div>
                  <span className="font-bold text-slate-700">Cloud & DevOps: </span>
                  <span className="text-slate-600">{skills.toolsAndCloud.join(', ')}</span>
                </div>
              )}
              {skills?.coreCompetencies && skills.coreCompetencies.length > 0 && (
                <div>
                  <span className="font-bold text-slate-700">Core Concepts: </span>
                  <span className="text-slate-600">{skills.coreCompetencies.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <div className="mb-4">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              Work Experience
            </h3>
            <div className="space-y-3">
              {experience.map((exp, i) => (
                <div key={exp.id || i} className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{exp.role} · <span className="font-normal text-slate-600">{exp.company}</span></span>
                    <span className="text-[11px] font-normal text-slate-500">{exp.startDate} – {exp.endDate}</span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <div className="mb-4">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              Featured Projects
            </h3>
            <div className="space-y-3">
              {projects.map((proj, i) => (
                <div key={proj.id || i} className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>
                      {proj.title}
                      {proj.techStack && (
                        <span className="font-normal text-slate-500 text-[10px] ml-2">
                          [{proj.techStack.join(', ')}]
                        </span>
                      )}
                    </span>
                    {proj.githubUrl && (
                      <span className="text-[10px] font-mono text-slate-500">{proj.githubUrl}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    {proj.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications & Achievements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-100">
          {certifications && certifications.length > 0 && (
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Certifications
              </h3>
              <ul className="text-[11px] space-y-1 text-slate-700">
                {certifications.map((c, i) => (
                  <li key={c.id || i} className="flex items-center gap-1.5">
                    <span>• {c.name} ({c.issuer})</span>
                    {c.isVerified && <span className="text-[9px] font-bold text-emerald-600">✓</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {achievements && achievements.length > 0 && (
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Key Honors
              </h3>
              <ul className="text-[11px] space-y-1 text-slate-700">
                {achievements.map((ach, i) => (
                  <li key={i}>• {ach}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // TEMPLATE 3: TECHNICAL & ENGINEERING (FOCUS ON GITHUB, BADGES & TECH PILLS)
  // =========================================================================
  if (template === 'technical') {
    return (
      <div
        id="resume-document-print"
        className="w-full bg-white text-slate-900 p-8 sm:p-10 font-sans text-xs shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0 print:m-0 space-y-4"
        style={{ minHeight: '1050px' }}
      >
        {/* Header: Dark / Tech Border */}
        <div className="border-b-2 border-slate-900 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase">
              {contact.fullName}
            </h1>
            <p className="text-xs font-mono font-bold text-indigo-700 uppercase tracking-wider">
              {resume.targetRole || 'Full Stack Engineer'}
            </p>
          </div>
          <div className="text-[11px] font-mono text-slate-600 sm:text-right space-y-0.5">
            <div>{contact.email} | {contact.phone}</div>
            <div>{contact.location} | {contact.github} | {contact.linkedin}{(contact.codingProfile || contact.leetcode) ? ` | ${contact.codingProfile || contact.leetcode}` : ''}</div>
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div>
            <h2 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
              // Professional Summary
            </h2>
            <p className="text-xs leading-relaxed text-slate-800">
              {summary}
            </p>
          </div>
        )}

        {/* Technical Core Skills (Categorized Pills) */}
        {allSkillsList.length > 0 && (
          <div>
            <h2 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-2">
              // Technical Core Skills
            </h2>
            <div className="space-y-1.5 text-xs">
              {skills?.languages && skills.languages.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-900 w-28 shrink-0">Languages:</span>
                  <span className="text-slate-800">{skills.languages.join(' • ')}</span>
                </div>
              )}
              {skills?.frameworks && skills.frameworks.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-900 w-28 shrink-0">Frameworks:</span>
                  <span className="text-slate-800">{skills.frameworks.join(' • ')}</span>
                </div>
              )}
              {skills?.toolsAndCloud && skills.toolsAndCloud.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-900 w-28 shrink-0">Cloud & DevOps:</span>
                  <span className="text-slate-800">{skills.toolsAndCloud.join(' • ')}</span>
                </div>
              )}
              {skills?.coreCompetencies && skills.coreCompetencies.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="font-bold text-slate-900 w-28 shrink-0">Architecture:</span>
                  <span className="text-slate-800">{skills.coreCompetencies.join(' • ')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Projects (Key Engineering) */}
        {projects && projects.length > 0 && (
          <div>
            <h2 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-2">
              // Engineering Projects & System Implementations
            </h2>
            <div className="space-y-3">
              {projects.map((proj, i) => (
                <div key={proj.id || i} className="text-xs">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span className="text-sm">{proj.title}</span>
                    {proj.githubUrl && (
                      <span className="text-[10px] font-mono text-indigo-700 underline">
                        {proj.githubUrl}
                      </span>
                    )}
                  </div>
                  {proj.techStack && proj.techStack.length > 0 && (
                    <div className="text-[10px] font-mono font-semibold text-slate-600 mb-1">
                      Stack: {proj.techStack.join(' | ')}
                    </div>
                  )}
                  <p className="text-xs text-slate-800 leading-relaxed">
                    {proj.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <div>
            <h2 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-2">
              // Experience & Internships
            </h2>
            <div className="space-y-3">
              {experience.map((exp, i) => (
                <div key={exp.id || i} className="text-xs">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>
                      {exp.role} <span className="font-normal text-slate-600">@ {exp.company}</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-600">
                      {exp.startDate} – {exp.endDate}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-800 leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education & Verified Endorsements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
          <div>
            <h2 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
              // Academic Truth
            </h2>
            <div className="text-xs space-y-0.5">
              <strong className="font-bold text-slate-900">{education.institution}</strong>
              <div className="text-slate-700">{education.degree} in {education.field}</div>
              <div className="font-bold text-indigo-700">CGPA: {education.cgpa} ({education.startYear}–{education.endYear})</div>
            </div>
          </div>

          <div>
            <h2 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
              // Faculty Endorsed Credentials
            </h2>
            <div className="text-xs space-y-1">
              {certifications && certifications.map((c, i) => (
                <div key={c.id || i} className="flex items-center justify-between">
                  <span className="font-medium text-slate-900 truncate">{c.name}</span>
                  {c.isVerified && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                      Verified {c.score ? `${c.score}%` : ''}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer verification tag */}
        <div className="pt-2 text-[9px] font-mono text-center text-slate-400 border-t border-slate-100">
          Cryptographically Verified by YojanaSethu Institutional Career Gateway · NMAMIT 2026
        </div>
      </div>
    );
  }

  // =========================================================================
  // TEMPLATE 4: MODERN TECH (DEFAULT — INDIGO ACCENTS, CLEAN HIERARCHY)
  // =========================================================================
  return (
    <div
      id="resume-document-print"
      className="w-full bg-white text-slate-900 p-8 sm:p-10 font-sans shadow-md border border-slate-200 print:border-none print:shadow-none print:p-0 print:m-0 space-y-5"
      style={{ minHeight: '1050px' }}
    >
      {/* Header: Name, Contact, Socials */}
      <div className="border-b-2 border-indigo-600 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-950">
          {contact.fullName}
        </h1>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600 font-medium">
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <span>•</span>}
          {contact.phone && <span>{contact.phone}</span>}
          {contact.location && <span>•</span>}
          {contact.location && <span>{contact.location}</span>}
          {contact.linkedin && <span>•</span>}
          {contact.linkedin && <span className="text-indigo-600 font-medium">{contact.linkedin}</span>}
          {contact.github && <span>•</span>}
          {contact.github && <span className="text-indigo-600 font-medium">{contact.github}</span>}
          {contact.portfolio && <span>•</span>}
          {contact.portfolio && <span className="text-indigo-600 font-medium">{contact.portfolio}</span>}
          {(contact.codingProfile || contact.leetcode) && <span>•</span>}
          {(contact.codingProfile || contact.leetcode) && <span className="text-amber-600 font-medium">{contact.codingProfile || contact.leetcode}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 border-b border-slate-200 pb-0.5 mb-1.5 flex items-center gap-1.5">
            <span>Career Objective & Technical Profile</span>
          </h2>
          <p className="text-xs leading-relaxed text-slate-700 text-justify">
            {summary}
          </p>
        </div>
      )}

      {/* Education */}
      <div>
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 border-b border-slate-200 pb-0.5 mb-1.5">
          Education
        </h2>
        <div className="flex justify-between items-baseline text-xs">
          <div>
            <strong className="font-bold text-slate-900">{education.institution}</strong>
            <div className="text-[11px] text-slate-600">
              {education.degree} in {education.field}
            </div>
          </div>
          <div className="text-right">
            <span className="font-bold text-indigo-600">CGPA: {education.cgpa}</span>
            <div className="text-[10px] text-slate-500">
              {education.startYear} – {education.endYear}
              {education.isVerified && ' • Contineo Verified'}
            </div>
          </div>
        </div>
      </div>

      {/* Technical Skills */}
      {allSkillsList.length > 0 && (
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 border-b border-slate-200 pb-0.5 mb-1.5">
            Technical Competencies
          </h2>
          <div className="text-xs space-y-1">
            {skills?.languages && skills.languages.length > 0 && (
              <div>
                <strong className="text-slate-900 font-bold">Languages: </strong>
                <span className="text-slate-700">{skills.languages.join(', ')}</span>
              </div>
            )}
            {skills?.frameworks && skills.frameworks.length > 0 && (
              <div>
                <strong className="text-slate-900 font-bold">Frameworks & Libraries: </strong>
                <span className="text-slate-700">{skills.frameworks.join(', ')}</span>
              </div>
            )}
            {skills?.toolsAndCloud && skills.toolsAndCloud.length > 0 && (
              <div>
                <strong className="text-slate-900 font-bold">Tools & Cloud: </strong>
                <span className="text-slate-700">{skills.toolsAndCloud.join(', ')}</span>
              </div>
            )}
            {skills?.coreCompetencies && skills.coreCompetencies.length > 0 && (
              <div>
                <strong className="text-slate-900 font-bold">Core Concepts: </strong>
                <span className="text-slate-700">{skills.coreCompetencies.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 border-b border-slate-200 pb-0.5 mb-1.5">
            Internships & Work Experience
          </h2>
          <div className="space-y-3">
            {experience.map((exp, i) => (
              <div key={exp.id || i} className="text-xs">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>
                    {exp.role} — <span className="font-semibold text-slate-600">{exp.company}</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    {exp.startDate} – {exp.endDate}
                  </span>
                </div>
                <p className="text-[11px] mt-0.5 text-slate-700 leading-relaxed">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 border-b border-slate-200 pb-0.5 mb-1.5">
            Key Engineering Projects
          </h2>
          <div className="space-y-3">
            {projects.map((proj, i) => (
              <div key={proj.id || i} className="text-xs">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{proj.title}</span>
                  {proj.githubUrl && (
                    <span className="text-[10px] font-mono text-indigo-600">
                      {proj.githubUrl}
                    </span>
                  )}
                </div>
                {proj.techStack && proj.techStack.length > 0 && (
                  <div className="text-[10px] text-indigo-600 font-semibold mb-0.5">
                    {proj.techStack.join(' • ')}
                  </div>
                )}
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  {proj.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications & Endorsements */}
      {certifications && certifications.length > 0 && (
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 border-b border-slate-200 pb-0.5 mb-1.5">
            Certifications & Verified Endorsements
          </h2>
          <div className="space-y-1.5 text-xs">
            {certifications.map((c, i) => (
              <div key={c.id || i} className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">{c.name}</span>
                  <span className="text-slate-500 text-[11px]"> — {c.issuer}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {c.isVerified && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>Verified {c.score ? `${Math.round(c.score)}%` : ''}</span>
                    </span>
                  )}
                  {c.date && <span className="text-[10px] text-slate-400">{c.date}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {achievements && achievements.length > 0 && (
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 border-b border-slate-200 pb-0.5 mb-1.5">
            Key Achievements & Recognition
          </h2>
          <ul className="text-xs space-y-1 text-slate-700 list-disc list-inside">
            {achievements.map((ach, i) => (
              <li key={i}>{ach}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Proof Watermark */}
      <div className="pt-3 border-t border-slate-100 text-center text-[10px] text-slate-400">
        Verified through YojanaSethu Institutional Gateway · NMAMIT Autonomous 2026
      </div>
    </div>
  );
}
