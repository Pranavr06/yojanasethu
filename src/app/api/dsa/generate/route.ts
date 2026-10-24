import { NextRequest, NextResponse } from 'next/server';
import { validateStudentSession } from '@/lib/serverAuth';
import { DSAProblem } from '@/types';
import { dbSaveDSAProblem } from '@/lib/db';
// @ts-ignore
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';

const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
];

/**
 * POST /api/dsa/generate
 * Uses Google Gemini to generate custom coding practice problems.
 * Explicitly labeled as "ai_generated".
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      topic = 'Dynamic Programming',
      difficulty = 'Medium',
      targetCompany = 'Google',
      weaknessContext = '',
      studentId,
    } = body;

    // Authenticate student session
    const authResult = await validateStudentSession(request, studentId);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error || 'Unauthorized' }, { status: authResult.status });
    }

    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      // Deterministic fallback generated problem
      const fallbackProblem: DSAProblem = {
        id: `gen-${Date.now()}`,
        title: `Optimal Resource Allocation for ${targetCompany} Clusters`,
        category: topic,
        difficulty: difficulty as any,
        frequency: 'High',
        core_pattern: 'Prefix DP with Bounded Capacity',
        category_type: 'ai_generated',
        target_companies: [targetCompany, 'Tier 1 Product Firms'],
        target_role: 'Software Development Engineer',
        statement: `[AI-Generated Practice Problem — Inspired by ${topic}]\n\nYou are managing a compute cluster with memory slots. Given an array of process memory requirements and an integer threshold, determine the maximum throughput achievable without exceeding memory limits.`,
        constraints: ['1 <= memory.length <= 10^4', '1 <= memory[i] <= 10^5'],
        examples: [
          { input: 'memory = [10, 20, 30], limit = 40', output: '2', explanation: 'Can run processes 10 and 30 or 10 and 20.' },
        ],
        hints: [
          'Sort the array or formulate a 0/1 knapsack state table.',
          'State definition: dp[i][w] is the maximum processes runnable with first i items and weight w.',
        ],
        starter_code: {
          python: `def max_cluster_throughput(memory: list[int], limit: int) -> int:\n    # [AI-Generated Problem]\n    pass`,
          java: `class Solution {\n    public int maxClusterThroughput(int[] memory, int limit) {\n        // [AI-Generated Problem]\n        return 0;\n    }\n}`,
          cpp: `class Solution {\npublic:\n    int maxClusterThroughput(vector<int>& memory, int limit) {\n        // [AI-Generated Problem]\n        return 0;\n    }\n};`,
          typescript: `function maxClusterThroughput(memory: number[], limit: number): number {\n    // [AI-Generated Problem]\n    return 0;\n}`,
        },
        reference_solution: {
          python: `def max_cluster_throughput(memory: list[int], limit: int) -> int:\n    memory.sort()\n    count = 0\n    total = 0\n    for m in memory:\n        if total + m <= limit:\n            total += m\n            count += 1\n        else:\n            break\n    return count`,
          java: `class Solution {\n    public int maxClusterThroughput(int[] memory, int limit) {\n        Arrays.sort(memory);\n        int count = 0, total = 0;\n        for (int m : memory) {\n            if (total + m <= limit) {\n                total += m;\n                count++;\n            } else break;\n        }\n        return count;\n    }\n}`,
          cpp: `class Solution {\npublic:\n    int maxClusterThroughput(vector<int>& memory, int limit) {\n        sort(memory.begin(), memory.end());\n        int count = 0, total = 0;\n        for (int m : memory) {\n            if (total + m <= limit) {\n                total += m;\n                count++;\n            } else break;\n        }\n        return count;\n    }\n};`,
          typescript: `function maxClusterThroughput(memory: number[], limit: number): number {\n    memory.sort((a, b) => a - b);\n    let count = 0, total = 0;\n    for (const m of memory) {\n        if (total + m <= limit) {\n            total += m;\n            count++;\n        } else break;\n    }\n    return count;\n}`,
        },
        time_complexity: 'O(N log N)',
        space_complexity: 'O(1)',
        source_attribution: 'AI-Generated Practice (Deterministic Fallback)',
        test_cases: [
          { input: '[10, 20, 30], 40', expectedOutput: '2' },
          { input: '[5, 5, 5], 15', expectedOutput: '3' },
        ],
        prerequisites: [],
      };

      await dbSaveDSAProblem(fallbackProblem);
      return NextResponse.json({ problem: fallbackProblem, source: 'fallback' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Generate a realistic Data Structures & Algorithms coding challenge.
Topic: ${topic}
Target Difficulty: ${difficulty}
Target Company: ${targetCompany}
Weakness Context to Address: ${weaknessContext || 'None specified'}

Return STRICT valid JSON only with this schema:
{
  "title": string,
  "category": "${topic}",
  "difficulty": "${difficulty}",
  "core_pattern": string,
  "statement": string (prefix with "[AI-Generated Practice Problem — Inspired by ${topic}]"),
  "constraints": string[],
  "examples": [ { "input": string, "output": string, "explanation": string } ],
  "hints": [ string, string, string ],
  "starter_code": {
    "python": string,
    "java": string,
    "cpp": string,
    "typescript": string
  },
  "reference_solution": {
    "python": string,
    "java": string,
    "cpp": string,
    "typescript": string
  },
  "time_complexity": string,
  "space_complexity": string,
  "test_cases": [
    { "input": string, "expectedOutput": string },
    { "input": string, "expectedOutput": string }
  ]
}`;

    let generatedJson: any = null;

    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          generatedJson = JSON.parse(response.text);
          break;
        }
      } catch (err: any) {
        console.warn(`Gemini generation model ${model} error:`, err?.message || err);
      }
    }

    if (!generatedJson || !generatedJson.title) {
      return NextResponse.json({ error: 'Failed to generate problem via AI' }, { status: 502 });
    }

    const newProblem: DSAProblem = {
      id: `ai-gen-${Date.now()}`,
      title: generatedJson.title,
      category: topic,
      difficulty: (difficulty as any) || 'Medium',
      frequency: 'High',
      core_pattern: generatedJson.core_pattern || `${topic} pattern`,
      category_type: 'ai_generated',
      target_companies: [targetCompany, 'Campus Recruitment'],
      target_role: 'Software Development Engineer',
      statement: generatedJson.statement.startsWith('[AI-Generated')
        ? generatedJson.statement
        : `[AI-Generated Practice Problem — Inspired by ${topic}]\n\n${generatedJson.statement}`,
      constraints: generatedJson.constraints || ['1 <= N <= 10^4'],
      examples: generatedJson.examples || [],
      hints: generatedJson.hints || ['Break down into smaller subproblems.'],
      starter_code: generatedJson.starter_code || {},
      reference_solution: generatedJson.reference_solution || {},
      time_complexity: generatedJson.time_complexity || 'O(N)',
      space_complexity: generatedJson.space_complexity || 'O(1)',
      source_attribution: `AI-Generated Practice (Google Gemini AI, Inspired by ${targetCompany} Assessment Patterns)`,
      test_cases: generatedJson.test_cases || [],
      prerequisites: [],
    };

    await dbSaveDSAProblem(newProblem);

    return NextResponse.json({ problem: newProblem, source: 'gemini_ai' });
  } catch (error: any) {
    console.error('POST /api/dsa/generate error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
