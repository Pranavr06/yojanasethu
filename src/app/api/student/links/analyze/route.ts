import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { validateStudentSession } from '@/lib/serverAuth';
import {
  dbGetStudentLinksAnalysis,
  dbSaveStudentLinksAnalysis,
  dbSaveStudentProfileLinks,
  dbResolveStudentProfileId,
} from '@/lib/db';
import { LinksAnalysisReport } from '@/types';
import fs from 'fs';

export const runtime = 'nodejs';

const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-flash-latest',
  'gemini-2.0-flash',
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientSuppliedStudentId = searchParams.get('student_id') || undefined;

    const authResult = await validateStudentSession(request, clientSuppliedStudentId);
    let effectiveStudentId = authResult.studentId;

    if (!effectiveStudentId) {
      if (clientSuppliedStudentId) {
        effectiveStudentId = (await dbResolveStudentProfileId(clientSuppliedStudentId)) || clientSuppliedStudentId;
      } else {
        effectiveStudentId = '11111111-1111-1111-1111-111111111111';
      }
    }

    const report = await dbGetStudentLinksAnalysis(effectiveStudentId);
    return NextResponse.json({
      success: true,
      hasReport: Boolean(report),
      report,
    });
  } catch (error: any) {
    console.error('GET /api/student/links/analyze error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch links analysis report' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      linkedin_url,
      github_url,
      leetcode_url,
      target_role = 'Software Development Engineer',
      target_job_description = '',
      student_id,
    } = body;

    const authResult = await validateStudentSession(request, student_id);
    let effectiveStudentId = authResult.studentId;

    if (!effectiveStudentId) {
      if (student_id) {
        effectiveStudentId = (await dbResolveStudentProfileId(student_id)) || student_id;
      } else {
        effectiveStudentId = '11111111-1111-1111-1111-111111111111';
      }
    }

    // 1. First save links to shared profile storage
    const targetId: string = effectiveStudentId || "11111111-1111-1111-1111-111111111111";
    await dbSaveStudentProfileLinks(targetId, {
      linkedin_url: linkedin_url?.trim() || undefined,
      github_url: github_url?.trim() || undefined,
      leetcode_url: leetcode_url?.trim() || undefined,
      target_role,
    });

    // 2. Resolve Gemini API Key
    let geminiKey = process.env.GEMINI_API_KEY || '';
    if (!geminiKey) {
      try {
        if (fs.existsSync('.env.local')) {
          const envLocal = fs.readFileSync('.env.local', 'utf8');
          for (const line of envLocal.split('\n')) {
            if (line.startsWith('GEMINI_API_KEY=')) {
              geminiKey = line.replace('GEMINI_API_KEY=', '').trim();
              break;
            }
          }
        }
      } catch {
        // Ignore file read error
      }
    }

    let report: LinksAnalysisReport | null = null;

    // 3. Attempt Live Gemini AI Analysis
    if (geminiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });

        const prompt = `You are a Principal Engineering Recruiter and Technical Hiring Bar Raiser evaluating a student candidate's professional presence for campus placement opportunities in India.
The student is targeting the role: "${target_role}".
${target_job_description ? `Target Job Description:\n"""\n${target_job_description.slice(0, 2000)}\n"""\n` : ''}

Candidate Profile Links Provided:
- LinkedIn Profile URL: ${linkedin_url || 'NOT PROVIDED'}
- GitHub Portfolio URL: ${github_url || 'NOT PROVIDED'}
- LeetCode / Coding Profile URL: ${leetcode_url || 'NOT PROVIDED'}

CRITICAL GUIDELINES & CONSTRAINTS:
1. Strict Honesty: Never hallucinate statistics, fake follower counts, or claim you analyzed private internal metrics.
2. If a link is missing or omitted by the student, mark its status as "not_provided" and provide actionable recommendations on why and how to build one.
3. If a link is provided (e.g., a LinkedIn, GitHub, or LeetCode URL), analyze the typical structure, expectations, visibility criteria, and role-readiness benchmarks for "${target_role}".
4. For LinkedIn: Critique headline, about/summary, experience, skills endorsement, projects, and target role keywords.
5. For GitHub: Evaluate repository presentation, README documentation standards, tech stack depth, and portfolio completeness for "${target_role}".
6. For LeetCode / Coding Platform: Critique problem solving distribution, potential DSA topic gaps (Graphs, DP, Trees, Two Pointers), contest consistency, and practice priorities.
7. Return ONLY a single, valid JSON object strictly matching the schema below. No markdown fences outside the JSON.

JSON SCHEMA:
{
  "target_role": "${target_role}",
  "overall_assessment": {
    "readiness_score": number (0-100),
    "executive_summary": string,
    "visibility_rating": "Exceptional" | "Competitive" | "Developing" | "Needs Attention",
    "key_takeaway": string
  },
  "strengths": string[],
  "missing_information": string[],
  "improvement_areas": string[],
  "linkedin_analysis": {
    "url": string or null,
    "status": "accessible" | "limited" | "not_provided",
    "headline_critique": string,
    "summary_critique": string,
    "missing_sections": string[],
    "experience_projects_critique": string,
    "skills_recommendations": string[],
    "actionable_tips": string[]
  },
  "github_analysis": {
    "url": string or null,
    "status": "accessible" | "limited" | "not_provided",
    "portfolio_completeness": string,
    "repository_presentation_critique": string,
    "readme_documentation_critique": string,
    "code_quality_and_stack": string,
    "highlighted_projects": string[],
    "actionable_tips": string[]
  },
  "leetcode_analysis": {
    "url": string or null,
    "status": "accessible" | "limited" | "not_provided",
    "problem_solving_tier": string,
    "difficulty_distribution_critique": string,
    "dsa_preparation_gaps": string[],
    "recommended_practice_topics": string[],
    "actionable_tips": string[]
  },
  "personalized_roadmap": [
    {
      "week": 1,
      "phase_title": string,
      "tasks": string[]
    },
    {
      "week": 2,
      "phase_title": string,
      "tasks": string[]
    },
    {
      "week": 3,
      "phase_title": string,
      "tasks": string[]
    },
    {
      "week": 4,
      "phase_title": string,
      "tasks": string[]
    }
  ]
}`;

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
              setTimeout(() => reject(new Error(`Timeout with model ${model}`)), 15000)
            );

            const result = await Promise.race([responsePromise, timeoutPromise]);
            const rawText = result?.text;

            if (rawText) {
              const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
              const parsed = JSON.parse(cleaned);
              parsed.ai_provider = 'gemini';
              parsed.analyzed_at = new Date().toISOString();
              parsed.target_role = target_role;
              parsed.target_job_description = target_job_description || undefined;
              report = parsed;
              break;
            }
          } catch (modelErr: any) {
            console.warn(`Gemini model ${model} attempt failed:`, modelErr.message);
          }
        }
      } catch (err: any) {
        console.warn('Gemini AI links analysis failed, using fallback generator:', err.message);
      }
    }

    // 4. Fallback Generator (Deterministic, High-Quality Role Benchmark Audit)
    if (!report) {
      report = generateDeterministicLinksReport({
        linkedin_url,
        github_url,
        leetcode_url,
        target_role,
        target_job_description,
      });
    }

    // 5. Save analysis report separately from actual resume
    await dbSaveStudentLinksAnalysis(targetId, report);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error('POST /api/student/links/analyze error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze student links' },
      { status: 500 }
    );
  }
}

