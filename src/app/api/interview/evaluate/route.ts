import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

// Valid candidate models in order of priority for low latency & reliability
const CANDIDATE_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
];

interface EvaluationResult {
  score: number;
  technical: number;
  communication: number;
  confidence: number;
  problemSolving: number;
  aiFeedback: string;
  strengths: string[];
  improvements: string[];
  keyPointsCovered: string[];
  keyPointsMissed: string[];
  suggestedAnswer: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Read API key from server environment
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY is missing from the server environment (.env.local). Please configure it to enable AI evaluations.",
        },
        { status: 500 }
      );
    }

    // 2. Read and validate request body
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body." },
        { status: 400 }
      );
    }

    const { question, answer, role, keyPoints } = body || {};

    if (typeof question !== "string" || !question.trim()) {
      return NextResponse.json(
        { error: "A valid interview question is required." },
        { status: 400 }
      );
    }

    if (typeof answer !== "string" || !answer.trim()) {
      return NextResponse.json(
        { error: "Please provide an answer before submitting for evaluation." },
        { status: 400 }
      );
    }

    const trimmedAnswer = answer.trim();
    const trimmedQuestion = question.trim();
    const targetRole = String(role || "Software Engineer").slice(0, 100);
    const expectedPoints: string[] = Array.isArray(keyPoints)
      ? keyPoints
          .filter((p): p is string => typeof p === "string" && !!p.trim())
          .slice(0, 10)
      : [];

    // 3. Construct calibrated prompt
    const prompt = `You are a strict, senior technical interviewer conducting a campus placement evaluation.
Target Role: ${targetRole}
Interview Question: ${trimmedQuestion}
Expected Key Points to Assess:
${expectedPoints.length > 0 ? expectedPoints.map((p, i) => `${i + 1}. ${p}`).join("\n") : "Assess core technical principles and problem solving."}

Candidate's Submitted Answer:
"""
${trimmedAnswer.slice(0, 8000)}
"""

SCORING BENCHMARK (Score strictly from 0 to 100 on each dimension):
- Score 0-15: Candidate states "I don't know", refuses to answer, provides gibberish, or submits irrelevant filler.
- Score 16-45: Minimal or largely inaccurate response; misses key technical mechanisms and trade-offs.
- Score 46-70: Partially correct; understands foundational concept but lacks depth, examples, or precision.
- Score 71-89: Solid, technically accurate answer covering key concepts clearly with good reasoning.
- Score 90-100: Comprehensive mastery; deep technical accuracy, trade-off analysis, edge cases, and concrete examples.

EVALUATION RULES:
1. Do NOT award points for answer length or keyword stuffing without genuine conceptual understanding.
2. Evaluate "confidence" SOLELY based on the clarity, assertiveness, and precision of the candidate's written phrasing. Do NOT infer vocal traits from typed text.
3. Compare the answer against the Expected Key Points. List which were covered vs missed.
4. Provide concise, constructive feedback, highlighted strengths, and specific areas for improvement.
5. Provide a clear, high-quality model suggested answer.`;

    // 4. Initialize Google GenAI client
    const ai = new GoogleGenAI({ apiKey });

    let rawResponseText = "";
    let lastError: any = null;
    let successfulModel = "";

    // 5. Try candidate models with timeout
    for (const model of CANDIDATE_MODELS) {
      try {
        const responsePromise = ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.2,
            maxOutputTokens: 1200,
            responseSchema: {
              type: "OBJECT",
              properties: {
                score: {
                  type: "INTEGER",
                  description: "Overall quality score from 0 to 100",
                },
                technical: {
                  type: "INTEGER",
                  description: "Technical accuracy and depth (0-100)",
                },
                communication: {
                  type: "INTEGER",
                  description: "Communication clarity and structure (0-100)",
                },
                confidence: {
                  type: "INTEGER",
                  description:
                    "Written phrasing assertiveness and clarity (0-100)",
                },
                problemSolving: {
                  type: "INTEGER",
                  description: "Problem-solving and reasoning (0-100)",
                },
                aiFeedback: {
                  type: "STRING",
                  description: "Constructive feedback explaining the score",
                },
                strengths: {
                  type: "ARRAY",
                  items: { type: "STRING" },
                  description: "Demonstrated strengths in the response",
                },
                improvements: {
                  type: "ARRAY",
                  items: { type: "STRING" },
                  description: "Actionable areas to improve",
                },
                keyPointsCovered: {
                  type: "ARRAY",
                  items: { type: "STRING" },
                  description: "Expected key points that were addressed",
                },
                keyPointsMissed: {
                  type: "ARRAY",
                  items: { type: "STRING" },
                  description: "Expected key points that were not addressed",
                },
                suggestedAnswer: {
                  type: "STRING",
                  description: "Crisp model reference answer",
                },
              },
              required: [
                "score",
                "technical",
                "communication",
                "confidence",
                "problemSolving",
                "aiFeedback",
                "strengths",
                "improvements",
                "keyPointsCovered",
                "keyPointsMissed",
                "suggestedAnswer",
              ],
            },
          },
        });

        // 12-second timeout per attempt to keep response time tight
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Gemini API call timed out.")), 12000)
        );

        const result = await Promise.race([responsePromise, timeoutPromise]);

        if (result?.text) {
          rawResponseText = result.text;
          successfulModel = model;
          break;
        }
      } catch (err: any) {
        lastError = err;
        const status = err?.status || err?.code || 0;
        console.warn(`Gemini evaluation error on model ${model}:`, err?.message || err);

        // If rate limited or service unavailable, try next candidate model
        if ([429, 500, 502, 503, 504].includes(Number(status))) {
          continue;
        }
      }
    }

    if (!rawResponseText) {
      const errorMessage =
        lastError?.message || "Gemini API could not generate an evaluation response.";
      const isRateLimit =
        errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED");
      const isUnavailable =
        errorMessage.includes("503") || errorMessage.includes("UNAVAILABLE");

      return NextResponse.json(
        {
          error: isRateLimit
            ? "Gemini API rate limit reached. Please wait a moment and try again."
            : isUnavailable
            ? "Gemini AI service is currently busy. Please retry in a few moments."
            : `AI evaluation failed: ${errorMessage}`,
        },
        { status: isRateLimit ? 429 : 502 }
      );
    }

    // 6. Parse and validate JSON evaluation
    let parsed: any;
    try {
      parsed = JSON.parse(rawResponseText);
    } catch {
      return NextResponse.json(
        { error: "Gemini returned a malformed JSON response. Please retry." },
        { status: 502 }
      );
    }

    const clampScore = (val: unknown, fallback: number): number => {
      const num = Number(val);
      if (!Number.isFinite(num)) return fallback;
      return Math.max(0, Math.min(100, Math.round(num)));
    };

    const technical = clampScore(parsed.technical, 0);
    const communication = clampScore(parsed.communication, 0);
    const confidence = clampScore(parsed.confidence, 0);
    const problemSolving = clampScore(parsed.problemSolving, 0);

    const averageSubScore = Math.round(
      (technical + communication + confidence + problemSolving) / 4
    );
    const score = clampScore(parsed.score, averageSubScore);

    const aiFeedback =
      typeof parsed.aiFeedback === "string" && parsed.aiFeedback.trim()
        ? parsed.aiFeedback.trim()
        : "Evaluation completed. Review the individual rubric scores.";

    const toStringArray = (arr: unknown): string[] => {
      if (!Array.isArray(arr)) return [];
      return arr.filter((item): item is string => typeof item === "string" && !!item.trim());
    };

    const strengths = toStringArray(parsed.strengths);
    const improvements = toStringArray(parsed.improvements);
    const keyPointsCovered = toStringArray(parsed.keyPointsCovered);
    const keyPointsMissed = toStringArray(parsed.keyPointsMissed);
    const suggestedAnswer =
      typeof parsed.suggestedAnswer === "string" ? parsed.suggestedAnswer.trim() : "";

    const evaluation: EvaluationResult = {
      score,
      technical,
      communication,
      confidence,
      problemSolving,
      aiFeedback,
      strengths,
      improvements,
      keyPointsCovered,
      keyPointsMissed,
      suggestedAnswer,
    };

    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      evaluation,
      meta: {
        model: successfulModel,
        durationMs,
      },
    });
  } catch (error: any) {
    console.error("Critical error in interview evaluate route:", error);
    return NextResponse.json(
      {
        error: error?.message || "An unexpected error occurred during interview evaluation.",
      },
      { status: 500 }
    );
  }
}
