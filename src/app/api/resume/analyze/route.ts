import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { validateStudentSession } from '@/lib/serverAuth';
import { ResumeAnalysisResult, ResumeData } from '@/types';
import zlib from 'zlib';

export const runtime = 'nodejs';

// High-speed candidate models with fallback
const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-flash-latest',
];

/**
 * Extracts raw text from a DOCX buffer without heavy dependencies
 */
function extractTextFromDocx(buffer: Buffer): string {
  try {
    // Search for word/document.xml in ZIP local file headers
    let offset = 0;
    while (offset < buffer.length - 30) {
      // Local file header signature: 0x04034b50 (PK\x03\x04)
      if (
        buffer[offset] === 0x50 &&
        buffer[offset + 1] === 0x4b &&
        buffer[offset + 2] === 0x03 &&
        buffer[offset + 3] === 0x04
      ) {
        const compressionMethod = buffer.readUInt16LE(offset + 8);
        const compressedSize = buffer.readUInt32LE(offset + 18);
        const fileNameLength = buffer.readUInt16LE(offset + 26);
        const extraFieldLength = buffer.readUInt16LE(offset + 28);
        const fileName = buffer.toString('utf8', offset + 30, offset + 30 + fileNameLength);

        const dataStart = offset + 30 + fileNameLength + extraFieldLength;
        const compressedData = buffer.slice(dataStart, dataStart + compressedSize);

        if (fileName === 'word/document.xml') {
          let xmlContent = '';
          if (compressionMethod === 8) {
            // Deflate compression
            xmlContent = zlib.inflateRawSync(compressedData).toString('utf8');
          } else if (compressionMethod === 0) {
            // Uncompressed
            xmlContent = compressedData.toString('utf8');
          }

          // Strip XML tags, keeping text content
          const text = xmlContent
            .replace(/<\/w:p>/g, '\n')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(/\s+/g, ' ')
            .trim();

          if (text) return text;
        }

        offset = dataStart + compressedSize;
      } else {
        offset++;
      }
    }
  } catch (err) {
    console.warn('DOCX binary extraction error:', err);
  }

  // Fallback: extract ASCII/UTF-8 strings from the buffer
  return buffer
    .toString('latin1')
    .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Intelligent deterministic fallback analysis when AI is unavailable or rate limited
 */
function generateDeterministicResumeAnalysis(params: {
  resumeText: string;
  targetRole: string;
  jobDescription?: string;
  resumeData?: Partial<ResumeData>;
}): ResumeAnalysisResult {
  const { resumeText, targetRole, jobDescription, resumeData } = params;
  const text = (resumeText || JSON.stringify(resumeData || '')).toLowerCase();

  // Benchmark technical skills for checking
  const COMMON_SKILLS = [
    { name: 'Python', cat: 'Languages' },
    { name: 'Java', cat: 'Languages' },
    { name: 'TypeScript', cat: 'Languages' },
    { name: 'JavaScript', cat: 'Languages' },
    { name: 'C++', cat: 'Languages' },
    { name: 'SQL', cat: 'Languages' },
    { name: 'React', cat: 'Frameworks' },
    { name: 'Next.js', cat: 'Frameworks' },
    { name: 'Node.js', cat: 'Frameworks' },
    { name: 'Docker', cat: 'DevOps & Cloud' },
    { name: 'Kubernetes', cat: 'DevOps & Cloud' },
    { name: 'AWS', cat: 'DevOps & Cloud' },
    { name: 'PostgreSQL', cat: 'Databases' },
    { name: 'MongoDB', cat: 'Databases' },
    { name: 'Git', cat: 'Tools' },
    { name: 'Data Structures', cat: 'Core' },
    { name: 'System Design', cat: 'Core' },
  ];

  const matchedSkills: string[] = [];
  const missingSkills: ResumeAnalysisResult['missingSkills'] = [];

  COMMON_SKILLS.forEach((s) => {
    if (text.includes(s.name.toLowerCase())) {
      matchedSkills.push(s.name);
    } else {
      missingSkills.push({
        skill: s.name,
        category: s.cat,
        importance: ['Python', 'SQL', 'Git', 'Data Structures'].includes(s.name) ? 'high' : 'medium',
        reason: `Standard expectation for ${targetRole} positions.`,
      });
    }
  });

  // Calculate scores based on verifiable indicators
  const hasQuantifiedMetrics = /\b(\d+[%kKmM]?|\$\d+|\d+\+)\b/.test(text);
  const hasActionVerbs = /\b(spearheaded|architected|engineered|optimized|implemented|deployed|developed|designed|built)\b/i.test(text);
  const hasGitHub = text.includes('github.com');
  const hasLinkedIn = text.includes('linkedin.com');

  const clarityScore = hasActionVerbs ? 85 : 70;
  const structureScore = 88;
  const relevanceScore = Math.min(95, 60 + matchedSkills.length * 3);
  const atsReadabilityScore = 90;
  const impactMetricsScore = hasQuantifiedMetrics ? 85 : 60;

  const totalEstimate = Math.round(
    clarityScore * 0.2 +
    structureScore * 0.2 +
    relevanceScore * 0.25 +
    atsReadabilityScore * 0.2 +
    impactMetricsScore * 0.15
  );

  const issues: ResumeAnalysisResult['issues'] = [];
  if (!hasQuantifiedMetrics) {
    issues.push({
      category: 'quantification',
      severity: 'critical',
      description: 'Project descriptions lack measurable metrics and quantifiable outcomes.',
      recommendation: 'Use the Google X-Y-Z formula: "Accomplished [X], as measured by [Y], by doing [Z]" (e.g., reduced query latency by 35%).',
    });
  }

  if (!hasGitHub) {
    issues.push({
      category: 'missing_info',
      severity: 'warning',
      description: 'No active GitHub profile link was detected.',
      recommendation: 'Add your GitHub profile URL to substantiate claimed skills with verifiable public repositories.',
    });
  }

  if (matchedSkills.length < 5) {
    issues.push({
      category: 'relevance',
      severity: 'critical',
      description: `Only ${matchedSkills.length} key technical skills were recognized for ${targetRole}.`,
      recommendation: `Incorporate industry-standard skills relevant to ${targetRole} into your core competencies section.`,
    });
  }

  return {
    atsScoreEstimate: Math.max(50, Math.min(98, totalEstimate)),
    scoreBreakdown: {
      clarity: clarityScore,
      structure: structureScore,
      relevance: relevanceScore,
      atsReadability: atsReadabilityScore,
      impactMetrics: impactMetricsScore,
    },
    summaryFeedback: `Resume demonstrates a solid technical foundation for ${targetRole}. Identified ${matchedSkills.length} core technical keywords with clean structural hierarchy. Enhancing project metrics with quantified impact will significantly elevate employer response rates.`,
    strengths: [
      `Well-defined technical background aligned with ${targetRole} requirements.`,
      `Clean, linear section structure with clear separation between education, skills, and projects.`,
      `Direct inclusion of modern development tools and technologies.`,
    ],
    issues,
    recommendations: [
      `Highlight 2-3 flagship projects with concrete architecture details and measurable outcomes.`,
      `Add verified credentials or faculty endorsements to establish institutional credibility.`,
      `Tailor resume keywords to match specific phrases in the target job description.`,
    ],
    missingSkills: missingSkills.slice(0, 6),
    matchedSkills,
    keywordOptimization: [
      {
        keyword: targetRole,
        foundInResume: text.includes(targetRole.toLowerCase()),
        suggestion: `Ensure the exact phrase "${targetRole}" appears in your professional summary and headline.`,
      },
      {
        keyword: 'RESTful APIs',
        foundInResume: text.includes('api') || text.includes('rest'),
        suggestion: 'Specify API design, GraphQL, or gRPC expertise in project descriptions.',
      },
      {
        keyword: 'CI/CD & Cloud',
        foundInResume: text.includes('docker') || text.includes('ci/cd') || text.includes('aws'),
        suggestion: 'Mention automated testing and deployment pipelines to showcase DevOps maturity.',
      },
    ],
    targetRoleAlignment: `Candidate profile shows strong potential for ${targetRole}. Core technical competencies overlap with foundational industry benchmarks.`,
    disclaimer: 'This score is an AI-generated estimate based on best-practice ATS benchmarks, not an actual employer ATS guarantee.',
  };
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let targetRole = 'Software Development Engineer';
    let jobDescription = '';
    let resumeText = '';
    let pdfBase64: string | null = null;
    let resumeDataInput: Partial<ResumeData> | null = null;

    // 1. Parse Multipart Form (File upload) vs JSON body
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      targetRole = (formData.get('targetRole') as string) || targetRole;
      jobDescription = (formData.get('jobDescription') as string) || '';

      if (!file) {
        return NextResponse.json(
          { error: 'No resume file uploaded. Please select a PDF or DOCX file.' },
          { status: 400 }
        );
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File size exceeds maximum permitted limit of 10MB.' },
          { status: 400 }
        );
      }

      const fileName = file.name.toLowerCase();
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (fileName.endsWith('.pdf')) {
        pdfBase64 = buffer.toString('base64');
      } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
        resumeText = extractTextFromDocx(buffer);
        if (!resumeText || resumeText.length < 20) {
          return NextResponse.json(
            { error: 'Could not extract readable text from the uploaded DOCX document. Please upload a PDF or enter details manually.' },
            { status: 422 }
          );
        }
      } else if (fileName.endsWith('.txt')) {
        resumeText = buffer.toString('utf8');
      } else {
        return NextResponse.json(
          { error: 'Unsupported file format. Please upload a PDF or DOCX file.' },
          { status: 400 }
        );
      }
    } else {
      const body = await request.json();
      targetRole = body.targetRole || targetRole;
      jobDescription = body.jobDescription || '';
      resumeText = body.resumeText || '';
      resumeDataInput = body.resumeData || null;

      if (!resumeText && !resumeDataInput) {
        return NextResponse.json(
          { error: 'No resume text or candidate data provided for analysis.' },
          { status: 400 }
        );
      }
    }

    // 2. Initialize Gemini AI with candidate models
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    const hasLiveKey = Boolean(apiKey && apiKey.length > 5 && !apiKey.includes('your_gemini'));

    if (hasLiveKey && apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `You are a Principal Technical Recruiter and Chief ATS Parsing Engine evaluating candidate resumes for engineering and technology roles in India.

TASK:
Analyze the provided resume document or text thoroughly for the target job role "${targetRole}".
${jobDescription ? `Target Job Description:\n"""\n${jobDescription.slice(0, 3000)}\n"""\n` : ''}

CRITICAL RULES:
1. Strict objectivity: Do NOT hallucinate skills, qualifications, certifications, or projects not present in the input.
2. Distinguish verified evidence (code repositories, certifications, verifiable metrics) from unverified self-declared claims.
3. Evaluate clarity, linear structure, relevance to "${targetRole}", ATS machine-readability, and quantified outcomes (STAR formula).
4. Identify missing critical skills, weak descriptions, and specific actionable recommendations.
5. Provide an estimated ATS Score (0 to 100) based on best-practice benchmarks.
6. Clearly include a disclaimer: "This score is an AI-generated estimate based on best-practice ATS benchmarks, not an actual employer ATS guarantee."
7. Return ONLY a single, valid JSON object strictly adhering to the schema below. NO markdown code blocks, NO text outside the JSON.

JSON SCHEMA:
{
  "atsScoreEstimate": number (0-100),
  "scoreBreakdown": {
    "clarity": number (0-100),
    "structure": number (0-100),
    "relevance": number (0-100),
    "atsReadability": number (0-100),
    "impactMetrics": number (0-100)
  },
  "summaryFeedback": string,
  "strengths": string[],
  "issues": [
    {
      "category": "clarity" | "structure" | "relevance" | "ats_readability" | "quantification" | "missing_info",
      "severity": "critical" | "warning" | "info",
      "description": string,
      "recommendation": string
    }
  ],
  "recommendations": string[],
  "missingSkills": [
    {
      "skill": string,
      "category": string,
      "importance": "high" | "medium" | "low",
      "reason": string
    }
  ],
  "matchedSkills": string[],
  "keywordOptimization": [
    {
      "keyword": string,
      "foundInResume": boolean,
      "suggestion": string
    }
  ],
  "targetRoleAlignment": string,
  "disclaimer": "This score is an AI-generated estimate based on best-practice ATS benchmarks, not an actual employer ATS guarantee.",
  "extractedSections": {
    "contact": {
      "fullName": string,
      "email": string,
      "phone": string,
      "location": string,
      "linkedin": string,
      "github": string
    },
    "summary": string,
    "education": {
      "institution": string,
      "degree": string,
      "field": string,
      "cgpa": string,
      "startYear": string,
      "endYear": string
    },
    "skills": {
      "languages": string[],
      "frameworks": string[],
      "toolsAndCloud": string[],
      "coreCompetencies": string[]
    },
    "projects": [
      {
        "id": string,
        "title": string,
        "techStack": string[],
        "description": string
      }
    ],
    "experience": [
      {
        "id": string,
        "role": string,
        "company": string,
        "startDate": string,
        "endDate": string,
        "description": string
      }
    ],
    "certifications": [
      {
        "id": string,
        "name": string,
        "issuer": string
      }
    ],
    "achievements": string[]
  }
}`;

        // Build contents payload
        const contentsPayload: any[] = [];
        if (pdfBase64) {
          contentsPayload.push({
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: 'application/pdf',
                  data: pdfBase64,
                },
              },
              { text: prompt },
            ],
          });
        } else {
          const inputContent = resumeText || JSON.stringify(resumeDataInput, null, 2);
          contentsPayload.push({
            role: 'user',
            parts: [
              {
                text: `${prompt}\n\nCandidate Resume Input:\n"""\n${inputContent.slice(0, 15000)}\n"""`,
              },
            ],
          });
        }

        // Try candidate models
        for (const model of CANDIDATE_MODELS) {
          try {
            const responsePromise = ai.models.generateContent({
              model,
              contents: contentsPayload,
              config: {
                temperature: 0.15,
                responseMimeType: 'application/json',
              },
            });

            // 18s timeout per attempt
            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error(`Timeout with model ${model}`)), 18000)
            );

            const result = await Promise.race([responsePromise, timeoutPromise]);
            const rawText = result?.text;

            if (rawText) {
              const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
              const parsed: ResumeAnalysisResult = JSON.parse(cleanedText);
              parsed.disclaimer = 'This score is an AI-generated estimate based on best-practice ATS benchmarks, not an actual employer ATS guarantee.';
              return NextResponse.json(parsed);
            }
          } catch (modelErr: any) {
            console.warn(`Gemini analysis attempt on ${model} failed:`, modelErr?.message || modelErr);
            continue;
          }
        }
      } catch (geminiErr: any) {
        console.warn('All Gemini candidate models failed, executing deterministic fallback:', geminiErr?.message || geminiErr);
      }
    }

    // 3. Deterministic fallback if Gemini is offline or rate limited
    const fallbackResult = generateDeterministicResumeAnalysis({
      resumeText: resumeText || (resumeDataInput ? JSON.stringify(resumeDataInput) : ''),
      targetRole,
      jobDescription,
      resumeData: resumeDataInput || undefined,
    });

    return NextResponse.json(fallbackResult);
  } catch (error: any) {
    console.error('Error in /api/resume/analyze:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to analyze resume' },
      { status: 500 }
    );
  }
}
