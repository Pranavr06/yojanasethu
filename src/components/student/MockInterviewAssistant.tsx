'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Bot,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  RotateCcw,
  Send,
  Play,
  ArrowRight,
  Clock,
  Award,
  Layers,
  ShieldCheck,
  ChevronRight,
  Code2,
  Briefcase,
  BrainCircuit,
  MessageSquare,
  HelpCircle,
  FileText,
  Download,
  Share2,
  RefreshCw,
  XCircle,
} from 'lucide-react';

export type InterviewTrack = 'fullstack' | 'aiml' | 'data' | 'behavioral';

export interface QuestionTemplate {
  id: string;
  question: string;
  category: 'technical' | 'architecture' | 'problem_solving' | 'behavioral';
  hint: string;
  sampleDemoAnswer: string;
  keyPoints: string[];
}

export interface QuestionEvaluation {
  questionId: string;
  question: string;
  userAnswer: string;
  score: number;
  aiFeedback: string;
  keyPointsCovered: string[];
  keyPointsMissed: string[];
  keyPointsHit: string[];
  strengths: string[];
  improvements: string[];
  suggestedAnswer?: string;
  rubric: {
    technical: number;
    communication: number;
    confidence: number;
    problemSolving: number;
  };
  durationMs?: number;
}

export const TRACK_QUESTIONS: Record<
  InterviewTrack,
  { title: string; desc: string; icon: any; questions: QuestionTemplate[] }
