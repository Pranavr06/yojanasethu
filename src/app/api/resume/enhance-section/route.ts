import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

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
      section,
      content,
      targetRole = 'Software Development Engineer',
      targetJobDescription = '',
    }: {
      section: 'summary' | 'projects' | 'experience' | 'skills';
      content: any;
      targetRole?: string;
      targetJobDescription?: string;
    } = body;

    if (!section || content === undefined) {
      return NextResponse.json(
        { error: 'Invalid request: section and content are required.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    const hasLiveKey = Boolean(apiKey && apiKey.length > 5 && !apiKey.includes('your_gemini'));

    if (hasLiveKey && apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        let prompt = '';
        if (section === 'summary') {
          prompt = `You are an elite technical career advisor.
Rewrite and elevate this student resume career summary for a "${targetRole}" position.
Make it 3-4 concise, impactful sentences highlighting technical depth, system building mindset, and high engineering standards.
Do NOT invent fake degrees or certifications.
Return JSON with key "enhanced": string.

Current Summary:
"""
${content}
"""`;
        } else if (section === 'projects') {
          prompt = `You are a Principal Software Engineer.
Rewrite and elevate these project descriptions for a "${targetRole}" position.
Use strong action verbs ("Architected", "Engineered", "Optimized", "Formulated") and the Google X-Y-Z impact formula ("Accomplished [X] measured by [Y] by doing [Z]").
Do NOT change project titles or invent unrelated technologies.
Return JSON with key "enhanced": array of project objects matching the input schema.

Input Projects:
${JSON.stringify(content, null, 2)}`;
        } else if (section === 'experience') {
          prompt = `You are a Technical Talent Partner.
Rewrite and elevate these internship/work experience descriptions for a "${targetRole}" role.
Emphasize engineering velocity, code quality, and team collaboration.
Do NOT invent fake companies or roles.
Return JSON with key "enhanced": array of experience objects matching the input schema.

Input Experience:
${JSON.stringify(content, null, 2)}`;
        } else if (section === 'skills') {
          prompt = `You are an ATS Keyword Optimization Specialist.
Organize and optimize these technical skills into logical categories (languages, frameworks, toolsAndCloud, coreCompetencies) for a "${targetRole}" role.
Return JSON with key "enhanced": { languages: string[], frameworks: string[], toolsAndCloud: string[], coreCompetencies: string[] }.

Input Skills:
${JSON.stringify(content, null, 2)}`;
        }

        for (const model of CANDIDATE_MODELS) {
          try {
            const responsePromise = ai.models.generateContent({
              model,
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              config: {
                temperature: 0.2,
                responseMimeType: 'application/json',
              },
            });

            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Timeout')), 12000)
            );

            const result = await Promise.race([responsePromise, timeoutPromise]);
            const raw = result?.text;
            if (raw) {
              const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
              const parsed = JSON.parse(cleaned);
              return NextResponse.json({ success: true, enhanced: parsed.enhanced });
            }
          } catch (mErr) {
            continue;
          }
        }
      } catch (aiErr: any) {
        console.warn('Section enhance AI error:', aiErr?.message);
      }
    }

    // Fallback if AI is unconfigured
    return NextResponse.json({
      success: true,
      enhanced: content,
      note: 'Returned current content (AI fallback).',
    });
  } catch (error: any) {
    console.error('Error in /api/resume/enhance-section:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to enhance section' },
      { status: 500 }
    );
  }
}
