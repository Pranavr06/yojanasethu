import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

// Valid candidate models in order of priority for low latency & reliability
const CANDIDATE_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
];

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

    const { question, answer, role, keyPoints, acousticMetrics, audio, audioMimeType } =
      body || {};

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

    const telemetry: AcousticTelemetry = acousticMetrics || {};
    const isTyped = Boolean(telemetry.isTypedAnswer);

    // 3. Construct calibrated prompt
    const prompt = `You are a strict, senior engineering interviewer and speech communication coach evaluating a candidate for a technical campus placement role.

Target Role: ${targetRole}
Interview Question: ${trimmedQuestion}
Expected Key Points to Assess:
${expectedPoints.length > 0 ? expectedPoints.map((p, i) => `${i + 1}. ${p}`).join("\n") : "Assess core technical accuracy, trade-offs, and reasoning."}

Candidate's Submitted Answer Transcript:
"""
${trimmedAnswer.slice(0, 8000)}
"""

${
  isTyped
    ? `Submission Mode: Typed Answer (Acoustic audio telemetry not recorded; evaluate delivery metrics as typed-communication clarity without inventing vocal pitch or WPM).`
    : `Observable Acoustic Telemetry (from candidate's microphone recording):
- Speaking Rate: ${telemetry.speakingRateWpm ? `${telemetry.speakingRateWpm} WPM` : "Estimated from duration"}
- Total Duration: ${telemetry.durationSec ? `${telemetry.durationSec.toFixed(1)} seconds` : "N/A"}
- Pause Count: ${telemetry.pauseCount ?? 0} pauses (Total pause duration: ${telemetry.totalPauseSec ? `${telemetry.totalPauseSec.toFixed(1)}s` : "0s"})
- Pitch Modulation: ${telemetry.pitchVarianceHz ? `Standard deviation of ${telemetry.pitchVarianceHz} Hz around mean ${telemetry.meanPitchHz || 150} Hz` : "Natural range"}
- Loudness Variation: ${telemetry.loudnessVariationDb ? `${telemetry.loudnessVariationDb} dB spread` : "Stable"}
- Filler Words Detected: ${telemetry.fillerCount ?? 0} (${(telemetry.fillerWords || []).join(", ") || "none"})`
}

SCORING BENCHMARK (Score strictly from 0 to 100 on each dimension):
- Score 0-15: Candidate states "I don't know", refuses to answer, provides gibberish, or submits irrelevant filler.
- Score 16-45: Minimal or largely inaccurate response; misses key technical mechanisms and trade-offs.
- Score 46-70: Partially correct; understands foundational concept but lacks depth, examples, or precision.
- Score 71-89: Solid, technically accurate answer covering key concepts clearly with good reasoning.
- Score 90-100: Comprehensive mastery; deep technical accuracy, trade-off analysis, edge cases, and concrete examples.

CRITICAL EVALUATION RULES:
1. Clearly distinguish TECHNICAL ANSWER QUALITY from VOCAL DELIVERY. A candidate with nervous delivery but flawless technical reasoning must score high on technical dimensions. Conversely, a smooth, confident voice delivering incorrect technical concepts must receive a low technical score.
2. Confidence score: evaluate SOLELY on the assertiveness, clarity, and precision of phrasing. Do not penalize accents, quiet voices, or speech disabilities.
3. Compare the answer against the Expected Key Points. Categorize which points were covered vs missed.
4. Voice modulation and delivery analysis:
   - If audio telemetry is provided, interpret the measured speaking rate, pitch variation, pauses, volume consistency, and filler count objectively.
   - If typed, mark acoustic metrics as not applicable and assess textual clarity.
   - For nervousness indicators: only cite observable evidence (e.g. extreme rapid speech or prolonged silence); do not diagnose emotional states.
5. Provide a constructive feedback explanation, highlighted strengths, actionable areas to improve, a high-quality model answer, and a relevant follow-up question.`;

    // 4. Initialize Google GenAI client
    const ai = new GoogleGenAI({ apiKey });

    let rawResponseText = "";
    let lastError: any = null;
    let successfulModel = "";

    // 5. Try candidate models with timeout
    for (const model of CANDIDATE_MODELS) {
      try {
        const contentsPayload: any[] = [];

        // If audio base64 is provided and reasonable in size (< 4MB), include inline audio data
        if (
          audio &&
          typeof audio === "string" &&
          audio.length < 5000000 &&
          !isTyped
        ) {
          contentsPayload.push({
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: audioMimeType || "audio/webm",
                  data: audio,
                },
              },
              { text: prompt },
            ],
          });
        } else {
          contentsPayload.push({
            role: "user",
            parts: [{ text: prompt }],
          });
        }

        const responsePromise = ai.models.generateContent({
          model,
          contents: contentsPayload,
          config: {
            responseMimeType: "application/json",
            temperature: 0.2,
            maxOutputTokens: 1800,
            responseSchema: {
              type: "OBJECT",
              properties: {
                overallScore: {
                  type: "INTEGER",
                  description: "Overall technical qualification score (0-100)",
                },
                technicalScore: {
                  type: "INTEGER",
                  description: "Technical correctness and depth (0-100)",
                },
                relevanceScore: {
                  type: "INTEGER",
                  description: "Direct relevance to question (0-100)",
                },
                reasoningScore: {
                  type: "INTEGER",
                  description: "Logical reasoning and problem solving (0-100)",
                },
                communicationScore: {
                  type: "INTEGER",
                  description: "Clarity and structure of explanation (0-100)",
                },
                rubric: {
                  type: "OBJECT",
                  properties: {
                    technical: { type: "INTEGER" },
                    relevance: { type: "INTEGER" },
                    reasoning: { type: "INTEGER" },
                    communication: { type: "INTEGER" },
                    structure: { type: "INTEGER" },
                    examples: { type: "INTEGER" },
                  },
                  required: [
                    "technical",
                    "relevance",
                    "reasoning",
                    "communication",
                    "structure",
                    "examples",
                  ],
                },
                voiceAnalysis: {
                  type: "OBJECT",
                  properties: {
                    speakingRate: {
                      type: "OBJECT",
                      properties: {
                        wpm: { type: "NUMBER" },
                        assessment: { type: "STRING" },
                        feedback: { type: "STRING" },
                      },
                      required: ["assessment", "feedback"],
                    },
                    pitchVariation: {
                      type: "OBJECT",
                      properties: {
                        varianceHz: { type: "NUMBER" },
                        assessment: { type: "STRING" },
                        feedback: { type: "STRING" },
                      },
                      required: ["assessment", "feedback"],
                    },
                    pausesAndHesitation: {
                      type: "OBJECT",
                      properties: {
                        pauseCount: { type: "INTEGER" },
                        totalPauseSec: { type: "NUMBER" },
                        assessment: { type: "STRING" },
                        feedback: { type: "STRING" },
                      },
                      required: ["assessment", "feedback"],
                    },
                    loudnessVariation: {
                      type: "OBJECT",
                      properties: {
                        assessment: { type: "STRING" },
                        feedback: { type: "STRING" },
                      },
                      required: ["assessment", "feedback"],
                    },
                    vocalClarity: {
                      type: "OBJECT",
                      properties: {
                        assessment: { type: "STRING" },
                        feedback: { type: "STRING" },
                      },
                      required: ["assessment", "feedback"],
                    },
                    fillerWords: {
                      type: "OBJECT",
                      properties: {
                        count: { type: "INTEGER" },
                        detected: {
                          type: "ARRAY",
                          items: { type: "STRING" },
                        },
                        assessment: { type: "STRING" },
                        feedback: { type: "STRING" },
                      },
                      required: ["count", "detected", "assessment", "feedback"],
                    },
                    pacingFluency: {
                      type: "OBJECT",
                      properties: {
                        assessment: { type: "STRING" },
                        feedback: { type: "STRING" },
                      },
                      required: ["assessment", "feedback"],
                    },
                    nervousnessIndicators: {
                      type: "OBJECT",
                      properties: {
                        observed: { type: "BOOLEAN" },
                        notes: { type: "STRING" },
                        feedback: { type: "STRING" },
                      },
                      required: ["observed", "notes", "feedback"],
                    },
                  },
                  required: [
                    "speakingRate",
                    "pitchVariation",
                    "pausesAndHesitation",
                    "loudnessVariation",
                    "vocalClarity",
                    "fillerWords",
                    "pacingFluency",
                    "nervousnessIndicators",
                  ],
                },
                keyPointsCovered: {
                  type: "ARRAY",
                  items: { type: "STRING" },
                  description: "Expected points successfully demonstrated",
                },
                keyPointsMissed: {
                  type: "ARRAY",
                  items: { type: "STRING" },
                  description: "Expected points omitted or incomplete",
                },
                strengths: {
                  type: "ARRAY",
                  items: { type: "STRING" },
                  description: "Demonstrated strengths",
                },
                improvements: {
                  type: "ARRAY",
                  items: { type: "STRING" },
                  description: "Actionable technical and delivery improvements",
                },
                modelAnswer: {
                  type: "STRING",
                  description: "Exemplary model reference answer",
                },
                followUpQuestion: {
                  type: "STRING",
                  description:
                    "Probing follow-up question directly related to candidate's answer",
                },
                coachingSummary: {
                  type: "STRING",
                  description:
                    "Executive coaching summary combining technical answer and delivery",
                },
              },
              required: [
                "overallScore",
                "technicalScore",
                "relevanceScore",
                "reasoningScore",
                "communicationScore",
                "rubric",
                "voiceAnalysis",
                "keyPointsCovered",
                "keyPointsMissed",
                "strengths",
                "improvements",
                "modelAnswer",
                "followUpQuestion",
                "coachingSummary",
              ],
            },
          },
        });

        // 15-second timeout per attempt
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Gemini API call timed out.")), 15000)
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

        // If rate limited or unavailable, try next candidate model
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

    const technical = clampScore(
      parsed.rubric?.technical ?? parsed.technicalScore,
      0
    );
    const relevance = clampScore(
      parsed.rubric?.relevance ?? parsed.relevanceScore,
      0
    );
    const reasoning = clampScore(
      parsed.rubric?.reasoning ?? parsed.reasoningScore,
      0
    );
    const communication = clampScore(
      parsed.rubric?.communication ?? parsed.communicationScore,
      0
    );
    const structure = clampScore(parsed.rubric?.structure, communication);
    const examples = clampScore(parsed.rubric?.examples, technical);

    const averageSubScore = Math.round(
      (technical + relevance + reasoning + communication + structure + examples) / 6
    );
    const score = clampScore(parsed.overallScore, averageSubScore);

    const toStringArray = (arr: unknown): string[] => {
      if (!Array.isArray(arr)) return [];
      return arr.filter(
        (item): item is string => typeof item === "string" && !!item.trim()
      );
    };

    const strengths = toStringArray(parsed.strengths);
    const improvements = toStringArray(parsed.improvements);
    const keyPointsCovered = toStringArray(parsed.keyPointsCovered);
    const keyPointsMissed = toStringArray(parsed.keyPointsMissed);
    const modelAnswer =
      typeof parsed.modelAnswer === "string" && parsed.modelAnswer.trim()
        ? parsed.modelAnswer.trim()
        : "";
    const followUpQuestion =
      typeof parsed.followUpQuestion === "string"
        ? parsed.followUpQuestion.trim()
        : "";
    const coachingSummary =
      typeof parsed.coachingSummary === "string"
        ? parsed.coachingSummary.trim()
        : "";

    // 7. Sanitize voice analysis metrics
    const rawVA = parsed.voiceAnalysis || {};
    const voiceAnalysis: VoiceAnalysisResult = {
      speakingRate: {
        wpm: isTyped
          ? null
          : typeof rawVA.speakingRate?.wpm === "number"
          ? rawVA.speakingRate.wpm
          : telemetry.speakingRateWpm || null,
        assessment:
          rawVA.speakingRate?.assessment ||
          (isTyped ? "Typed Input" : "Moderate Pace"),
        feedback:
          rawVA.speakingRate?.feedback ||
          (isTyped
            ? "Voice pacing metrics apply when answering via microphone."
            : "Speaking pace was appropriate."),
      },
      pitchVariation: {
        varianceHz: isTyped
          ? null
          : typeof rawVA.pitchVariation?.varianceHz === "number"
          ? rawVA.pitchVariation.varianceHz
          : telemetry.pitchVarianceHz || null,
        assessment:
          rawVA.pitchVariation?.assessment ||
          (isTyped ? "N/A (Typed)" : "Natural Inflection"),
        feedback:
          rawVA.pitchVariation?.feedback ||
          "Voice pitch modulation recorded successfully.",
      },
      pausesAndHesitation: {
        pauseCount: isTyped
          ? null
          : typeof rawVA.pausesAndHesitation?.pauseCount === "number"
          ? rawVA.pausesAndHesitation.pauseCount
          : telemetry.pauseCount ?? 0,
        totalPauseSec: isTyped
          ? null
          : typeof rawVA.pausesAndHesitation?.totalPauseSec === "number"
          ? rawVA.pausesAndHesitation.totalPauseSec
          : telemetry.totalPauseSec ?? 0,
        assessment:
          rawVA.pausesAndHesitation?.assessment ||
          (isTyped ? "N/A" : "Controlled Pauses"),
        feedback:
          rawVA.pausesAndHesitation?.feedback ||
          "Pauses appeared natural during technical reasoning.",
      },
      loudnessVariation: {
        assessment:
          rawVA.loudnessVariation?.assessment ||
          (isTyped ? "N/A" : "Consistent Volume"),
        feedback:
          rawVA.loudnessVariation?.feedback ||
          "Vocal projection remained audible throughout the response.",
      },
      vocalClarity: {
        assessment:
          rawVA.vocalClarity?.assessment || (isTyped ? "Clear Text" : "High Clarity"),
        feedback:
          rawVA.vocalClarity?.feedback ||
          "Answer was articulated distinctly and intelligibly.",
      },
      fillerWords: {
        count: isTyped
          ? (telemetry.fillerCount ?? 0)
          : typeof rawVA.fillerWords?.count === "number"
          ? rawVA.fillerWords.count
          : telemetry.fillerCount ?? 0,
        detected: toStringArray(
          rawVA.fillerWords?.detected || telemetry.fillerWords
        ),
        assessment:
          rawVA.fillerWords?.assessment ||
          (telemetry.fillerCount === 0 ? "Minimal Fillers" : "Controlled Fillers"),
        feedback:
          rawVA.fillerWords?.feedback ||
          "Filler words were kept within reasonable limits.",
      },
      pacingFluency: {
        assessment: rawVA.pacingFluency?.assessment || "Fluid Delivery",
        feedback:
          rawVA.pacingFluency?.feedback ||
          "Maintained smooth progression across sentences.",
      },
      nervousnessIndicators: {
        observed: Boolean(rawVA.nervousnessIndicators?.observed),
        notes:
          rawVA.nervousnessIndicators?.notes ||
          "No adverse vocal trembling or extreme rush observed.",
        feedback:
          rawVA.nervousnessIndicators?.feedback ||
          "Candidate demonstrated calm, steady focus during evaluation.",
      },
    };

    const evaluation: FullEvaluationResult = {
      score,
      technical,
      relevance,
      reasoning,
      communication,
      confidence: communication, // derived assertiveness
      problemSolving: reasoning,
      structure,
      examples,
      aiFeedback:
        typeof parsed.aiFeedback === "string" && parsed.aiFeedback.trim()
          ? parsed.aiFeedback.trim()
          : coachingSummary || "Evaluation completed successfully.",
      strengths,
      improvements,
      keyPointsCovered,
      keyPointsMissed,
      keyPointsHit: keyPointsCovered,
      suggestedAnswer: modelAnswer,
      modelAnswer,
      followUpQuestion,
      coachingSummary,
      voiceAnalysis,
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