> = {
  fullstack: {
    title: 'Full-Stack Software Engineering',
    desc: 'System scalability, REST APIs, React state reconciliation, and database concurrency.',
    icon: Code2,
    questions: [
      {
        id: 'fs-1',
        question:
          'Explain the difference between optimistic locking and pessimistic locking in high-throughput databases. When would you choose one over the other?',
        category: 'technical',
        hint: 'Mention version columns, row-level locks, collision rates, and transaction overhead.',
        sampleDemoAnswer:
          'Pessimistic locking locks the database record upfront using SELECT FOR UPDATE, preventing other transactions from modifying it until completion. It is ideal for high-conflict scenarios with critical resources like ticket reservations. In contrast, optimistic locking assumes conflicts are rare, using a version timestamp column to verify no changes occurred before committing. It maximizes concurrency in read-heavy applications.',
        keyPoints: [
          'Row-level locking vs versioning',
          'Collision frequency trade-off',
          'Deadlock prevention',
          'Read-heavy vs write-heavy scenarios',
        ],
      },
      {
        id: 'fs-2',
        question:
          'How does React 18 Concurrent Mode and the Virtual DOM reconciliation algorithm prioritize state updates?',
        category: 'technical',
        hint: 'Discuss Fiber architecture, useTransition, lane-based scheduling, and hydration.',
        sampleDemoAnswer:
          'React Fiber enables incremental rendering by splitting render work into interruptible units called fibers. In React 18 Concurrent Mode, updates are assigned priorities using lanes. High-priority updates like urgent user input (typing/clicks) take precedence over non-urgent transitions wrapped in useTransition, ensuring the UI remains responsive without blocking the main thread.',
        keyPoints: [
          'Fiber tree structure',
          'Interruptible work units',
          'Priority lanes & useTransition',
          'Avoiding main thread jank',
        ],
      },
      {
        id: 'fs-3',
        question:
          'Design a distributed rate limiter for a public API gateway. How do you prevent race conditions across multiple instances?',
        category: 'architecture',
        hint: 'Mention Token Bucket, Redis sliding window, atomic Lua scripts, and memory footprints.',
        sampleDemoAnswer:
          'I would implement a sliding-window log or token-bucket algorithm backed by a Redis cluster. To eliminate race conditions across distributed gateway nodes, token deductions and timestamp checks should be executed atomically using Redis Lua scripts. This ensures multi-threaded or multi-instance requests do not overconsume tokens between the read and write operations.',
        keyPoints: [
          'Token bucket vs sliding window',
          'Atomic operations with Redis Lua',
          'Distributed synchronization',
          'Edge vs centralized enforcement',
        ],
      },
      {
        id: 'fs-4',
        question:
          'Tell me about a challenging bug or performance bottleneck you solved in a past web project. Walk me through your debugging methodology.',
        category: 'problem_solving',
        hint: 'Use the STAR format: Situation, Task, Action, Result. Quantify improvements.',
        sampleDemoAnswer:
          'In my full-stack semester project, page load times degraded to over 4 seconds on client portfolios. I profiled network waterfalls with Chrome DevTools and identified N+1 database queries on related skill endorsements. I refactored the backend to use joined eager-loading with database indexing on student foreign keys and added Redis query caching. This slashed latency to under 350ms, an 88% speedup.',
        keyPoints: [
          'STAR structure',
          'Profiling tools usage',
          'Root cause isolation (N+1 query)',
          'Quantified performance outcome',
        ],
      },
    ],
  },

  aiml: {
    title: 'AI & Machine Learning Engineer',
    desc: 'Deep learning foundations, Transformer self-attention, loss optimization, and LLM fine-tuning.',
    icon: BrainCircuit,
    questions: [
      {
        id: 'ai-1',
        question:
          'How does Scaled Dot-Product Attention in Transformer architectures prevent gradients from vanishing when embedding dimensions (d_k) grow large?',
        category: 'technical',
        hint: 'Explain softmax saturation, variance scaling by sqrt(d_k), and backpropagation dynamics.',
        sampleDemoAnswer:
          'For large vector dimensions d_k, the dot products Q*K grow large in magnitude, pushing the Softmax function into regions with near-zero gradients. Scaling by 1/sqrt(d_k) normalizes the dot product variance back to unit variance (assuming independent zero-mean components), ensuring gradients flow effectively during backpropagation.',
        keyPoints: [
          'Softmax gradient saturation',
          'Variance scaling by 1/sqrt(d_k)',
          'Dot product magnitude distribution',
          'Stabilizing backpropagation',
        ],
      },
      {
        id: 'ai-2',
        question:
          'What is the fundamental difference between LoRA (Low-Rank Adaptation) and full parameter fine-tuning for Large Language Models?',
        category: 'technical',
        hint: 'Discuss rank decomposition matrices, GPU VRAM constraints, frozen weights, and deployment speed.',
        sampleDemoAnswer:
          'Full fine-tuning updates all model weights, requiring massive VRAM to store optimizer states for billions of parameters. LoRA freezes the original pre-trained weight matrix W and injects trainable low-rank decomposition matrices A and B where delta W equals B times A. This reduces trainable parameters by up to 99%, dramatically cutting memory requirements while retaining near-identical task accuracy.',
        keyPoints: [
          'Decomposition matrices A & B',
          'Frozen base weights',
          'Memory and compute savings',
          'Serving efficiency with adapter swapping',
        ],
      },
      {
        id: 'ai-3',
        question:
          'How do you detect and mitigate data drift and concept drift in a machine learning model deployed to production?',
        category: 'architecture',
        hint: 'Mention statistical tests (KS-test, PSI), ground truth monitoring, and automated retraining pipelines.',
        sampleDemoAnswer:
          'I monitor input feature distributions using Population Stability Index (PSI) and Kolmogorov-Smirnov tests to detect data drift before performance decays. For concept drift, where the relationship between inputs and targets shifts, I track live classification metrics like F1-score against delayed ground truth. When thresholds trigger alerts, an automated CI/CD retraining pipeline kicks off with fresh windowed data.',
        keyPoints: [
          'Data drift vs concept drift',
          'PSI & Kolmogorov-Smirnov testing',
          'Ground-truth lag monitoring',
          'Automated retraining trigger',
        ],
      },
      {
        id: 'ai-4',
        question:
          'Describe an ML or data project where your model initially overfitted. What steps did you take to improve generalization?',
        category: 'problem_solving',
        hint: 'Mention regularizations, dropout, data augmentation, cross-validation, and validation curves.',
        sampleDemoAnswer:
          'When training a CNN for plant disease classification, training accuracy reached 98% while validation plateaued at 72%. I diagnosed severe overfitting from training data scarcity. I introduced CutMix and random rotation data augmentations, added spatial Dropout layers (0.3), and incorporated weight decay regularization with Early Stopping based on validation loss. Generalization jumped to 89% validation accuracy.',
        keyPoints: [
          'Diagnosis using train/val loss curves',
          'Data augmentation techniques',
          'Regularization (Dropout, Weight Decay)',
          'Validation metric improvement',
        ],
      },
    ],
  },

  data: {
    title: 'Data Analyst & Business Intelligence',
    desc: 'SQL window functions, cohort retention, ETL validation, and data-driven storytelling.',
    icon: BarChart3,
    questions: [
      {
        id: 'da-1',
        question:
          'Explain the difference between ROW_NUMBER(), RANK(), and DENSE_RANK() in SQL window functions with an example.',
        category: 'technical',
        hint: 'Focus on how ties are handled and whether gaps appear in consecutive ranking.',
        sampleDemoAnswer:
          'All three assign rankings ordered by a column. ROW_NUMBER assigns unique sequential integers regardless of ties. RANK assigns the same rank to identical values but skips subsequent numbers (e.g., 1, 2, 2, 4). DENSE_RANK also assigns identical ranks to ties but does NOT skip any numbers (e.g., 1, 2, 2, 3), making it best for top-N salary tiers.',
        keyPoints: [
          'Sequential numbering',
          'Handling duplicate ties',
          'Gap creation in RANK',
          'Deterministic ranking behavior',
        ],
      },
      {
        id: 'da-2',
        question:
          'How would you calculate 30-day user retention rates using SQL for a web application?',
        category: 'technical',
        hint: 'Discuss cohort acquisition date, self-joins or CTEs, date difference functions, and percentage rollups.',
        sampleDemoAnswer:
          'I construct a CTE identifying each user first active date (cohort month/week). Then I join subsequent activity events on user_id where activity_date falls between day 1 and day 30 from acquisition. Finally, I group by cohort and divide retained users by initial cohort size to get the retention percentage.',
        keyPoints: [
          'Cohort determination CTE',
          'Activity self-join',
          'Date difference math',
          'Cohort retention percentage calculation',
        ],
      },
      {
        id: 'da-3',
        question:
          'If executive stakeholders notice a 15% drop in weekly conversions, how do you conduct root cause analysis?',
        category: 'problem_solving',
        hint: 'Deconstruct metrics: traffic segmentation, device/browser slices, funnel drop-off, external factors.',
        sampleDemoAnswer:
          'First, I verify data telemetry integrity to rule out tracking bugs. Second, I segment the conversion funnel by dimension: device type, browser, geo-location, and marketing channel. If mobile Safari conversion plummeted while desktop stayed flat, I suspect an iOS release bug. I also compare seasonality and traffic quality before proposing corrective actions.',
        keyPoints: [
          'Instrumentation sanity check',
          'Funnel segmentation by device/channel',
          'External vs internal factor isolation',
          'Actionable recommendation generation',
        ],
      },
    ],
  },

  behavioral: {
    title: 'Campus Placement HR & Behavioral',
    desc: 'STAR communication technique, teamwork under pressure, conflict handling, and college leadership.',
    icon: Briefcase,
    questions: [
      {
        id: 'beh-1',
        question:
          'Tell me about yourself, your engineering journey at NMAMIT, and what makes you passionate about joining our engineering team.',
        category: 'behavioral',
        hint: 'Structure: Past (academics), Present (core projects & skills), Future (why this role/company).',
        sampleDemoAnswer:
          'I am a final-year engineering student at NMAMIT with a passion for building reliable software systems. Over the past three years, I have strengthened my fundamentals in Data Structures, SQL, and full-stack architecture, delivering proof-verified projects on YojanaSethu. What excites me about your team is your scale and engineering rigor, where I can apply my problem-solving skills to real-world customer impact.',
        keyPoints: [
          'Clear 2-minute elevator pitch',
          'Academic & technical highlight',
          'Alignment with corporate culture',
          'Forward-looking enthusiasm',
        ],
      },
      {
        id: 'beh-2',
        question:
          'Describe a situation where you had a serious disagreement with a team member during a hackathon or semester project. How did you resolve it?',
        category: 'behavioral',
        hint: 'Use STAR: focus on objective data, empathy, active listening, and common project goals.',
        sampleDemoAnswer:
          'During our 24-hour hackathon, my teammate and I disagreed on whether to use GraphQL or REST for our API layer. With 12 hours left, arguing was burning time. I suggested a 15-minute timebox to list our requirements: team familiarity, rapid prototyping, and deadline safety. We agreed REST was faster for our scope and delivered the demo on time, winning second place.',
        keyPoints: [
          'STAR format compliance',
          'De-escalation & objective prioritization',
          'Team goal focus',
          'Positive deliverable outcome',
        ],
      },
      {
        id: 'beh-3',
        question:
          'Tell me about a time you failed to meet an academic or project deadline. What did you learn and how did you prevent it from happening again?',
        category: 'behavioral',
        hint: 'Be honest, take accountability, and focus heavily on systemic prevention measures.',
        sampleDemoAnswer:
          'In my third semester, I underestimated the complexity of a compiler lab assignment and missed the preliminary submission deadline. Rather than making excuses, I scheduled a meeting with my mentor to explain the blocker and submitted a completed version 24 hours later. Since then, I adopted Agile sprint planning with milestone buffers, never missing a deadline throughout my final year.',
        keyPoints: [
          'Ownership and accountability',
          'No excuse mindset',
          'Proactive mentor communication',
          'Systemic habits adopted (Agile milestones)',
        ],
      },
    ],
  },
};