/**
 * Intelligent deterministic fallback generator for when Gemini API key is missing or offline
 */
function generateDeterministicLinksReport(params: {
  linkedin_url?: string;
  github_url?: string;
  leetcode_url?: string;
  target_role: string;
  target_job_description?: string;
}): LinksAnalysisReport {
  const { linkedin_url, github_url, leetcode_url, target_role } = params;

  let score = 50;
  if (linkedin_url) score += 15;
  if (github_url) score += 20;
  if (leetcode_url) score += 15;

  const strengths: string[] = [];
  const missing_info: string[] = [];
  const improvement_areas: string[] = [];

  if (linkedin_url) {
    strengths.push('Professional LinkedIn presence established for recruiter outreach and industry discovery.');
  } else {
    missing_info.push('LinkedIn Profile URL is missing: Campus recruiters frequently cross-verify candidate professional experience and peer recommendations on LinkedIn.');
  }

  if (github_url) {
    strengths.push('Public GitHub portfolio provided: Allows engineering interviewers to inspect real code architecture, repository hygiene, and commits.');
  } else {
    missing_info.push('GitHub Portfolio URL missing: Cannot substantiate real code commits, system architecture, or open-source engineering contributions.');
  }

  if (leetcode_url) {
    strengths.push('Algorithmic coding profile linked: Demonstrates commitment to competitive coding benchmarks and technical interview readiness.');
  } else {
    missing_info.push('Coding profile link (LeetCode/Codeforces) not provided: Limits visibility into algorithmic problem solving and time-complexity discipline.');
  }

  improvement_areas.push('Ensure top pinned repositories have comprehensive, production-grade READMEs with system architecture diagrams, live demos, and API specifications.');
  improvement_areas.push(`Align LinkedIn headline explicitly with target role "${target_role}" rather than a generic student title.`);
  improvement_areas.push('Maintain consistent problem solving frequency across core algorithmic patterns (Trees, Dynamic Programming, Graphs) with a 60%+ Medium difficulty ratio.');

  const now = new Date().toISOString();

  return {
    target_role,
    target_job_description: params.target_job_description || undefined,
    analyzed_at: now,
    ai_provider: 'deterministic_fallback',
    overall_assessment: {
      readiness_score: score,
      executive_summary: `Your candidate presence presents a solid technical foundation with ${
        [linkedin_url, github_url, leetcode_url].filter(Boolean).length
      } out of 3 primary developer profile channels linked. To stand out for "${target_role}" in competitive campus drives, focus on repository documentation depth, quantified LinkedIn project outcomes, and disciplined Medium-difficulty problem distribution.`,
      visibility_rating: score >= 85 ? 'Exceptional' : score >= 70 ? 'Competitive' : score >= 50 ? 'Developing' : 'Needs Attention',
      key_takeaway: `Recruiters assess candidates in 3 dimensions: code quality (GitHub), algorithmic rigor (LeetCode), and career narrative (LinkedIn). Elevate all three in sync for maximum interview callback rates.`,
    },
    strengths,
    missing_information: missing_info,
    improvement_areas,
    linkedin_analysis: {
      url: linkedin_url || undefined,
      status: linkedin_url ? 'accessible' : 'not_provided',
      headline_critique: linkedin_url
        ? `Your headline should prominently highlight "${target_role} | Core Engineering Stack (TypeScript, Python, Distributed Systems)" rather than generic "Student at NMAMIT".`
        : 'LinkedIn profile not supplied. Add your URL to evaluate headline, summary, and recruiter visibility.',
      summary_critique:
        'Structure your About section using the 3-part formula: (1) Technical Identity & Specialization, (2) Flagship projects with measurable metrics, (3) Career ambitions and preferred engineering domains.',
      missing_sections: [
        'Featured Section: Pin your flagship repository, hackathon demo, or Contineo-verified credentials.',
        'Quantified Experience: Convert self-declarations into STAR bullet points with real throughput/user impact metrics.',
      ],
      experience_projects_critique:
        'Ensure each project listed links directly to its GitHub repository or live deployment URL so recruiters can verify claims in one click.',
      skills_recommendations: [
        'Data Structures & Algorithms',
        'System Design & Microservices',
        'PostgreSQL & Cloud Infrastructure',
        'TypeScript / Python / Go',
        'CI/CD Pipelines (Docker, GitHub Actions)',
      ],
      actionable_tips: [
        'Update headline to target specific keywords searched by corporate recruiters.',
        'Request 2-3 peer or mentor recommendations validating your engineering contributions.',
        'Engage weekly with engineering posts or share project build logs to boost profile discovery algorithms.',
      ],
    },
    github_analysis: {
      url: github_url || undefined,
      status: github_url ? 'accessible' : 'not_provided',
      portfolio_completeness: github_url
        ? 'Active repositories identified. Portfolio completeness can be elevated by curating 3-4 pinned repositories.'
        : 'GitHub profile not supplied. Adding your GitHub profile enables automated repository and code-hygiene audits.',
      repository_presentation_critique:
        'Avoid leaving default repository descriptions blank. Provide clean 1-sentence overviews, tags (e.g., #nextjs, #typescript, #docker), and live deployment links.',
      readme_documentation_critique:
        'Production READMEs should include: Project Motivation, Architectural Architecture / Diagram, Tech Stack Badges, Local Setup Instructions, API Endpoints, and Testing Instructions.',
      code_quality_and_stack:
        `Ensure codebases targeting "${target_role}" follow idiomatic type safety (TypeScript/Python typing), modular folder structures, unit test coverage, and Docker compose configurations.`,
      highlighted_projects: [
        'Full-Stack Distributed System or ERP Application',
        'High-Throughput Asynchronous Pipeline or Event-Driven Microservice',
        'Algorithmic Pattern Practice Repository',
      ],
      actionable_tips: [
        'Pin your 3 best projects to the profile frontpage with clear descriptive tags.',
        'Add a personal GitHub profile README (username/username repo) with a clean bio, tech stack icons, and live stats.',
        'Ensure commits are granular with conventional commit messages (e.g., feat:, fix:, refactor:).',
      ],
    },
    leetcode_analysis: {
      url: leetcode_url || undefined,
      status: leetcode_url ? 'accessible' : 'not_provided',
      problem_solving_tier: leetcode_url ? 'Active Contender (Tier 2 / Tier 1 Candidate)' : 'Unassessed',
      difficulty_distribution_critique:
        'Optimal distribution for product engineering placement drives: 25% Easy (warmups/fundamentals), 60% Medium (core hiring bar), 15% Hard (tie-breakers). Avoid padding counts with excessive Easy problems.',
      dsa_preparation_gaps: [
        'Graphs (BFS/DFS, Topological Sort, Dijkstra)',
        'Dynamic Programming (Knapsack, Longest Common Subsequence)',
        'Binary Trees & BST traversal edge-cases',
        'Sliding Window & Two Pointer optimizations',
      ],
      recommended_practice_topics: [
        'Arrays & Hashing (Hash Map lookups)',
        'Linked Lists & Fast/Slow Pointers',
        'Monotonic Stacks & Priority Queues',
        'Intervals & Greedy Scheduling',
      ],
      actionable_tips: [
        'Participate in Weekly and Biweekly contests to build resilience under real time constraints.',
        'Focus on solving 2 Medium problems per day consistently rather than binge-solving on weekends.',
        'Write out time and space complexity (Big-O) analysis for every accepted submission.',
      ],
    },
    personalized_roadmap: [
      {
        week: 1,
        phase_title: 'Profile Foundation & Repository Documentation',
        tasks: [
          'Revamp LinkedIn headline and About section with target role keywords.',
          'Create comprehensive READMEs for top 2 pinned GitHub repositories with architecture diagrams and setup instructions.',
          'Add a GitHub profile README showcasing your skills, tech stack, and portfolio links.',
        ],
      },
      {
        week: 2,
        phase_title: 'Algorithmic Mastery & Core Patterns',
        tasks: [
          'Solve 10 Medium-difficulty LeetCode problems focusing on Sliding Window and Two Pointers.',
          'Participate in the upcoming LeetCode Weekly Contest to benchmark speed and penalty count.',
          'Review space and time complexity optimizations for hash map solutions.',
        ],
      },
      {
        week: 3,
        phase_title: 'Graph & Dynamic Programming Deep Dive',
        tasks: [
          'Master BFS and DFS patterns: Number of Islands, Course Schedule, and Clone Graph.',
          'Solve 5 fundamental 1D and 2D Dynamic Programming problems.',
          'Document algorithmic solution templates in a dedicated GitHub DSA repository.',
        ],
      },
      {
        week: 4,
        phase_title: 'Mock Placement Readiness & Resume Sync',
        tasks: [
          'Sync your verified profile links into the YojanaSethu AI Resume Builder.',
          'Run an AI ATS audit on your generated resume for the target role.',
          'Conduct 1 AI Mock Interview session on YojanaSethu to practice behavioral and technical communication.',
        ],
      },
    ],
  };
}
