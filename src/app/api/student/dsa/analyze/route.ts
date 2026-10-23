import { NextRequest, NextResponse } from 'next/server';
import {
  getCodingProfiles,
  getLatestCodingStats,
  aggregateCodingStats,
  saveDsaReport,
  getDsaReports,
  saveWeeklyPlan,
} from '@/lib/dsa/dsaStore';
import {
  DsaAiAnalysisReport,
  DsaWeakArea,
  DsaWeeklyTask,
  AggregatedDsaStats,
  STANDARD_DSA_TOPICS,
} from '@/types/dsa';
import { validateStudentSession } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

// Currently supported models in v1beta generateContent (in order of priority & reliability)
const CANDIDATE_GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest',
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientSuppliedStudentId = searchParams.get('student_id') || undefined;

    // Verify student session server-side
    const authResult = await validateStudentSession(req, clientSuppliedStudentId);
    if (!authResult.authorized || !authResult.studentId) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized student session. Please log in.' },
        { status: authResult.status || 401 }
      );
    }
    const studentId = authResult.studentId;

    const reports = await getDsaReports(studentId);
    return NextResponse.json({ reports });
  } catch (error: any) {
    console.error('Error fetching DSA AI reports:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch analysis reports' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { student_id } = body;

    // Verify student session server-side
    const authResult = await validateStudentSession(req, student_id);
    if (!authResult.authorized || !authResult.studentId) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized student session. Please log in.' },
        { status: authResult.status || 401 }
      );
    }
    const studentId = authResult.studentId;

    const [profiles, stats] = await Promise.all([
      getCodingProfiles(studentId),
      getLatestCodingStats(studentId),
    ]);

    const aggregated = aggregateCodingStats(profiles, stats);

    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'GEMINI_API_KEY is not configured in .env.local. Please configure a valid Gemini API key to enable AI DSA performance analysis.',
        },
        { status: 500 }
      );
    }

    // Call Gemini API with candidate models and explicit error handling
    let report: DsaAiAnalysisReport;
    try {
      report = await generateGeminiDsaAnalysis(apiKey, studentId, aggregated, profiles);
    } catch (geminiError: any) {
      console.error('Gemini DSA analysis failed:', geminiError.message);
      // Return clear error response rather than silently presenting a fallback as an AI-generated report
      return NextResponse.json(
        {
          error: `Gemini AI analysis failed: ${geminiError.message || 'The Gemini API could not generate an analysis at this time.'}`,
        },
        { status: 502 }
      );
    }

    // Persist real AI report and generated weekly plan
    await saveDsaReport(studentId, report);
    const weekStart = new Date().toISOString().split('T')[0];
    await saveWeeklyPlan(studentId, report.weekly_improvement_plan, weekStart);

    return NextResponse.json({ report });
  } catch (error: any) {
    console.error('Error analyzing DSA progress:', error);
    return NextResponse.json({ error: error.message || 'Failed to analyze DSA progress' }, { status: 500 });
  }
}

/**
 * Gemini Live AI Analyzer using currently supported Gemini models with generateContent
 */