export default function MockInterviewAssistant() {
  const [selectedTrack, setSelectedTrack] = useState<InterviewTrack>('fullstack');
  const [sessionState, setSessionState] = useState<
    'idle' | 'in_progress' | 'feedback' | 'completed'
  >('idle');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(false);

  const [evaluations, setEvaluations] = useState<QuestionEvaluation[]>([]);

  // Speech and concurrency management refs
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const baseTextRef = useRef<string>('');
  const isSubmittingRef = useRef<boolean>(false);

  const activeQuestions = TRACK_QUESTIONS[selectedTrack].questions;
  const currentQuestion = activeQuestions[currentQuestionIdx];

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        setSpeechSupported(true);

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let accumulatedFinal = '';
          let currentInterim = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              accumulatedFinal += transcript;
            } else {
              currentInterim += transcript;
            }
          }

          // Append finalized words to baseTextRef
          if (accumulatedFinal) {
            const trimmedFinal = accumulatedFinal.trim();
            if (trimmedFinal) {
              baseTextRef.current = baseTextRef.current
                ? `${baseTextRef.current.trim()} ${trimmedFinal}`
                : trimmedFinal;
            }
          }

          // Live display combines base text with temporary interim words without mutating base text
          const interimTrimmed = currentInterim.trim();
          const liveText = interimTrimmed
            ? baseTextRef.current
              ? `${baseTextRef.current.trim()} ${interimTrimmed}`
              : interimTrimmed
            : baseTextRef.current;

          setUserAnswer(liveText);
        };

        recognition.onerror = (err: any) => {
          console.warn('Speech recognition warning:', err.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (sessionState === 'in_progress') {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionState]);

  // Voice synthesizer
  const speakText = (text: string) => {
    if (
      !voiceEnabled ||
      typeof window === 'undefined' ||
      !window.speechSynthesis
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();

    const naturalVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Samantha'))
    );

    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Toggle microphone with clean state management
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(
        'Speech recognition is not supported in this browser. You can type your answer directly in the box below!'
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      // Synchronize base text with current text so new speech appends cleanly
      baseTextRef.current = userAnswer.trim();

      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Could not start speech recognition:', error);
      }
    }
  };

  // Start interview session
  const startInterview = () => {
    setSessionState('in_progress');
    setCurrentQuestionIdx(0);
    setTimerSeconds(0);
    setUserAnswer('');
    baseTextRef.current = '';
    setEvaluations([]);
    setErrorMessage(null);

    const firstQuestion = TRACK_QUESTIONS[selectedTrack].questions[0];

    speakText(
      `Welcome to your mock interview for the ${TRACK_QUESTIONS[selectedTrack].title} track. Here is your first question: ${firstQuestion.question}`
    );
  };

  // Apply sample answer for quick demo evaluation
  const applySampleAnswer = () => {
    const demo = currentQuestion.sampleDemoAnswer;
    setUserAnswer(demo);
    baseTextRef.current = demo;
  };

  // Handle user manual textarea typing
  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setUserAnswer(newVal);
    baseTextRef.current = newVal;
  };

  // Handle clear answer
  const handleClearAnswer = () => {
    setUserAnswer('');
    baseTextRef.current = '';
  };

  // Submit answer and evaluate it using Gemini API
  const handleSubmitAnswer = async () => {
    // Concurrency guard: prevent multiple concurrent submissions
    if (isSubmittingRef.current || isEvaluating) return;

    const submittedAnswer = userAnswer.trim();

    if (!submittedAnswer) {
      setErrorMessage('Please speak or type your answer before submitting.');
      return;
    }

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      setIsListening(false);
    }

    stopSpeaking();
    setErrorMessage(null);
    isSubmittingRef.current = true;
    setIsEvaluating(true);

    try {
      const response = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: TRACK_QUESTIONS[selectedTrack].title,
          question: currentQuestion.question,
          answer: submittedAnswer,
          keyPoints: currentQuestion.keyPoints,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `Evaluation failed with status ${response.status}. Please retry.`
        );
      }

      const result = data?.evaluation;

      if (!result) {
        throw new Error(
          'Gemini returned an empty evaluation response. Please retry.'
        );
      }

      const clampNumber = (value: unknown, fallback = 0): number => {
        const num = Number(value);
        if (!Number.isFinite(num)) return fallback;
        return Math.max(0, Math.min(100, Math.round(num)));
      };

      const technical = clampNumber(result.technical);
      const communication = clampNumber(result.communication);
      const confidence = clampNumber(result.confidence);
      const problemSolving = clampNumber(result.problemSolving);

      const computedAverage = Math.round(
        (technical + communication + confidence + problemSolving) / 4
      );
      const score = clampNumber(result.score, computedAverage);

      const aiFeedback =
        typeof result.aiFeedback === 'string' && result.aiFeedback.trim()
          ? result.aiFeedback.trim()
          : 'Evaluation completed. Review your rubric dimensions and key points.';

      const toStringList = (arr: unknown): string[] => {
        if (!Array.isArray(arr)) return [];
        return arr.filter(
          (item: unknown): item is string =>
            typeof item === 'string' && item.trim().length > 0
        );
      };

      const keyPointsCovered = toStringList(
        result.keyPointsCovered || result.keyPointsHit
      );
      const keyPointsMissed = toStringList(result.keyPointsMissed);
      const strengths = toStringList(result.strengths);
      const improvements = toStringList(result.improvements);
      const suggestedAnswer =
        typeof result.suggestedAnswer === 'string' && result.suggestedAnswer.trim()
          ? result.suggestedAnswer.trim()
          : currentQuestion.sampleDemoAnswer;

      const evalResult: QuestionEvaluation = {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        userAnswer: submittedAnswer,
        score,
        aiFeedback,
        keyPointsCovered,
        keyPointsMissed,
        keyPointsHit: keyPointsCovered,
        strengths,
        improvements,
        suggestedAnswer,
        rubric: {
          technical,
          communication,
          confidence,
          problemSolving,
        },
        durationMs: data?.meta?.durationMs,
      };

      setEvaluations((prev) => [...prev, evalResult]);
      setSessionState('feedback');
      setErrorMessage(null);
      speakText(`Evaluation complete. Score: ${score} out of 100. ${aiFeedback}`);
    } catch (error: any) {
      console.error('Gemini interview evaluation error:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Could not connect to Gemini API. Please check your connection and retry.'
      );
    } finally {
      isSubmittingRef.current = false;
      setIsEvaluating(false);
    }
  };

  // Advance to the next question
  const handleNextQuestion = () => {
    stopSpeaking();
    setUserAnswer('');
    baseTextRef.current = '';
    setErrorMessage(null);

    if (currentQuestionIdx + 1 < activeQuestions.length) {
      const nextIdx = currentQuestionIdx + 1;
      setCurrentQuestionIdx(nextIdx);
      setSessionState('in_progress');

      const nextQuestion = activeQuestions[nextIdx];
      speakText(`Question ${nextIdx + 1}: ${nextQuestion.question}`);
    } else {
      setSessionState('completed');
      speakText(
        'Congratulations! You have completed the interview session. Here is your full placement evaluation scorecard.'
      );
    }
  };

  // Format seconds into MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // Overall aggregate scores calculated strictly from actual evaluations
  const avgOverall = evaluations.length
    ? Math.round(
        evaluations.reduce((acc, ev) => acc + ev.score, 0) / evaluations.length
      )
    : 0;

  const avgTech = evaluations.length
    ? Math.round(
        evaluations.reduce((acc, ev) => acc + ev.rubric.technical, 0) /
          evaluations.length
      )
    : 0;

  const avgComm = evaluations.length
    ? Math.round(
        evaluations.reduce((acc, ev) => acc + ev.rubric.communication, 0) /
          evaluations.length
      )
    : 0;

  const avgConf = evaluations.length
    ? Math.round(
        evaluations.reduce((acc, ev) => acc + ev.rubric.confidence, 0) /
          evaluations.length
      )
    : 0;

  const avgPS = evaluations.length
    ? Math.round(
        evaluations.reduce((acc, ev) => acc + ev.rubric.problemSolving, 0) /
          evaluations.length
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-purple-800/40">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>NexusAI Autonomous Voice Evaluator</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-bold">
                CONNECTED
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              AI Mock Technical & HR Interview Desk
            </h1>

            <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed">
              Experience realistic corporate placement interviews powered by
              Google Gemini and conversational speech AI. Answer live via your
              microphone or keyboard, receive genuine multi-dimensional scoring
              rubrics, and benchmark your campus placement readiness.
            </p>
          </div>

          {/* Voice Assistant Status */}
          <div className="flex items-center gap-4 bg-white/10 dark:bg-slate-900/50 p-4 rounded-2xl border border-white/10 backdrop-blur-md shrink-0">
            <div className="relative flex items-center justify-center">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  isSpeaking
                    ? 'bg-gradient-to-tr from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50 scale-105'
                    : isListening
                    ? 'bg-gradient-to-tr from-rose-500 to-amber-500 shadow-lg shadow-rose-500/50 scale-105'
                    : 'bg-gradient-to-tr from-indigo-600 to-purple-600'
                }`}
              >
                <Bot className="w-7 h-7 text-white" />
              </div>

              {(isSpeaking || isListening) && (
                <span className="absolute inset-0 rounded-2xl border-2 border-purple-400 animate-ping opacity-40 pointer-events-none" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  Nexus Interviewer
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/20 text-white">
                  Gemini Neural
                </span>
              </div>

              <p className="text-xs text-purple-200 mt-0.5">
                {isSpeaking
                  ? 'Speaking question...'
                  : isListening
                  ? 'Listening to your answer...'
                  : isEvaluating
                  ? 'Analyzing response with Gemini AI...'
                  : 'Awaiting your instruction'}
              </p>

              <div className="flex items-center gap-1 mt-2 h-4">
                {[4, 12, 16, 8, 14, 18, 10, 6, 12, 15, 8, 4].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      height:
                        isSpeaking || isListening
                          ? `${Math.max(
                              4,
                              h * (Math.sin(Date.now() / 150 + i) + 1.2)
                            )}px`
                          : '4px',
                    }}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      isSpeaking
                        ? 'bg-purple-300'
                        : isListening
                        ? 'bg-rose-400'
                        : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                if (voiceEnabled) stopSpeaking();
                setVoiceEnabled(!voiceEnabled);
              }}
              className={`p-2.5 rounded-xl border transition-colors ${
                voiceEnabled
                  ? 'border-purple-400/40 bg-purple-500/20 text-purple-200 hover:bg-purple-500/30'
                  : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
              title={voiceEnabled ? 'Mute AI voice output' : 'Enable AI voice output'}
            >
              {voiceEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* STATE 1: Track Selection */}
      {sessionState === 'idle' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Select Interview Track & Target Role
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose an engineering or HR domain to initiate simulated campus
                placement screening
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>Est. Duration: 8–12 mins</span>
            </div>
          </div>

          {/* Track Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.keys(TRACK_QUESTIONS) as InterviewTrack[]).map(
              (trackKey) => {
                const track = TRACK_QUESTIONS[trackKey];
                const Icon = track.icon;
                const isSelected = selectedTrack === trackKey;

                return (
                  <div
                    key={trackKey}
                    onClick={() => setSelectedTrack(trackKey)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-md ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {track.title}
                          </h3>

                          {isSelected && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Selected
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {track.desc}
                        </p>

                        <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-400">
                          <span>{track.questions.length} Structured Questions</span>
                          <span>•</span>
                          <span>Gemini Evaluated</span>
                          <span>•</span>
                          <span>Voice & Speech</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>

          {/* Launch Action */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center justify-center shrink-0">
                <Mic className="w-5 h-5" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Voice Assistant Permissions
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {speechSupported
                    ? 'Microphone speech recognition supported on this browser. Speak naturally or type.'
                    : 'Web Speech API is optimized for Chromium browsers. Typing mode is always available.'}
                </p>
              </div>
            </div>

            <button
              onClick={startInterview}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Voice Mock Interview</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STATE 2 & 3: Active Interview and Feedback */}
      {(sessionState === 'in_progress' || sessionState === 'feedback') &&
        currentQuestion && (
          <div className="space-y-5">
            {/* Progress Header */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  Question {currentQuestionIdx + 1} of {activeQuestions.length}
                </span>

                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
                  Track: {TRACK_QUESTIONS[selectedTrack].title}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Elapsed: {formatTime(timerSeconds)}</span>
                </div>

                <button
                  onClick={() => speakText(currentQuestion.question)}
                  className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:underline"
                  title="Re-read question"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Repeat Question</span>
                </button>
              </div>
            </div>

            {/* Question Card */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold shadow-md shadow-indigo-600/30">
                  Q{currentQuestionIdx + 1}
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                      {currentQuestion.category.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Placement Interviewer Prompt
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                    {currentQuestion.question}
                  </h2>
                </div>
              </div>

              {/* Hint */}
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs">
                <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <strong>Interviewer Focus Tip:</strong> {currentQuestion.hint}
                </div>
              </div>
            </div>

            {/* Student Answer Input */}
            {sessionState === 'in_progress' && (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
                {/* Error Banner with Retry */}
                {errorMessage && (
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-start justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                      <div>
                        <strong>Evaluation Notice:</strong> {errorMessage}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSubmitAnswer}
                      className="px-3 py-1 rounded-lg bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors shrink-0 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Retry</span>
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-500" />
                    Your Verbal or Written Answer
                  </label>

                  <button
                    type="button"
                    onClick={applySampleAnswer}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors"
                    title="Auto-fill with sample answer for quick testing"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Try Sample Answer (Demo)</span>
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    value={userAnswer}
                    onChange={handleAnswerChange}
                    placeholder="Speak into your microphone or type your technical answer here in detail..."
                    rows={6}
                    className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none leading-relaxed"
                  />

                  <div className="absolute right-3 bottom-3 flex items-center gap-2 text-[11px] text-slate-400">
                    <span>
                      {userAnswer.trim().split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                </div>

                {/* Microphone and Submit Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl border text-xs font-semibold transition-all ${
                        isListening
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 animate-pulse'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-indigo-500'
                      }`}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-4 h-4 text-rose-600" />
                          <span>Stop Listening</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4 text-indigo-600" />
                          <span>Speak (Voice Input)</span>
                        </>
                      )}
                    </button>

                    {userAnswer && (
                      <button
                        type="button"
                        onClick={handleClearAnswer}
                        className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 px-2"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={isEvaluating || !userAnswer.trim()}
                    onClick={handleSubmitAnswer}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isEvaluating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Evaluating with Gemini AI...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Answer for AI Scoring</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Question Feedback Screen */}
            {sessionState === 'feedback' && evaluations.length > 0 && (
              <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
                {(() => {
                  const latest = evaluations[evaluations.length - 1];
                  const scoreColor =
                    latest.score >= 75
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : latest.score >= 50
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-rose-600 dark:text-rose-400';

                  return (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                              Evaluated by Google Gemini AI
                            </span>
                            {latest.durationMs && (
                              <span className="text-[10px] text-slate-400">
                                • {Math.round(latest.durationMs / 100) / 10}s
                              </span>
                            )}
                          </div>

                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                            Question Score:{' '}
                            <span className={scoreColor}>
                              {latest.score}/100
                            </span>
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => speakText(latest.aiFeedback)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Replay Feedback</span>
                          </button>

                          <button
                            onClick={handleNextQuestion}
                            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/25 transition-all"
                          >
                            <span>
                              {currentQuestionIdx + 1 < activeQuestions.length
                                ? 'Next Question'
                                : 'View Full Scorecard'}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* AI Feedback */}
                      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/50 flex items-start gap-3">
                        <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />

                        <div className="space-y-1">
                          <p className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                            NexusAI Placement Feedback
                          </p>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                            {latest.aiFeedback}
                          </p>
                        </div>
                      </div>

                      {/* Scoring Rubric */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          {
                            label: 'Technical Depth',
                            value: latest.rubric.technical,
                            color: 'bg-blue-600',
                          },
                          {
                            label: 'Communication',
                            value: latest.rubric.communication,
                            color: 'bg-emerald-600',
                          },
                          {
                            label: 'Confidence (Assertiveness)',
                            value: latest.rubric.confidence,
                            color: 'bg-purple-600',
                          },
                          {
                            label: 'Problem Solving',
                            value: latest.rubric.problemSolving,
                            color: 'bg-amber-600',
                          },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800"
                          >
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                              {item.label}
                            </span>

                            <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                              {item.value}%
                            </div>

                            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                              <div
                                style={{ width: `${item.value}%` }}
                                className={`${item.color} h-full rounded-full`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Strengths and Improvements Side by Side */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/30 space-y-2">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Demonstrated Strengths</span>
                          </div>
                          {latest.strengths && latest.strengths.length > 0 ? (
                            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                              {latest.strengths.map((str, idx) => (
                                <li key={idx}>{str}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-slate-500">
                              No notable strengths identified in this answer.
                            </p>
                          )}
                        </div>

                        <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 space-y-2">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Areas to Improve</span>
                          </div>
                          {latest.improvements && latest.improvements.length > 0 ? (
                            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                              {latest.improvements.map((imp, idx) => (
                                <li key={idx}>{imp}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-slate-500">
                              Keep maintaining this level of depth and clarity.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Key Points Covered vs Missed */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/30 space-y-2">
                          <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Expected Key Points Covered ({latest.keyPointsCovered.length})</span>
                          </span>

                          {latest.keyPointsCovered.length > 0 ? (
                            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                              {latest.keyPointsCovered.map((point, index) => (
                                <li key={`${point}-${index}`}>{point}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              None of the core expected key points were addressed.
                            </p>
                          )}
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-2">
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                            <span>Key Points Missed ({latest.keyPointsMissed.length})</span>
                          </span>

                          {latest.keyPointsMissed.length > 0 ? (
                            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside">
                              {latest.keyPointsMissed.map((point, index) => (
                                <li key={`${point}-${index}`}>{point}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                              Excellent! You covered all expected benchmark points.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Candidate Answer and Model Answer Reference */}
                      <div className="space-y-3 pt-2">
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                            Your Evaluated Answer:
                          </span>

                          <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed whitespace-pre-wrap">
                            {latest.userAnswer}
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/30 space-y-1">
                          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                            Model Reference Answer:
                          </span>

                          <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                            {latest.suggestedAnswer || currentQuestion.sampleDemoAnswer}
                          </p>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}

      {/* STATE 4: Final Scorecard */}
      {sessionState === 'completed' && (
        <div className="space-y-6">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
            {/* Score Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800 text-center md:text-left">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                  <Award className="w-3.5 h-3.5" />
                  <span>Interview Session Completed</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  Placement Readiness Scorecard
                </h2>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track: {TRACK_QUESTIONS[selectedTrack].title} • Evaluated by
                  Gemini AI
                </p>
              </div>

              <div className="flex items-center gap-4 bg-gradient-to-tr from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 p-5 rounded-3xl border border-indigo-200 dark:border-indigo-800/50">
                <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex flex-col items-center justify-center shadow-lg shadow-indigo-600/30">
                  <span className="text-2xl font-black">{avgOverall}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                    / 100
                  </span>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {avgOverall >= 85
                      ? 'Tier 1 Prime Eligible'
                      : avgOverall >= 70
                      ? 'Tier 2 Ready'
                      : 'Foundation Level'}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-[150px]">
                    Average across {evaluations.length} evaluated questions.
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Dimensions */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Performance Dimensions
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Technical Depth',
                    value: avgTech,
                    color: 'bg-blue-600',
                    textColor: 'text-blue-600 dark:text-blue-400',
                  },
                  {
                    label: 'Communication & Clarity',
                    value: avgComm,
                    color: 'bg-emerald-600',
                    textColor: 'text-emerald-600 dark:text-emerald-400',
                  },
                  {
                    label: 'Confidence & Assertiveness',
                    value: avgConf,
                    color: 'bg-purple-600',
                    textColor: 'text-purple-600 dark:text-purple-400',
                  },
                  {
                    label: 'Problem Solving',
                    value: avgPS,
                    color: 'bg-amber-600',
                    textColor: 'text-amber-600 dark:text-amber-400',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-400">
                        {item.label}
                      </span>
                      <span className={`font-bold ${item.textColor}`}>
                        {item.value}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${item.value}%` }}
                        className={`${item.color} h-full rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Strengths and Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Key Recruiter Strengths</span>
                </div>

                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                  {evaluations
                    .flatMap((ev) => (ev.strengths.length ? ev.strengths : ev.keyPointsCovered))
                    .filter((pt, idx, arr) => arr.indexOf(pt) === idx)
                    .slice(0, 5)
                    .map((point, index) => (
                      <li key={`${point}-${index}`}>{point}</li>
                    ))}

                  {evaluations.every(
                    (ev) => ev.strengths.length === 0 && ev.keyPointsCovered.length === 0
                  ) && (
                    <li>
                      Focus on deepening core technical fundamentals and structured STAR answers.
                    </li>
                  )}
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Placement Improvement Plan</span>
                </div>

                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                  {evaluations
                    .flatMap((ev) =>
                      ev.improvements.length
                        ? ev.improvements
                        : ev.keyPointsMissed.map((kp) => `Cover concept: ${kp}`)
                    )
                    .filter((pt, idx, arr) => arr.indexOf(pt) === idx)
                    .slice(0, 5)
                    .map((improvement, index) => (
                      <li key={`${improvement}-${index}`}>{improvement}</li>
                    ))}

                  {evaluations.every(
                    (ev) => ev.improvements.length === 0 && ev.keyPointsMissed.length === 0
                  ) && (
                    <li>
                      Outstanding answers! Continue practicing with complex edge cases and real-world system designs.
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Detailed Question Audit */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Detailed Question Audit
              </h3>

              <div className="space-y-3">
                {evaluations.map((evaluation, index) => (
                  <div
                    key={evaluation.questionId}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold text-slate-900 dark:text-white">
                        Q{index + 1}: {evaluation.question}
                      </span>

                      <span
                        className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          evaluation.score >= 75
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : evaluation.score >= 50
                            ? 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            : 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {evaluation.score}/100
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 italic whitespace-pre-wrap">
                      Your response: "{evaluation.userAnswer}"
                    </p>

                    <p className="text-indigo-700 dark:text-indigo-400 font-medium">
                      AI Feedback: {evaluation.aiFeedback}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setSessionState('idle');
                  stopSpeaking();
                  setUserAnswer('');
                  baseTextRef.current = '';
                  setEvaluations([]);
                  setCurrentQuestionIdx(0);
                  setTimerSeconds(0);
                  setErrorMessage(null);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake or Switch Track</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() =>
                    alert(
                      'Your mock interview scorecard has been successfully calculated from live Gemini evaluation.'
                    )
                  }
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Save to Verified Skill Passport</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
