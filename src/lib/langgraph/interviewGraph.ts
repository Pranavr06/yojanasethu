import { Annotation, StateGraph, START, END } from '@langchain/langgraph';
import { invokeGeminiStructured, invokeGeminiText } from './geminiClient';
import { dbGetFullStudent, dbGetStudentResumes, dbGetStudentUploadedResume } from '@/lib/db';
import { TRACK_QUESTIONS, QuestionTemplate } from '@/components/student/MockInterviewAssistant';
import {
  AcousticTelemetry,
  VoiceAnalysisResult,
  FullEvaluationResult,
} from '@/app/api/interview/evaluate/route';

export interface StarModelAnswer {
  question: string;
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface FinalInterviewReport {
  overallScore: number;
  readinessVerdict: 'Placement Ready' | 'Near Ready (1-2 Weeks Revision)' | 'Needs Structured Foundation';
  hiringRecommendation: 'Strong Hire' | 'Hire' | 'Borderline / Needs Practice' | 'Do Not Hire Yet';
  radarCompetencies: {
    technicalAccuracy: number;
    communicationClarity: number;
    problemSolving: number;
    architecturalThinking: number;
    deliveryAndConfidence: number;
  };
  categoryBreakdown?: {
    introductoryHrScore: number;
    technicalRoleScore: number;
    problemSolvingScore: number;
  };
  acousticSummary?: {
    avgWpm: number;
    totalPauses: number;
    totalFillers: number;
    pitchModulation: string;
  };
  keyStrengths: string[];
  criticalGaps: string[];
  starModelAnswers?: StarModelAnswer[];
  sevenDayActionPlan: Array<{ day: number; focus: string; task: string; inAppDestination: string }>;
  aiExecutiveSummary: string;
}

export interface QuestionEvaluationItem extends FullEvaluationResult {
  questionId: string;
  question: string;
  userAnswer: string;
  difficulty?: string;
  category?: string;
}

/**
 * LangGraph State Definition for Mock Interview Workflow
 */
export const InterviewStateAnnotation = Annotation.Root({
  studentId: Annotation<string>({
    reducer: (curr, next) => next ?? curr,
    default: () => '',
  }),
  role: Annotation<string>({
    reducer: (curr, next) => next ?? curr,
    default: () => 'Software Development Engineer',
  }),
  track: Annotation<string>({
    reducer: (curr, next) => next ?? curr,
    default: () => 'fullstack',
  }),
  studentContext: Annotation<{
    fullName?: string;
    usn?: string;
    skills?: string[];
    projects?: Array<{ title: string; description: string }>;
    experience?: string[];
    cgpa?: number;
  }>({
    reducer: (curr, next) => ({ ...curr, ...next }),
    default: () => ({}),
  }),
  difficulty: Annotation<'entry' | 'intermediate' | 'senior'>({
    reducer: (curr, next) => next ?? curr,
    default: () => 'intermediate',
  }),
  questionIndex: Annotation<number>({
    reducer: (curr, next) => (next !== undefined ? next : curr),
    default: () => 0,
  }),
  maxQuestions: Annotation<number>({
    reducer: (curr, next) => next ?? curr,
    default: () => 4,
  }),
  questionHistory: Annotation<QuestionTemplate[]>({
    reducer: (curr, next) => (next ? [...curr, ...next] : curr),
    default: () => [],
  }),
  currentQuestion: Annotation<QuestionTemplate | null>({
    reducer: (curr, next) => (next !== undefined ? next : curr),
    default: () => null,
  }),
  currentAnswer: Annotation<string>({
    reducer: (curr, next) => next ?? curr,
    default: () => '',
  }),
  acousticTelemetry: Annotation<AcousticTelemetry>({
    reducer: (curr, next) => ({ ...curr, ...next }),
    default: () => ({}),
  }),
  audioBase64: Annotation<string | undefined>({
    reducer: (curr, next) => next ?? curr,
    default: () => undefined,
  }),
  audioMimeType: Annotation<string | undefined>({
    reducer: (curr, next) => next ?? curr,
    default: () => undefined,
  }),
  evaluations: Annotation<QuestionEvaluationItem[]>({
    reducer: (curr, next) => (next ? [...curr, ...next] : curr),
    default: () => [],
  }),
  lastEvaluation: Annotation<QuestionEvaluationItem | null>({
    reducer: (curr, next) => (next !== undefined ? next : curr),
    default: () => null,
  }),
  adaptiveNextAction: Annotation<
    'ask_follow_up' | 'step_up_difficulty' | 'step_down_difficulty' | 'next_domain' | 'complete_session'
  >({
    reducer: (curr, next) => next ?? curr,
    default: () => 'next_domain',
  }),
  followUpQuestion: Annotation<string | null>({
    reducer: (curr, next) => (next !== undefined ? next : curr),
    default: () => null,
  }),
  finalReport: Annotation<FinalInterviewReport | null>({
    reducer: (curr, next) => (next !== undefined ? next : curr),
    default: () => null,
  }),
  actionIntent: Annotation<'generate_question' | 'evaluate_answer' | 'compile_report' | 'full_pipeline'>({
    reducer: (curr, next) => next ?? curr,
    default: () => 'evaluate_answer',
  }),
});

export type InterviewWorkflowState = typeof InterviewStateAnnotation.State;

// ==========================================
// NODE 1: Retrieve Authorized Student Context
// ==========================================
export async function retrieveStudentContextNode(
  state: InterviewWorkflowState
): Promise<Partial<InterviewWorkflowState>> {
  if (!state.studentId) {
    return {
      studentContext: {
        fullName: 'Candidate',
        skills: ['JavaScript', 'TypeScript', 'Data Structures', 'SQL', 'Algorithms'],
      },
    };
  }

  try {
    const [fullStudent, resumes] = await Promise.all([
      dbGetFullStudent(state.studentId),
      dbGetStudentResumes(state.studentId),
    ]);

    const skills = new Set<string>();
    const projects: Array<{ title: string; description: string }> = [];

    // Extract skills from authentic student profile skills
    if (fullStudent?.skills) {
      fullStudent.skills.forEach((s) => s.skill_name && skills.add(s.skill_name));
    }

    // Extract projects & skills from saved resumes
    if (resumes && resumes.length > 0) {
      const activeResume = resumes[0];
      const resumeData = activeResume.resume_data;
      if (resumeData?.skills) {
        const sk = resumeData.skills;
        [
          ...(sk.languages || []),
          ...(sk.frameworks || []),
          ...(sk.toolsAndCloud || []),
          ...(sk.coreCompetencies || []),
        ].forEach((name) => name && skills.add(name));
      }
      if (resumeData?.projects) {
        resumeData.projects.forEach((p: any) => {
          if (p?.title) {
            projects.push({
              title: p.title,
              description: p.description || (p.technologies ? `Built with ${p.technologies.join(', ')}` : ''),
            });
          }
        });
      }
      if (activeResume.analysis_result?.strengths) {
        activeResume.analysis_result.strengths.forEach((st: string) => skills.add(st));
      }
    }

    const latestCgpa = fullStudent?.academic_record?.cgpa;

    return {
      studentContext: {
        fullName: fullStudent?.profile?.full_name || 'Candidate',
        usn: fullStudent?.profile?.usn || undefined,
        cgpa: latestCgpa || undefined,
        skills: Array.from(skills),
        projects: projects.slice(0, 3),
      },
    };
  } catch (err) {
    console.warn('[InterviewGraph] retrieveStudentContextNode fallback:', err);
    return {
      studentContext: {
        fullName: 'Candidate',
        skills: ['Data Structures', 'System Design', 'Algorithms'],
      },
    };
  }
}

// ==========================================
// NODE 2: Generate Contextual Question (Multi-Phase)
// ==========================================
export async function generateQuestionNode(
  state: InterviewWorkflowState
): Promise<Partial<InterviewWorkflowState>> {
  // If we already have an active question and the action is evaluation, pass through
  if (state.currentQuestion && state.actionIntent === 'evaluate_answer') {
    return {};
  }

  const trackKey = (state.track || 'fullstack') as keyof typeof TRACK_QUESTIONS;
  const trackInfo = TRACK_QUESTIONS[trackKey] || TRACK_QUESTIONS.fullstack;
  const candidateName = state.studentContext?.fullName || 'Candidate';
  const candidateSkills = (state.studentContext?.skills || []).slice(0, 8).join(', ');
  const candidateProjects = (state.studentContext?.projects || [])
    .map((p) => `${p.title}: ${p.description}`)
    .join('; ');
  const previousAnswer = state.currentAnswer ? state.currentAnswer.trim() : '';

  let prompt = '';
  let defaultFallback: QuestionTemplate;

  if (state.questionIndex === 0) {
    // -------------------------------------------------------------
    // PHASE 1: Natural Warm-Up & Introductory HR Opening Greeting
    // -------------------------------------------------------------
    prompt = `You are a Principal Engineering Interviewer and Talent Lead conducting a campus placement interview for the role of ${state.role} (${trackInfo.title}).
This is Question 1 of ${state.maxQuestions} (The Opening Introduction).
Candidate Name: ${candidateName}
Verified Academic Skills: ${candidateSkills || 'Full-Stack Development, Computer Science Fundamentals'}

Generate a warm, professional, and conversational opening question.
Requirements:
1. Warmly greet the candidate (e.g. "Hello! Welcome to your mock interview for the ${state.role} position.").
2. Ask them to introduce themselves, share why they chose their engineering branch, and highlight what technical areas or engineering challenges excite them most.
3. Keep the tone encouraging, authentic, and natural for a senior interviewer.

Produce JSON matching:
- "question": The exact spoken opening question.
- "category": "behavioral"
- "hint": A supportive guidance tip for how to structure a great 60-90 second technical elevator pitch.
- "sampleDemoAnswer": An exemplary self-introduction highlighting academic branch, passion for engineering, and target impact.
- "keyPoints": 4 key aspects to assess (e.g. ['Clear self-introduction and branch', 'Core engineering passion & motivations', 'Communication articulateness and pacing', 'Alignment with target engineering role']).`;

    defaultFallback = {
      id: `gen-intro-${Date.now()}`,
      question: `Hello! Welcome to your mock interview for the ${state.role} position. Let's begin with a brief introduction. Could you tell me your name, your engineering background, and what areas of technology interest you most?`,
      category: 'behavioral',
      hint: 'Share your background, branch of study, technical areas you are passionate about, and what drives you as an engineer.',
      sampleDemoAnswer: `Hello! My name is ${candidateName !== 'Candidate' ? candidateName : 'Alex'}, and I am a final-year engineering student majoring in Computer Science. Over my academic journey, I discovered a strong interest in building reliable full-stack applications and distributed backend architectures. I enjoy taking complex algorithmic problems and turning them into efficient software systems, and I am excited about contributing to high-impact production engineering teams.`,
      keyPoints: [
        'Clear self-introduction and branch',
        'Core engineering passion and motivations',
        'Articulate verbal communication and pacing',
        'Alignment with target engineering role',
      ],
    };
  } else if (state.questionIndex === 1) {
    // -------------------------------------------------------------
    // PHASE 2: Practical Project & STAR Problem Solving Deep-Dive
    // -------------------------------------------------------------
    prompt = `You are a Principal Engineering Interviewer conducting a campus placement technical interview for ${state.role}.
This is Question 2 of ${state.maxQuestions} (Project & Practical Problem Solving).
Candidate: ${candidateName}
Portfolio Projects: ${candidateProjects || 'Campus Placement Management System, Real-Time Distributed Queue, Web Application'}
Skills: ${candidateSkills || 'React, Node.js, TypeScript, PostgreSQL, System Design'}
Previous Response / Intro from Candidate:
"""
${previousAnswer || 'Candidate introduced their background and passion for software engineering.'}
"""

Generate a natural follow-up question diving into a practical project they have engineered.
Requirements:
1. Conversationally acknowledge their introduction (e.g., "Thank you for that introduction!" or referencing what they shared).
2. Ask them to walk you through a technical project from their portfolio or experience, focusing on:
   - What architectural problem it solved
   - A critical technical roadblock or performance bottleneck they ran into
   - How they resolved it and what measurable outcome was achieved (STAR approach).
3. The question must feel like a natural conversation bridge, not an isolated textbook prompt.

Produce JSON with:
- "question": Spoken follow-up question.
- "category": "problem_solving"
- "hint": Guidance on using the STAR method (Situation, Task, Action, Result).
- "sampleDemoAnswer": Concrete, exemplary project explanation with numbers and architecture trade-offs.
- "keyPoints": 4 key criteria to assess.`;

    defaultFallback = {
      id: `gen-project-${Date.now()}`,
      question: `Thank you for sharing your background! Let's dive into your practical engineering experience. Could you walk me through a technical project you built that you are most proud of? What architectural problem were you solving, what major technical roadblock did you encounter, and how did you resolve it?`,
      category: 'problem_solving',
      hint: 'Structure your response using the STAR method: Situation, Task, Action, and Measurable Result.',
      sampleDemoAnswer: `In my campus placement portal project, I designed the backend to support concurrent test submissions for over 500 simultaneous users. During load testing, synchronous database writes caused connection pool exhaustion and spikes in request latency. I resolved this by introducing an asynchronous Redis queue with worker pools to batch database insertions, reducing median API response times from 1.6 seconds to under 75 milliseconds while guaranteeing zero data loss.`,
      keyPoints: [
        'Clear problem statement and project context',
        'Architectural decisions and tech stack rationale',
        'Specific technical roadblock or bottleneck overcome',
        'Measurable result or engineering trade-off demonstrated',
      ],
    };
  } else {
    // -------------------------------------------------------------
    // PHASE 3+: Core Technical Depth, Architecture & Concurrency Trade-Offs
    // -------------------------------------------------------------
    const fallbackQuestions = trackInfo.questions || [];
    const fallbackIndex = state.questionIndex % fallbackQuestions.length;
    defaultFallback = fallbackQuestions[fallbackIndex] || {
      id: `gen-tech-${Date.now()}`,
      question: 'Explain how you approach optimizing database query latency in high-concurrency systems.',
      category: 'technical',
      hint: 'Mention indexing, query plans, connection pools, and caching layers.',
      sampleDemoAnswer:
        'I start with EXPLAIN ANALYZE to identify sequential scans and missing indexes. I ensure connection pooling via PgBouncer and introduce Redis caching for hot read paths.',
      keyPoints: ['EXPLAIN ANALYZE', 'B-tree vs Hash indexes', 'Connection pooling', 'Read caching trade-offs'],
    };

    prompt = `You are a Principal Engineering Interviewer conducting a campus placement technical interview for ${state.role} in track "${trackInfo.title}".
This is Question ${state.questionIndex + 1} of ${state.maxQuestions} (Core Technical Depth & Architecture).
Difficulty: ${state.difficulty}
Candidate Skills: ${candidateSkills || 'Data Structures, REST APIs, Databases, Concurrency'}
Previous Response from Candidate:
"""
${previousAnswer ? previousAnswer.slice(0, 600) : 'Technical discussion in progress.'}
"""
Previously Asked Questions:
${state.questionHistory.map((q, idx) => `  ${idx + 1}. ${q.question}`).join('\n') || '  (Prior questions recorded)'}

Generate a challenging, highly realistic technical or architecture question.
Requirements:
1. Bridge naturally from their previous response if appropriate.
2. Focus on core mechanics, concurrency, performance trade-offs, or system edge cases matching difficulty "${state.difficulty}".
3. Formulate the question in direct spoken interviewer dialogue.

Produce JSON with:
- "question": Spoken technical question.
- "category": "technical" or "architecture"
- "hint": Guiding hint.
- "sampleDemoAnswer": Exemplary senior answer explaining mechanics and trade-offs.
- "keyPoints": 4 core technical points to assess.`;
  }

  const response = await invokeGeminiStructured<any>({
    prompt,
    config: {
      temperature: 0.35,
      systemInstruction:
        'You are an expert technical interviewer for Tier 1 tech companies. Produce precise JSON matching the schema.',
    },
    schema: {
      type: 'OBJECT',
      properties: {
        question: { type: 'STRING' },
        category: { type: 'STRING', enum: ['technical', 'architecture', 'problem_solving', 'behavioral'] },
        hint: { type: 'STRING' },
        sampleDemoAnswer: { type: 'STRING' },
        keyPoints: {
          type: 'ARRAY',
          items: { type: 'STRING' },
        },
      },
      required: ['question', 'category', 'hint', 'sampleDemoAnswer', 'keyPoints'],
    },
    fallbackValue: defaultFallback,
  });

  const generated = response.data || defaultFallback;
  const formattedQuestion: QuestionTemplate = {
    id: `gen-${Date.now()}-${state.questionIndex}`,
    question: generated.question || defaultFallback.question,
    category: (generated.category as any) || defaultFallback.category || 'technical',
    hint: generated.hint || defaultFallback.hint,
    sampleDemoAnswer: generated.sampleDemoAnswer || defaultFallback.sampleDemoAnswer,
    keyPoints: Array.isArray(generated.keyPoints) && generated.keyPoints.length > 0
      ? generated.keyPoints
      : defaultFallback.keyPoints,
  };

  return {
    currentQuestion: formattedQuestion,
    questionHistory: [formattedQuestion],
  };
}

// ==========================================
// NODE 3: Evaluate Candidate Answer
// ==========================================
export async function evaluateAnswerNode(
  state: InterviewWorkflowState
): Promise<Partial<InterviewWorkflowState>> {
  const currentQ = state.currentQuestion;
  const answer = state.currentAnswer || '';
  const telemetry = state.acousticTelemetry || {};
  const isTyped = Boolean(telemetry.isTypedAnswer);

  if (!currentQ) {
    throw new Error('[InterviewGraph] evaluateAnswerNode requires a valid currentQuestion in state.');
  }

  const prompt = `You are a strict, senior engineering interviewer and speech communication coach evaluating a candidate for a technical campus placement role.

Target Role: ${state.role}
Track: ${state.track}
Interview Question: ${currentQ.question}
Question Category: ${currentQ.category}
Expected Key Points to Assess:
${currentQ.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Candidate's Submitted Answer Transcript:
"""
${answer.trim().slice(0, 8000) || 'No verbal answer was provided.'}
"""

${
  isTyped
    ? `Submission Mode: Typed Answer (Acoustic audio telemetry not recorded; evaluate delivery metrics as typed-communication clarity without inventing vocal pitch or WPM).`
    : `Observable Acoustic Telemetry (from candidate's microphone recording):
- Speaking Rate: ${telemetry.speakingRateWpm ? `${telemetry.speakingRateWpm} WPM` : 'Estimated from duration'}
- Total Duration: ${telemetry.durationSec ? `${telemetry.durationSec.toFixed(1)} seconds` : 'N/A'}
- Pause Count: ${telemetry.pauseCount ?? 0} pauses (Total pause duration: ${telemetry.totalPauseSec ? `${telemetry.totalPauseSec.toFixed(1)}s` : '0s'})
- Pitch Modulation: ${telemetry.pitchVarianceHz ? `Standard deviation of ${telemetry.pitchVarianceHz} Hz around mean ${telemetry.meanPitchHz || 150} Hz` : 'Natural range'}
- Loudness Variation: ${telemetry.loudnessVariationDb ? `${telemetry.loudnessVariationDb} dB spread` : 'Stable'}
- Filler Words Detected: ${telemetry.fillerCount ?? 0} (${(telemetry.fillerWords || []).join(', ') || 'none'})`
}

SCORING BENCHMARK (0-100 on each dimension):
- 0-15: Refuses to answer, off-topic gibberish, or empty transcript.
- 16-45: Minimal or largely inaccurate response; misses key technical mechanisms and trade-offs.
- 46-70: Partially correct; understands foundational concept but lacks depth, examples, or precision.
- 71-89: Solid, technically accurate answer covering key concepts clearly with good reasoning.
- 90-100: Comprehensive mastery; deep technical accuracy, trade-off analysis, edge cases, and concrete examples.

CRITICAL INSTRUCTIONS:
1. Clearly distinguish TECHNICAL ANSWER QUALITY from VOCAL DELIVERY.
2. Compare the answer against the Expected Key Points. Categorize which points were covered vs missed.
3. Voice modulation and delivery analysis: interpret objectively; do not psychoanalyze.
4. Provide constructive feedback, highlighted strengths, actionable areas to improve, a model answer, and a relevant follow-up question.`;

  // Deterministic fallback evaluation if API call fails
  const fallbackResult: FullEvaluationResult = {
    score: answer.trim().length > 20 ? 65 : 10,
    technical: answer.trim().length > 20 ? 60 : 10,
    communication: isTyped ? 70 : 65,
    confidence: 65,
    problemSolving: 60,
    relevance: 65,
    reasoning: 60,
    structure: 60,
    examples: 50,
    aiFeedback:
      answer.trim().length > 20
        ? 'Your answer addressed fundamental concepts. Focus on elaborating trade-offs and concrete production examples.'
        : 'No comprehensive answer was detected. Review core technical points.',
    strengths: ['Identified main concept', 'Direct communication'],
    improvements: ['Discuss architectural trade-offs', 'Reference concrete failure modes'],
    keyPointsCovered: currentQ.keyPoints.slice(0, 1),
    keyPointsMissed: currentQ.keyPoints.slice(1),
    keyPointsHit: currentQ.keyPoints.slice(0, 1),
    suggestedAnswer: currentQ.sampleDemoAnswer,
    modelAnswer: currentQ.sampleDemoAnswer,
    followUpQuestion: 'How would you scale this approach if write traffic increased 10x?',
    coachingSummary: 'Solid baseline. Deepen system-level reasoning for higher tier interviews.',
    voiceAnalysis: {
      speakingRate: {
        wpm: telemetry.speakingRateWpm || null,
        assessment: telemetry.speakingRateWpm ? (telemetry.speakingRateWpm >= 120 && telemetry.speakingRateWpm <= 160 ? 'Optimal' : 'Slightly off-pace') : 'Not applicable (typed)',
        feedback: 'Maintain steady pace between 130-150 words per minute.',
      },
      pitchVariation: {
        varianceHz: telemetry.pitchVarianceHz || null,
        assessment: 'Natural range',
        feedback: 'Vary inflection when highlighting architectural choices.',
      },
      pausesAndHesitation: {
        pauseCount: telemetry.pauseCount || 0,
        totalPauseSec: telemetry.totalPauseSec || 0,
        assessment: 'Measured',
        feedback: 'Short pauses before answering show thoughtful structuring.',
      },
      loudnessVariation: {
        assessment: 'Consistent',
        feedback: 'Volume was clear and stable.',
      },
      vocalClarity: {
        assessment: 'Clear',
        feedback: 'Terminology articulated intelligibly.',
      },
      fillerWords: {
        count: telemetry.fillerCount || 0,
        detected: telemetry.fillerWords || [],
        assessment: (telemetry.fillerCount || 0) < 3 ? 'Clean' : 'Needs attention',
        feedback: 'Minimize fillers like "um" and "like" during conceptual pivots.',
      },
      pacingFluency: {
        assessment: 'Cohesive',
        feedback: 'Sentence flow remained logical.',
      },
      nervousnessIndicators: {
        observed: false,
        notes: 'Calm composure throughout answer.',
        feedback: 'Good presence.',
      },
    },
  };

  const response = await invokeGeminiStructured<any>({
    prompt,
    audioBase64: state.audioBase64,
    audioMimeType: state.audioMimeType,
    config: {
      temperature: 0.2,
      maxOutputTokens: 2048,
    },
    schema: {
      type: 'OBJECT',
      properties: {
        overallScore: { type: 'INTEGER' },
        technicalScore: { type: 'INTEGER' },
        relevanceScore: { type: 'INTEGER' },
        reasoningScore: { type: 'INTEGER' },
        communicationScore: { type: 'INTEGER' },
        rubric: {
          type: 'OBJECT',
          properties: {
            technical: { type: 'INTEGER' },
            relevance: { type: 'INTEGER' },
            reasoning: { type: 'INTEGER' },
            communication: { type: 'INTEGER' },
            structure: { type: 'INTEGER' },
            examples: { type: 'INTEGER' },
          },
          required: ['technical', 'relevance', 'reasoning', 'communication', 'structure', 'examples'],
        },
        aiFeedback: { type: 'STRING' },
        strengths: { type: 'ARRAY', items: { type: 'STRING' } },
        improvements: { type: 'ARRAY', items: { type: 'STRING' } },
        keyPointsCovered: { type: 'ARRAY', items: { type: 'STRING' } },
        keyPointsMissed: { type: 'ARRAY', items: { type: 'STRING' } },
        suggestedAnswer: { type: 'STRING' },
        followUpQuestion: { type: 'STRING' },
        coachingSummary: { type: 'STRING' },
      },
      required: ['overallScore', 'technicalScore', 'aiFeedback', 'strengths', 'improvements', 'suggestedAnswer'],
    },
    fallbackValue: fallbackResult,
  });

  const raw = response.data || fallbackResult;
  const finalEval: QuestionEvaluationItem = {
    questionId: currentQ.id,
    question: currentQ.question,
    userAnswer: answer,
    difficulty: state.difficulty,
    category: currentQ.category,
    score: raw.overallScore ?? raw.score ?? fallbackResult.score,
    technical: raw.technicalScore ?? raw.rubric?.technical ?? fallbackResult.technical,
    communication: raw.communicationScore ?? raw.rubric?.communication ?? fallbackResult.communication,
    confidence: raw.confidence ?? 70,
    problemSolving: raw.reasoningScore ?? raw.rubric?.reasoning ?? fallbackResult.problemSolving,
    relevance: raw.relevanceScore ?? raw.rubric?.relevance ?? fallbackResult.relevance,
    reasoning: raw.reasoningScore ?? raw.rubric?.reasoning ?? fallbackResult.reasoning,
    structure: raw.rubric?.structure ?? fallbackResult.structure,
    examples: raw.rubric?.examples ?? fallbackResult.examples,
    aiFeedback: raw.aiFeedback || fallbackResult.aiFeedback,
    strengths: Array.isArray(raw.strengths) && raw.strengths.length > 0 ? raw.strengths : fallbackResult.strengths,
    improvements: Array.isArray(raw.improvements) && raw.improvements.length > 0 ? raw.improvements : fallbackResult.improvements,
    keyPointsCovered: Array.isArray(raw.keyPointsCovered) ? raw.keyPointsCovered : fallbackResult.keyPointsCovered,
    keyPointsMissed: Array.isArray(raw.keyPointsMissed) ? raw.keyPointsMissed : fallbackResult.keyPointsMissed,
    keyPointsHit: Array.isArray(raw.keyPointsCovered) ? raw.keyPointsCovered : fallbackResult.keyPointsHit,
    suggestedAnswer: raw.suggestedAnswer || fallbackResult.suggestedAnswer,
    modelAnswer: raw.suggestedAnswer || fallbackResult.modelAnswer,
    followUpQuestion: raw.followUpQuestion || fallbackResult.followUpQuestion,
    coachingSummary: raw.coachingSummary || fallbackResult.coachingSummary,
    voiceAnalysis: raw.voiceAnalysis || fallbackResult.voiceAnalysis,
  };

  return {
    lastEvaluation: finalEval,
    evaluations: [finalEval],
    followUpQuestion: finalEval.followUpQuestion,
  };
}

// ==========================================
// NODE 4: Adaptive Progression Router
// ==========================================
export async function adaptiveProgressionNode(
  state: InterviewWorkflowState
): Promise<Partial<InterviewWorkflowState>> {
  const lastEval = state.lastEvaluation;
  const currentIdx = state.questionIndex;
  const maxQ = state.maxQuestions;

  // If this was the last question or final action requested
  if (currentIdx + 1 >= maxQ || state.actionIntent === 'compile_report') {
    return {
      adaptiveNextAction: 'complete_session',
    };
  }

  // Adaptive difficulty logic
  let nextDifficulty: 'entry' | 'intermediate' | 'senior' = state.difficulty;
  let nextAction: 'ask_follow_up' | 'step_up_difficulty' | 'step_down_difficulty' | 'next_domain' = 'next_domain';

  if (lastEval) {
    if (lastEval.technical >= 85 && state.difficulty !== 'senior') {
      nextDifficulty = state.difficulty === 'entry' ? 'intermediate' : 'senior';
      nextAction = 'step_up_difficulty';
    } else if (lastEval.technical <= 45 && state.difficulty !== 'entry') {
      nextDifficulty = state.difficulty === 'senior' ? 'intermediate' : 'entry';
      nextAction = 'step_down_difficulty';
    } else if (lastEval.keyPointsMissed && lastEval.keyPointsMissed.length >= 2) {
      nextAction = 'ask_follow_up';
    } else {
      nextAction = 'next_domain';
    }
  }

  return {
    difficulty: nextDifficulty,
    adaptiveNextAction: nextAction,
    questionIndex: currentIdx + 1,
  };
}

// ==========================================
// NODE 5: Final Comprehensive Report Synthesizer
// ==========================================
export async function finalReportGeneratorNode(
  state: InterviewWorkflowState
): Promise<Partial<InterviewWorkflowState>> {
  const evals = state.evaluations;

  if (evals.length === 0) {
    return {
      finalReport: {
        overallScore: 0,
        readinessVerdict: 'Needs Structured Foundation',
        hiringRecommendation: 'Do Not Hire Yet',
        radarCompetencies: {
          technicalAccuracy: 0,
          communicationClarity: 0,
          problemSolving: 0,
          architecturalThinking: 0,
          deliveryAndConfidence: 0,
        },
        categoryBreakdown: {
          introductoryHrScore: 0,
          technicalRoleScore: 0,
          problemSolvingScore: 0,
        },
        keyStrengths: [],
        criticalGaps: ['Complete full interview session to obtain performance analysis.'],
        starModelAnswers: [],
        sevenDayActionPlan: [],
        aiExecutiveSummary: 'No interview answers recorded.',
      },
    };
  }

  // Calculate aggregates
  const avg = (fn: (e: QuestionEvaluationItem) => number) =>
    Math.round(evals.reduce((acc, e) => acc + (fn(e) || 0), 0) / evals.length);

  const technicalAccuracy = avg((e) => e.technical);
  const communicationClarity = avg((e) => e.communication);
  const problemSolving = avg((e) => e.problemSolving);
  const architecturalThinking = avg((e) => e.structure);
  const deliveryAndConfidence = avg((e) => e.confidence);
  const relevanceAvg = avg((e) => e.relevance || 65);

  // Documented Transparent Weighted Scoring:
  // 40% Technical + 25% Problem Solving + 20% Communication + 15% Relevance
  const overallScore = Math.round(
    0.4 * technicalAccuracy +
    0.25 * problemSolving +
    0.2 * communicationClarity +
    0.15 * relevanceAvg
  );

  let readinessVerdict: 'Placement Ready' | 'Near Ready (1-2 Weeks Revision)' | 'Needs Structured Foundation';
  let hiringRecommendation: 'Strong Hire' | 'Hire' | 'Borderline / Needs Practice' | 'Do Not Hire Yet';

  if (overallScore >= 85) {
    readinessVerdict = 'Placement Ready';
    hiringRecommendation = overallScore >= 92 ? 'Strong Hire' : 'Hire';
  } else if (overallScore >= 65) {
    readinessVerdict = 'Near Ready (1-2 Weeks Revision)';
    hiringRecommendation = 'Borderline / Needs Practice';
  } else {
    readinessVerdict = 'Needs Structured Foundation';
    hiringRecommendation = 'Do Not Hire Yet';
  }

  // Category breakdown: Introductory HR vs Technical vs Problem Solving
  const introEvals = evals.filter(
    (e) => e.category === 'behavioral' || e.questionId.includes('intro') || e.question.toLowerCase().includes('introduction')
  );
  const techEvals = evals.filter(
    (e) => e.category === 'technical' || e.category === 'architecture'
  );
  const psEvals = evals.filter(
    (e) => e.category === 'problem_solving' || e.questionId.includes('project')
  );

  const introductoryHrScore =
    introEvals.length > 0
      ? Math.round(introEvals.reduce((a, e) => a + e.communication, 0) / introEvals.length)
      : communicationClarity;

  const technicalRoleScore =
    techEvals.length > 0
      ? Math.round(techEvals.reduce((a, e) => a + e.technical, 0) / techEvals.length)
      : technicalAccuracy;

  const problemSolvingScore =
    psEvals.length > 0
      ? Math.round(psEvals.reduce((a, e) => a + e.problemSolving, 0) / psEvals.length)
      : problemSolving;

  // Acoustic summary across answers
  const wpmList: number[] = [];
  let totalPauses = 0;
  let totalFillers = 0;
  evals.forEach((e) => {
    if (e.voiceAnalysis?.speakingRate?.wpm) wpmList.push(e.voiceAnalysis.speakingRate.wpm);
    if (e.voiceAnalysis?.pausesAndHesitation?.pauseCount) totalPauses += e.voiceAnalysis.pausesAndHesitation.pauseCount;
    if (e.voiceAnalysis?.fillerWords?.count) totalFillers += e.voiceAnalysis.fillerWords.count;
  });

  const avgWpm = wpmList.length > 0 ? Math.round(wpmList.reduce((a, b) => a + b, 0) / wpmList.length) : 135;

  // Collect strengths and gaps
  const allStrengths = Array.from(new Set(evals.flatMap((e) => e.strengths || []))).slice(0, 4);
  const allGaps = Array.from(new Set(evals.flatMap((e) => e.improvements || []))).slice(0, 4);

  // STAR Model Answers for evaluated questions
  const starModelAnswers: StarModelAnswer[] = evals.map((e, idx) => {
    const keyAspects = (e.keyPointsCovered?.concat(e.keyPointsMissed || []) || []).slice(0, 3).join(', ');
    return {
      question: e.question,
      situation: `Technical assessment for ${state.role} regarding ${e.question.slice(0, 70)}...`,
      task: `Articulate core mechanics, address constraints (${keyAspects || 'system design, performance'}), and clarify trade-offs.`,
      action: e.modelAnswer || e.suggestedAnswer || 'Formulated modular architecture with optimal time and space complexity.',
      result: 'Delivered robust production reliability, deterministic latency, and clear engineering communication.',
    };
  });

  // Default 7-day action plan linked to actual routes
  const defaultActionPlan = [
    { day: 1, focus: 'Dynamic Programming & Memory Profiles', task: 'Solve 2 Medium DP problems on Kadane & Knapsack', inAppDestination: '/student/dsa-tracker?category=Dynamic%20Programming' },
    { day: 2, focus: 'System Architecture Trade-offs', task: 'Study caching invalidation strategies in Redis', inAppDestination: '/student/learn-programming' },
    { day: 3, focus: 'Database Indexes & Concurrency', task: 'Review B+ Trees vs LSM Trees transaction isolation', inAppDestination: '/student/learn-programming' },
    { day: 4, focus: 'Speech Pacing & Structure', task: 'Re-attempt 3 technical questions using STAR format', inAppDestination: '/student/mock-interview' },
    { day: 5, focus: 'Company Specific Coding Test', task: 'Solve Category 1 verified historical company problems', inAppDestination: '/student/dsa-tracker' },
    { day: 6, focus: 'Mock Interview Re-Assessment', task: 'Full 4-question AI Mock Interview session', inAppDestination: '/student/mock-interview' },
    { day: 7, focus: 'CGPA & Placement Criteria Review', task: 'Audit eligibility cutoffs for upcoming campus drives', inAppDestination: '/student/cgpa-calculator' },
  ];

  // Synthesize executive summary via Gemini
  const summaryPrompt = `Synthesize a concise, 2-3 sentence executive placement assessment for a candidate who just completed a campus technical interview for ${state.role}.
Scores: Overall: ${overallScore}/100, Technical: ${technicalAccuracy}, Communication: ${communicationClarity}, Problem Solving: ${problemSolving}.
Category Breakdown: HR & Intro: ${introductoryHrScore}/100, Technical Mechanisms: ${technicalRoleScore}/100, Problem Solving: ${problemSolvingScore}/100.
Strengths: ${allStrengths.join(', ')}
Gaps to remediate: ${allGaps.join(', ')}
Provide a professional hiring recommendation tone.`;

  const summaryRes = await invokeGeminiText({
    prompt: summaryPrompt,
    config: { temperature: 0.3 },
    fallbackText: `The candidate demonstrated strong foundational knowledge with an overall readiness score of ${overallScore}/100. Key strengths include ${allStrengths.slice(0, 2).join(' and ')}. Focus on reinforcing trade-off analysis and architectural depth before campus drive assessments.`,
  });

  const finalReport: FinalInterviewReport = {
    overallScore,
    readinessVerdict,
    hiringRecommendation,
    radarCompetencies: {
      technicalAccuracy,
      communicationClarity,
      problemSolving,
      architecturalThinking,
      deliveryAndConfidence,
    },
    categoryBreakdown: {
      introductoryHrScore,
      technicalRoleScore,
      problemSolvingScore,
    },
    acousticSummary: {
      avgWpm,
      totalPauses,
      totalFillers,
      pitchModulation: 'Natural dynamic inflection',
    },
    keyStrengths: allStrengths,
    criticalGaps: allGaps,
    starModelAnswers,
    sevenDayActionPlan: defaultActionPlan,
    aiExecutiveSummary: summaryRes.text || `The candidate demonstrated strong foundational knowledge with an overall readiness score of ${overallScore}/100. Key strengths include ${allStrengths.slice(0, 2).join(' and ') || 'clear technical communication'}.`,
  };

  return {
    finalReport,
  };
}

// ==========================================
// CONDITIONAL ROUTER
// ==========================================
function routeAction(state: InterviewWorkflowState) {
  if (state.actionIntent === 'generate_question') {
    return 'generateQuestionNode';
  }
  if (state.actionIntent === 'compile_report') {
    return 'finalReportGeneratorNode';
  }
  return 'evaluateAnswerNode';
}

function routeAfterEvaluation(state: InterviewWorkflowState) {
  if (state.adaptiveNextAction === 'complete_session' || state.actionIntent === 'full_pipeline') {
    return 'finalReportGeneratorNode';
  }
  return END;
}

// ==========================================
// COMPILE LANGGRAPH WORKFLOW
// ==========================================
export const interviewGraph = new StateGraph(InterviewStateAnnotation)
  .addNode('retrieveStudentContextNode', retrieveStudentContextNode)
  .addNode('generateQuestionNode', generateQuestionNode)
  .addNode('evaluateAnswerNode', evaluateAnswerNode)
  .addNode('adaptiveProgressionNode', adaptiveProgressionNode)
  .addNode('finalReportGeneratorNode', finalReportGeneratorNode)
  .addEdge(START, 'retrieveStudentContextNode')
  .addConditionalEdges('retrieveStudentContextNode', routeAction, {
    generateQuestionNode: 'generateQuestionNode',
    evaluateAnswerNode: 'evaluateAnswerNode',
    finalReportGeneratorNode: 'finalReportGeneratorNode',
  })
  .addEdge('generateQuestionNode', END)
  .addEdge('evaluateAnswerNode', 'adaptiveProgressionNode')
  .addConditionalEdges('adaptiveProgressionNode', routeAfterEvaluation, {
    finalReportGeneratorNode: 'finalReportGeneratorNode',
    [END]: END,
  })
  .addEdge('finalReportGeneratorNode', END)
  .compile();

// ==========================================
// EXPORTED EXECUTION HELPERS
// ==========================================

/**
 * Evaluates a single answer using the LangGraph Interview workflow.
 */
export async function executeLangGraphInterviewEvaluation(params: {
  studentId?: string;
  role: string;
  track?: string;
  question: QuestionTemplate;
  answer: string;
  telemetry?: AcousticTelemetry;
  audioBase64?: string;
  audioMimeType?: string;
  existingEvaluations?: QuestionEvaluationItem[];
  questionIndex?: number;
  maxQuestions?: number;
}): Promise<{
  evaluation: QuestionEvaluationItem;
  adaptiveNextAction: string;
  followUpQuestion: string | null;
  state: InterviewWorkflowState;
}> {
  const result = await interviewGraph.invoke({
    studentId: params.studentId || '',
    role: params.role,
    track: params.track || 'fullstack',
    currentQuestion: params.question,
    currentAnswer: params.answer,
    acousticTelemetry: params.telemetry || {},
    audioBase64: params.audioBase64,
    audioMimeType: params.audioMimeType,
    evaluations: params.existingEvaluations || [],
    questionIndex: params.questionIndex ?? 0,
    maxQuestions: params.maxQuestions ?? 4,
    actionIntent: 'evaluate_answer',
  });

  return {
    evaluation: result.lastEvaluation || result.evaluations[result.evaluations.length - 1],
    adaptiveNextAction: result.adaptiveNextAction,
    followUpQuestion: result.followUpQuestion,
    state: result,
  };
}

/**
 * Generates an adaptive question personalized to student profile and track.
 */
export async function executeLangGraphQuestionGeneration(params: {
  studentId?: string;
  role: string;
  track: string;
  questionIndex: number;
  maxQuestions?: number;
  difficulty?: 'entry' | 'intermediate' | 'senior';
  questionHistory?: QuestionTemplate[];
  lastAnswer?: string;
}): Promise<{
  question: QuestionTemplate;
  state: InterviewWorkflowState;
}> {
  const result = await interviewGraph.invoke({
    studentId: params.studentId || '',
    role: params.role,
    track: params.track,
    questionIndex: params.questionIndex,
    maxQuestions: params.maxQuestions ?? 4,
    difficulty: params.difficulty || 'intermediate',
    questionHistory: params.questionHistory || [],
    currentAnswer: params.lastAnswer || '',
    actionIntent: 'generate_question',
  });

  return {
    question: result.currentQuestion!,
    state: result,
  };
}

/**
 * Compiles a final placement readiness report from all collected evaluations.
 */
export async function executeLangGraphFinalReport(params: {
  studentId?: string;
  role: string;
  track: string;
  evaluations: QuestionEvaluationItem[];
}): Promise<FinalInterviewReport> {
  const result = await interviewGraph.invoke({
    studentId: params.studentId || '',
    role: params.role,
    track: params.track,
    evaluations: params.evaluations,
    actionIntent: 'compile_report',
  });

  return result.finalReport!;
}