async function generateGeminiDsaAnalysis(
  apiKey: string,
  studentId: string,
  stats: AggregatedDsaStats,
  profiles: any[]
): Promise<DsaAiAnalysisReport> {
  const prompt = `You are the Lead Technical Interviewer and Campus Placement Evaluator at YojanaSethu.
Analyze the following student's actual coding platform statistics and generate a structured, rigorous DSA Performance Analysis and Weekly Improvement Plan.

CRITICAL INSTRUCTIONS:
1. Base all feedback strictly on the provided real statistics. Do not hallucinate numbers or unearned achievements.
2. In the "weak_areas" section, you MUST classify each weak topic strictly into one of three distinct categories:
   - "demonstrated_weakness": The student has attempted the topic (has solved 1-4 problems), but shows low problem volume, struggles with depth, or avoids medium/hard problems.
   - "insufficient_data": Insufficient data is recorded for this platform/topic to make a definitive judgment.
   - "not_yet_attempted": The student has solved exactly 0 problems in this curriculum topic.
3. Check for "Over-reliance on Easy": If the easy_ratio > 0.55 and medium_ratio < 0.35, flag it clearly. Campus technical interviews (Google, Amazon, Microsoft, TCS Digital) screen candidates on Medium and Hard problems.
4. Transparent evaluation basis: Make sure to clearly state that high problem counts alone do not equate to placement readiness unless Medium/Hard problems and topic breadth are demonstrated.
5. Return ONLY a valid JSON object matching the requested schema. No markdown formatting, no code fences.

Student DSA Statistics:
- Total Solved: ${stats.total_solved}
- Easy: ${stats.easy_solved}
- Medium: ${stats.medium_solved}
- Hard: ${stats.hard_solved}
- Total Submissions: ${stats.total_submissions}
- Acceptance Rate: ${stats.acceptance_rate}%
- Max Contest Rating: ${stats.max_contest_rating || 'N/A'}
- Active Streak: ${stats.active_streak} days
- Connected Platforms: ${profiles.map((p) => `${p.platform} (${p.username})`).join(', ') || 'None'}
- Topic Breakdown: ${JSON.stringify(stats.topic_breakdown)}

Required JSON Schema:
{
  "overall_performance": {
    "problem_solving_level": "Early Preparation" | "Approaching Readiness" | "Placement Ready" | "Highly Competitive",
    "score_percent": number (0-100),
    "total_progress_summary": string,
    "consistency_rating": string,
    "difficulty_distribution_critique": string
  },
  "strengths": [
    { "topic": string, "problems_solved": number, "insight": string }
  ],
  "weak_areas": [
    {
      "topic": string,
      "classification": "demonstrated_weakness" | "insufficient_data" | "not_yet_attempted",
      "problems_solved": number,
      "recommendation": string
    }
  ],
  "difficulty_analysis": {
    "easy_ratio": number,
    "medium_ratio": number,
    "hard_ratio": number,
    "is_over_relying_on_easy": boolean,
    "verdict": string,
    "target_ratio": string
  },
  "topic_wise_analysis": [
    {
      "category": string,
      "proficiency_level": "Mastered" | "Competent" | "Needs Practice" | "Not Started",
      "solved": number,
      "recommended_focus": string
    }
  ],
  "personalized_recommendations": {
    "priority_topics": string[],
    "recommended_difficulty": "Easy-to-Medium" | "Medium" | "Medium-to-Hard" | "Hard",
    "daily_target": number,
    "weekly_target": number,
    "revision_focus": string[],
    "actionable_tips": string[]
  },
  "placement_readiness": {
    "readiness_level": "Early Preparation" | "Approaching Readiness" | "Placement Ready" | "Highly Competitive",
    "interview_readiness_score": number (0-100),
    "strengths_for_interviews": string[],
    "critical_gaps_to_close": string[],
    "recommended_priorities": string[],
    "transparent_evaluation_basis": string
  },
  "weekly_improvement_plan": [
    {
      "id": string,
      "day": "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday",
      "topic": string,
      "focus_description": string,
      "target_problem_type": string,
      "target_count": number,
      "completed": boolean
    }
  ]
}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  };

  let lastError: any = null;
  let successfulModel: string | null = null;
  let rawText: string | null = null;

  // Try candidate models in order of priority & reliability
  for (const model of CANDIDATE_GEMINI_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Model ${model} returned HTTP ${response.status}: ${errorBody}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error(`Model ${model} returned an empty response`);
      }

      rawText = text;
      successfulModel = model;
      break; // Successfully got response
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini candidate model attempt failed (${model}):`, err.message);
      // Continue to next candidate model
    }
  }

  if (!rawText || !successfulModel) {
    throw new Error(lastError?.message || 'All supported Gemini models failed to generate content');
  }

  let parsed: any;
  try {
    parsed = JSON.parse(rawText);
  } catch (err: any) {
    throw new Error(`Failed to parse Gemini response as JSON: ${err.message}`);
  }

  return {
    id: `report-${Date.now()}`,
    student_id: studentId,
    generated_at: new Date().toISOString(),
    ai_provider: 'gemini',
    ai_status: 'gemini_live',
    provider_note: `Analysis generated live by Google Gemini AI (model: ${successfulModel}) based on verified coding platform statistics.`,
    ...parsed,
    statistics_snapshot: {
      total_solved: stats.total_solved,
      easy: stats.easy_solved,
      medium: stats.medium_solved,
      hard: stats.hard_solved,
      platforms_analyzed: profiles.map((p) => p.platform),
      synced_date: new Date().toISOString(),
    },
  };
}
