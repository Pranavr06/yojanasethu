import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { ResumeData } from '@/types';

export const runtime = 'nodejs';

const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-flash-latest',
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      resumeData,
      targetRole = 'Software Development Engineer',
      targetJobDescription = '',
    }: {
      resumeData: ResumeData;
      targetRole?: string;
      targetJobDescription?: string;
    } = body;

    if (!resumeData) {
      return NextResponse.json(
        { error: 'Invalid request: resumeData is required.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    const hasLiveKey = Boolean(apiKey && apiKey.length > 5 && !apiKey.includes('your_gemini'));

    if (hasLiveKey && apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `You are an elite Technical Resume Strategist and Executive Career Coach.

TASK:
Optimize and elevate the provided engineering student resume data into a polished, high-impact, ATS-optimized technical resume tailored for the target role "${targetRole}".
${targetJobDescription ? `Target Job Description:\n"""\n${targetJobDescription.slice(0, 3000)}\n"""\n` : ''}

STRICT CONSTRAINTS (MANDATORY):
1. NEVER hallucinate or invent new CGPA, academic scores, degrees, fake internships, false certifications, or fabricated company names.
2. PRESERVE all factual student data: actual full name, email, phone, location, college institution, degree, CGPA, graduation years, and real project topics.
3. ELEVATE project and experience bullet points using high-impact action verbs (e.g. "Architected", "Engineered", "Streamlined", "Accelerated", "Formulated") and measurable impact formulas (Google X-Y-Z formula: "Accomplished [X], measured by [Y], by doing [Z]").
4. WRITE a concise, punchy 3-4 sentence professional summary tailored to "${targetRole}", emphasizing technical proficiency, system design mindset, and real achievements.
5. ORGANIZE technical skills cleanly into: Languages, Frameworks, Tools & Cloud, and Core Competencies.
6. Return ONLY a single valid JSON object adhering strictly to the ResumeData schema. NO markdown formatting, NO conversational text.

INPUT RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

OUTPUT SCHEMA (Must match ResumeData exactly):
{
  "contact": {
    "fullName": string,
    "email": string,
    "phone": string,
    "location": string,
    "linkedin": string,
    "github": string,
    "portfolio": string
  },
  "summary": string,
  "targetRole": string,
  "targetJobDescription": string,
  "education": {
    "institution": string,
    "degree": string,
    "field": string,
    "cgpa": string,
    "startYear": string,
    "endYear": string,
    "location": string,
    "isVerified": boolean
  },
  "skills": {
    "languages": string[],
    "frameworks": string[],
    "toolsAndCloud": string[],
    "coreCompetencies": string[],
    "softSkills": string[]
  },
  "projects": [
    {
      "id": string,
      "title": string,
      "role": string,
      "techStack": string[],
      "description": string,
      "highlights": string[],
      "githubUrl": string,
      "liveUrl": string
    }
  ],
  "experience": [
    {
      "id": string,
      "role": string,
      "company": string,
      "location": string,
      "startDate": string,
      "endDate": string,
      "description": string,
      "highlights": string[]
    }
  ],
  "certifications": [
    {
      "id": string,
      "name": string,
      "issuer": string,
      "date": string,
      "isVerified": boolean,
      "score": number,
      "credentialUrl": string
    }
  ],
  "achievements": string[]
}`;

        for (const model of CANDIDATE_MODELS) {
          try {
            const responsePromise = ai.models.generateContent({
              model,
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              config: {
                temperature: 0.25,
                responseMimeType: 'application/json',
              },
            });

            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error(`Timeout with model ${model}`)), 20000)
            );

            const result = await Promise.race([responsePromise, timeoutPromise]);
            const rawText = result?.text;

            if (rawText) {
              const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
              const enhancedResume: ResumeData = JSON.parse(cleaned);

              // Safeguard: Ensure core facts were not overwritten with placeholders
              if (!enhancedResume.contact?.fullName || enhancedResume.contact.fullName.includes('[')) {
                enhancedResume.contact = resumeData.contact;
              }
              if (!enhancedResume.education?.cgpa || enhancedResume.education.cgpa.includes('[')) {
                enhancedResume.education = resumeData.education;
              }

              return NextResponse.json({
                success: true,
                resume: enhancedResume,
                ai_model: model,
                enhanced_at: new Date().toISOString(),
              });
            }
          } catch (modelErr: any) {
            console.warn(`Gemini generation on model ${model} failed:`, modelErr?.message || modelErr);
            continue;
          }
        }
      } catch (geminiErr: any) {
        console.warn('Gemini generateContent failed, falling back:', geminiErr?.message || geminiErr);
      }
    }

    // Deterministic enhancement fallback (cleans up formatting, ensures action verbs, organizes skills)
    const fallbackEnhanced: ResumeData = {
      ...resumeData,
      targetRole,
      targetJobDescription,
      summary: resumeData.summary || `Proactive ${resumeData.education?.field || 'Computer Science'} undergraduate with strong technical acumen in software engineering, distributed systems, and algorithmic problem-solving. Proven track record in developing full-stack applications with clean architecture and maintainable codebases.`,
      projects: (resumeData.projects || []).map((p) => ({
        ...p,
        description: p.description
          ? p.description.replace(/^developed /i, 'Engineered ').replace(/^created /i, 'Architected and built ')
          : 'Designed and deployed production-ready application with comprehensive test coverage and CI/CD automation.',
      })),
      experience: (resumeData.experience || []).map((e) => ({
        ...e,
        description: e.description
          ? e.description.replace(/^worked on /i, 'Spearheaded technical contributions across ')
          : 'Contributed to scalable microservices and cross-functional feature delivery with high code quality.',
      })),
    };

    return NextResponse.json({
      success: true,
      resume: fallbackEnhanced,
      ai_model: 'deterministic_enhancer',
      enhanced_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/resume/generate:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate enhanced resume' },
      { status: 500 }
    );
  }
}
