import { NextRequest, NextResponse } from "next/server";
import {
  executeLangGraphInterviewEvaluation,
  executeLangGraphQuestionGeneration,
  executeLangGraphFinalReport,
} from "@/lib/langgraph/interviewGraph";
import { validateStudentSession } from "@/lib/serverAuth";

export const runtime = "nodejs";

export interface AcousticTelemetry {
  speakingRateWpm?: number | null;
  pauseCount?: number | null;
  totalPauseSec?: number | null;
  durationSec?: number | null;
  meanPitchHz?: number | null;
  pitchVarianceHz?: number | null;
  loudnessVariationDb?: number | null;
  fillerCount?: number | null;
  fillerWords?: string[];
  isTypedAnswer?: boolean;
}

export interface VoiceAnalysisResult {
  speakingRate: {
    wpm: number | null;
    assessment: string;
    feedback: string;
  };
  pitchVariation: {
    varianceHz: number | null;
    assessment: string;
    feedback: string;
  };
  pausesAndHesitation: {
    pauseCount: number | null;
    totalPauseSec: number | null;
    assessment: string;
    feedback: string;
  };
  loudnessVariation: {
    assessment: string;
    feedback: string;
  };
  vocalClarity: {
    assessment: string;
    feedback: string;
  };
  fillerWords: {
    count: number;
    detected: string[];
    assessment: string;
    feedback: string;
  };
  pacingFluency: {
    assessment: string;
    feedback: string;
  };
  nervousnessIndicators: {
    observed: boolean;
    notes: string;
    feedback: string;
  };
}

export interface FullEvaluationResult {
  score: number;
  technical: number;
  communication: number;
  confidence: number;
  problemSolving: number;
  relevance: number;
  reasoning: number;
  structure: number;
  examples: number;
  aiFeedback: string;
  strengths: string[];
  improvements: string[];
  keyPointsCovered: string[];
  keyPointsMissed: string[];
  keyPointsHit: string[];
  suggestedAnswer: string;
  modelAnswer: string;
  followUpQuestion: string;
  coachingSummary: string;
  voiceAnalysis: VoiceAnalysisResult;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body." },
        { status: 400 }
      );
    }

    const {
      action,
      studentId,
      role,
      track,
      question,
      answer,
      keyPoints,
      acousticMetrics,
      audio,
      audioMimeType,
      evaluations,
      questionIndex,
      maxQuestions,
      difficulty,
      questionHistory,
    } = body || {};

    // Check optional authenticated student session for personalization
    let resolvedStudentId = studentId;
    try {
      const auth = await validateStudentSession(request, studentId);
      if (auth.authorized && auth.studentId) {
        resolvedStudentId = auth.studentId;
      }
    } catch {
      // Optional session auth; continue with anonymous candidate if unauthenticated
    }

    // -------------------------------------------------------------------------
    // ACTION 1: Generate Adaptive Question via LangGraph
    // -------------------------------------------------------------------------
    if (action === "generate_question") {
      const targetRole = String(role || "Software Engineer").slice(0, 100);
      const lastAnswerText =
        typeof body.lastAnswer === "string"
          ? body.lastAnswer
          : typeof answer === "string"
          ? answer
          : undefined;

      const generated = await executeLangGraphQuestionGeneration({
        studentId: resolvedStudentId,
        role: targetRole,
        track: String(track || "fullstack"),
        questionIndex: typeof questionIndex === "number" ? questionIndex : 0,
        maxQuestions: typeof maxQuestions === "number" ? maxQuestions : 4,
        difficulty: difficulty || "intermediate",
        questionHistory: Array.isArray(questionHistory) ? questionHistory : [],
        lastAnswer: lastAnswerText,
      });

      return NextResponse.json({
        question: generated.question,
        meta: {
          orchestrator: "LangGraph",
          durationMs: Date.now() - startTime,
        },
      });
    }

    // -------------------------------------------------------------------------
    // ACTION 2: Compile Final Placement Readiness Report via LangGraph
    // -------------------------------------------------------------------------
    if (action === "compile_report") {
      if (!Array.isArray(evaluations) || evaluations.length === 0) {
        return NextResponse.json(
          { error: "A non-empty evaluations array is required to compile a final report." },
          { status: 400 }
        );
      }

      const finalReport = await executeLangGraphFinalReport({
        studentId: resolvedStudentId,
        role: String(role || "Software Engineer"),
        track: String(track || "fullstack"),
        evaluations,
      });

      return NextResponse.json({
        finalReport,
        meta: {
          orchestrator: "LangGraph",
          durationMs: Date.now() - startTime,
        },
      });
    }

    // -------------------------------------------------------------------------
    // ACTION 3 (Default): Evaluate Candidate Answer via LangGraph
    // -------------------------------------------------------------------------
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
      ? keyPoints.filter((p): p is string => typeof p === "string" && !!p.trim()).slice(0, 10)
      : ["Assess core technical accuracy, trade-offs, and reasoning."];

    const questionTemplate = {
      id: `q-eval-${Date.now()}`,
      question: trimmedQuestion,
      category: "technical" as const,
      hint: "Explain core principles and architectural trade-offs.",
      sampleDemoAnswer: "Solid explanation of core mechanics and edge cases.",
      keyPoints: expectedPoints,
    };

    const graphResult = await executeLangGraphInterviewEvaluation({
      studentId: resolvedStudentId,
      role: targetRole,
      track: String(track || "fullstack"),
      question: questionTemplate,
      answer: trimmedAnswer,
      telemetry: acousticMetrics,
      audioBase64: audio,
      audioMimeType,
      existingEvaluations: Array.isArray(evaluations) ? evaluations : [],
      questionIndex: typeof questionIndex === "number" ? questionIndex : 0,
      maxQuestions: typeof maxQuestions === "number" ? maxQuestions : 4,
    });

    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      evaluation: graphResult.evaluation,
      meta: {
        orchestrator: "LangGraph",
        adaptiveNextAction: graphResult.adaptiveNextAction,
        followUpQuestion: graphResult.followUpQuestion,
        durationMs,
      },
    });
  } catch (error: any) {
    console.error("Critical error in interview evaluate route (LangGraph):", error);
    return NextResponse.json(
      {
        error: error?.message || "An unexpected error occurred during interview evaluation.",
      },
      { status: 500 }
    );
  }
}
