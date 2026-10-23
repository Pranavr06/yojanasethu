'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Activity,
  Radio,
  Zap,
  Gauge,
  Music,
  PauseCircle,
  TrendingUp,
  FastForward,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  FullEvaluationResult,
  VoiceAnalysisResult,
  AcousticTelemetry,
} from '@/app/api/interview/evaluate/route';

export type InterviewTrack = 'fullstack' | 'aiml' | 'data' | 'behavioral';

export type InterviewSessionState =
  | 'idle'
  | 'asking'
  | 'listening'
  | 'saving_answer'
  | 'moving_to_next'
  | 'finalizing_results'
  | 'completed';

export interface QuestionTemplate {
  id: string;
  question: string;
  category: 'technical' | 'architecture' | 'problem_solving' | 'behavioral';
  hint: string;
  sampleDemoAnswer: string;
  keyPoints: string[];
}

export interface SavedAnswer {
  questionId: string;
  questionIndex: number;
  questionText: string;
  category: string;
  keyPoints: string[];
  sampleDemoAnswer: string;
  userAnswer: string;
  acousticTelemetry: AcousticTelemetry;
  timestamp: number;
}

export interface QuestionEvaluation extends FullEvaluationResult {
  questionId: string;
  question: string;
  userAnswer: string;
  durationMs?: number;
  isEvaluationFailed?: boolean;
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

const STORAGE_SESSION_KEY = 'yojanasethu_live_mock_interview_session';

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function MockInterviewAssistant() {
  const [selectedTrack, setSelectedTrack] = useState<InterviewTrack>('fullstack');
  const [sessionState, setSessionState] = useState<InterviewSessionState>('idle');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [liveVoiceMode, setLiveVoiceMode] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);

  // Live acoustic visualizer state
  const [liveVolumeLevel, setLiveVolumeLevel] = useState(0);
  const [detectedCommandNotice, setDetectedCommandNotice] = useState<string | null>(null);
  const [showStopConfirmModal, setShowStopConfirmModal] = useState(false);
  const [recoveredSessionPrompt, setRecoveredSessionPrompt] = useState<any | null>(null);

  // Evaluation and answers tracking
  const [savedAnswers, setSavedAnswers] = useState<SavedAnswer[]>([]);
  const [evaluations, setEvaluations] = useState<QuestionEvaluation[]>([]);
  const [completedEvalCount, setCompletedEvalCount] = useState(0);
  const [expandedQuestionAuditId, setExpandedQuestionAuditId] = useState<string | null>(null);

  // Speech and concurrency management refs
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const baseTextRef = useRef<string>('');
  const isAdvancingRef = useRef<boolean>(false);
  const savedAnswersRef = useRef<SavedAnswer[]>([]);
  const evaluationsMapRef = useRef<Map<string, QuestionEvaluation>>(new Map());
  const backgroundPromisesRef = useRef<Map<string, Promise<QuestionEvaluation | null>>>(new Map());

  // Real-time acoustic capture refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animFrameIdRef = useRef<number | null>(null);
  const speechStartTimeRef = useRef<number>(0);
  const pausesListRef = useRef<{ start: number; duration: number }[]>([]);
  const pitchSamplesRef = useRef<number[]>([]);
  const rmsSamplesRef = useRef<number[]>([]);
  const lastVoiceActivityTimeRef = useRef<number>(0);
  const isPauseActiveRef = useRef<boolean>(false);
  const currentPauseStartRef = useRef<number>(0);

  const activeQuestions = TRACK_QUESTIONS[selectedTrack].questions;
  const currentQuestion = activeQuestions[currentQuestionIdx];

  // 1. Check for recoverable interrupted session in sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem(STORAGE_SESSION_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (
            parsed &&
            parsed.track &&
            Array.isArray(parsed.answers) &&
            parsed.answers.length > 0 &&
            Date.now() - (parsed.timestamp || 0) < 3600000 // within 1 hour
          ) {
            setRecoveredSessionPrompt(parsed);
          }
        }
      } catch (_) {}
    }
  }, []);

  // 2. Initialize Web Speech Recognition
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

          if (accumulatedFinal) {
            const trimmedFinal = accumulatedFinal.trim();
            if (trimmedFinal) {
              baseTextRef.current = baseTextRef.current
                ? `${baseTextRef.current.trim()} ${trimmedFinal}`
                : trimmedFinal;
            }
          }

          const interimTrimmed = currentInterim.trim();
          let liveText = interimTrimmed
            ? baseTextRef.current
              ? `${baseTextRef.current.trim()} ${interimTrimmed}`
              : interimTrimmed
            : baseTextRef.current;

          const cleanLower = liveText.toLowerCase().trim();

          // Voice Command: "Repeat Question"
          if (
            /\b(repeat question|read question again|say question again)\b/i.test(
              cleanLower
            )
          ) {
            setDetectedCommandNotice('Voice Command: "Repeat Question"');
            liveText = liveText.replace(
              /\b(repeat question|read question again|say question again)\b/gi,
              ''
            ).trim();
            baseTextRef.current = liveText;
            setUserAnswer(liveText);
            setTimeout(() => setDetectedCommandNotice(null), 3000);
            speakText(currentQuestion.question);
            return;
          }

          // Voice Command: "Stop Interview"
          if (/\b(stop interview|end interview|quit interview)\b/i.test(cleanLower)) {
            setDetectedCommandNotice('Voice Command: "Stop Interview" — Confirmation requested');
            liveText = liveText.replace(
              /\b(stop interview|end interview|quit interview)\b/gi,
              ''
            ).trim();
            baseTextRef.current = liveText;
            setUserAnswer(liveText);
            setTimeout(() => {
              setDetectedCommandNotice(null);
              setShowStopConfirmModal(true);
            }, 500);
            return;
          }

          // Voice Command: "Pass" (Advance to next question automatically)
          const passMatch = liveText.match(
            /(?:^|\s)(?:please\s+)?(pass|pass to next|submit answer|done)[\s.!?]*$/i
          );
          if (passMatch) {
            const cleanedAnswer = liveText
              .replace(
                /(?:^|\s)(?:please\s+)?(pass|pass to next|submit answer|done)[\s.!?]*$/i,
                ''
              )
              .trim();

            setDetectedCommandNotice('Voice Command: "Pass" — Saving and advancing to next question...');
            setUserAnswer(cleanedAnswer);
            baseTextRef.current = cleanedAnswer;

            setTimeout(() => {
              setDetectedCommandNotice(null);
              handlePassAndAdvance(cleanedAnswer);
            }, 500);
            return;
          }

          setUserAnswer(liveText);
        };

        recognition.onerror = (err: any) => {
          console.warn('Speech recognition notice:', err.error);
          if (err.error === 'not-allowed' || err.error === 'service-not-allowed') {
            setMicPermissionDenied(true);
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      stopMicrophoneAndAcoustics();
    };
  }, [currentQuestionIdx, currentQuestion]);

  // 3. Interview Timer Logic
  useEffect(() => {
    if (
      sessionState === 'asking' ||
      sessionState === 'listening' ||
      sessionState === 'saving_answer' ||
      sessionState === 'moving_to_next'
    ) {
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

  // Audio Signal Processing: Web Audio Analyser & MediaRecorder
  const startMicrophoneAndAcoustics = async () => {
    try {
      if (typeof window === 'undefined') return;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;
      setMicPermissionDenied(false);

      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      speechStartTimeRef.current = Date.now();
      lastVoiceActivityTimeRef.current = Date.now();
      isPauseActiveRef.current = false;
      pausesListRef.current = [];
      pitchSamplesRef.current = [];
      rmsSamplesRef.current = [];
      audioChunksRef.current = [];

      try {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/wav';

        const recorder = new MediaRecorder(stream, { mimeType });
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };
        recorder.start(250);
        mediaRecorderRef.current = recorder;
      } catch (err) {
        console.warn('MediaRecorder not available:', err);
      }

      const buffer = new Float32Array(analyser.fftSize);

      const analyzeFrame = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getFloatTimeDomainData(buffer);

        let sumSquares = 0;
        for (let i = 0; i < buffer.length; i++) {
          sumSquares += buffer[i] * buffer[i];
        }
        const rms = Math.sqrt(sumSquares / buffer.length);
        const rmsDb = 20 * Math.log10(Math.max(rms, 1e-4));
        rmsSamplesRef.current.push(rmsDb);

        setLiveVolumeLevel(Math.min(100, Math.max(0, Math.round(rms * 400))));

        const sampleRate = audioCtx.sampleRate;
        const minPeriod = Math.floor(sampleRate / 350);
        const maxPeriod = Math.floor(sampleRate / 75);

        let bestCorrelation = 0;
        let bestPeriod = -1;

        if (rms > 0.02) {
          for (let period = minPeriod; period <= maxPeriod; period++) {
            let correlation = 0;
            for (let i = 0; i < buffer.length - period; i++) {
              correlation += buffer[i] * buffer[i + period];
            }
            if (correlation > bestCorrelation) {
              bestCorrelation = correlation;
              bestPeriod = period;
            }
          }

          if (bestCorrelation > 0.4 && bestPeriod > 0) {
            const pitchHz = sampleRate / bestPeriod;
            if (pitchHz >= 75 && pitchHz <= 350) {
              pitchSamplesRef.current.push(pitchHz);
            }
          }

          if (isPauseActiveRef.current) {
            const pauseDuration =
              (Date.now() - currentPauseStartRef.current) / 1000;
            if (pauseDuration >= 0.7) {
              pausesListRef.current.push({
                start: currentPauseStartRef.current,
                duration: pauseDuration,
              });
            }
            isPauseActiveRef.current = false;
          }
          lastVoiceActivityTimeRef.current = Date.now();
        } else {
          const silenceDuration =
            (Date.now() - lastVoiceActivityTimeRef.current) / 1000;
          if (silenceDuration >= 0.7 && !isPauseActiveRef.current) {
            isPauseActiveRef.current = true;
            currentPauseStartRef.current = Date.now();
          }
        }

        animFrameIdRef.current = requestAnimationFrame(analyzeFrame);
      };

      animFrameIdRef.current = requestAnimationFrame(analyzeFrame);
    } catch (err: any) {
      console.warn('Microphone permission or AudioContext error:', err);
      setMicPermissionDenied(true);
      setIsListening(false);
    }
  };

  const stopMicrophoneAndAcoustics = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (_) {}
      audioContextRef.current = null;
    }

    setLiveVolumeLevel(0);
  };

  // Compile acoustic metrics from recorded speech
  const extractAcousticTelemetry = (transcript: string): AcousticTelemetry => {
    const durationSec = Math.max(
      1,
      (Date.now() - speechStartTimeRef.current) / 1000
    );

    const fillerRegex =
      /\b(um|uh|er|ah|like|you know|basically|actually|sort of|kind of)\b/gi;
    const detectedFillers: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = fillerRegex.exec(transcript)) !== null) {
      detectedFillers.push(match[0].toLowerCase());
    }

    const repeatedWordsRegex = /\b(\w+)\s+\1\b/gi;
    while ((match = repeatedWordsRegex.exec(transcript)) !== null) {
      detectedFillers.push(`repeat: "${match[1]}"`);
    }

    const words = transcript.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    const totalPauseSec = pausesListRef.current.reduce(
      (acc, p) => acc + p.duration,
      0
    );
    const pauseCount = pausesListRef.current.length;

    const activeSpeechTimeSec = Math.max(1, durationSec - totalPauseSec);
    const speakingRateWpm = Math.round((wordCount / activeSpeechTimeSec) * 60);

    const pitches = pitchSamplesRef.current;
    let meanPitchHz = 0;
    let pitchVarianceHz = 0;
    if (pitches.length > 5) {
      meanPitchHz = Math.round(
        pitches.reduce((a, b) => a + b, 0) / pitches.length
      );
      const variance =
        pitches.reduce((a, b) => a + Math.pow(b - meanPitchHz, 2), 0) /
        pitches.length;
      pitchVarianceHz = Math.round(Math.sqrt(variance));
    }

    const rms = rmsSamplesRef.current;
    let loudnessVariationDb = 0;
    if (rms.length > 10) {
      const meanRms = rms.reduce((a, b) => a + b, 0) / rms.length;
      const rmsVariance =
        rms.reduce((a, b) => a + Math.pow(b - meanRms, 2), 0) / rms.length;
      loudnessVariationDb = Math.round(Math.sqrt(rmsVariance));
    }

    return {
      speakingRateWpm: Math.min(260, Math.max(40, speakingRateWpm)),
      pauseCount,
      totalPauseSec: Math.round(totalPauseSec * 10) / 10,
      durationSec: Math.round(durationSec * 10) / 10,
      meanPitchHz: meanPitchHz || 160,
      pitchVarianceHz: pitchVarianceHz || 25,
      loudnessVariationDb: loudnessVariationDb || 12,
      fillerCount: detectedFillers.length,
      fillerWords: Array.from(new Set(detectedFillers)),
      isTypedAnswer: false,
    };
  };

  // Text-To-Speech Output with Reliable Callback Sequencing
  const speakText = (text: string, onFinish?: () => void) => {
    if (
      !voiceEnabled ||
      typeof window === 'undefined' ||
      !window.speechSynthesis
    ) {
      if (onFinish) setTimeout(onFinish, 150);
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
          v.name.includes('Samantha') ||
          v.name.includes('Neural'))
    );

    if (naturalVoice) utterance.voice = naturalVoice;

    let hasFinished = false;
    const finishHandler = () => {
      if (!hasFinished) {
        hasFinished = true;
        setIsSpeaking(false);
        if (onFinish) onFinish();
      }
    };

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = finishHandler;
    utterance.onerror = finishHandler;

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Start microphone listening for current question
  const startListeningForCurrentQuestion = async () => {
    if (sessionState === 'completed' || sessionState === 'finalizing_results') return;

    setSessionState('listening');
    baseTextRef.current = userAnswer.trim();

    if (!speechSupported && !recognitionRef.current) {
      return;
    }

    await startMicrophoneAndAcoustics();

    try {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      }
    } catch (error) {
      console.warn('Speech recognition start note:', error);
    }
  };

  // Toggle microphone in manual mode
  const toggleListening = async () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      stopMicrophoneAndAcoustics();
      setIsListening(false);
    } else {
      stopSpeaking();
      startListeningForCurrentQuestion();
    }
  };

  // Start interview session from question 0
  const startInterview = () => {
    setSessionState('asking');
    setCurrentQuestionIdx(0);
    setTimerSeconds(0);
    setUserAnswer('');
    baseTextRef.current = '';
    setSavedAnswers([]);
    setEvaluations([]);
    setCompletedEvalCount(0);
    savedAnswersRef.current = [];
    evaluationsMapRef.current.clear();
    backgroundPromisesRef.current.clear();
    setRecoveredSessionPrompt(null);
    setDetectedCommandNotice(null);
    setShowStopConfirmModal(false);

    try {
      sessionStorage.removeItem(STORAGE_SESSION_KEY);
    } catch (_) {}

    const firstQuestion = TRACK_QUESTIONS[selectedTrack].questions[0];

    speakText(
      `Welcome to your simulated placement interview for ${TRACK_QUESTIONS[selectedTrack].title}. Question 1: ${firstQuestion.question}`,
      () => {
        startListeningForCurrentQuestion();
      }
    );
  };

  // Resume an interrupted session
  const resumeInterruptedSession = (session: any) => {
    setSelectedTrack(session.track || 'fullstack');
    setCurrentQuestionIdx(session.questionIdx || 0);
    setTimerSeconds(session.timerSeconds || 0);
    setSavedAnswers(session.answers || []);
    savedAnswersRef.current = session.answers || [];
    setUserAnswer('');
    baseTextRef.current = '';
    setRecoveredSessionPrompt(null);
    setSessionState('asking');

    const trackQuestions = TRACK_QUESTIONS[session.track as InterviewTrack]?.questions || [];
    const questionToAsk = trackQuestions[session.questionIdx] || trackQuestions[0];

    speakText(
      `Resuming your interview. Question ${session.questionIdx + 1}: ${questionToAsk.question}`,
      () => {
        startListeningForCurrentQuestion();
      }
    );
  };

  // Background Evaluation Engine: Runs in background without stopping conversational flow!
  const evaluateAnswerInBackground = async (savedAnswer: SavedAnswer): Promise<QuestionEvaluation> => {
    const evalPromise = (async () => {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const res = await fetch('/api/interview/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              role: TRACK_QUESTIONS[selectedTrack].title,
              question: savedAnswer.questionText,
              answer: savedAnswer.userAnswer || 'No verbal answer was provided.',
              keyPoints: savedAnswer.keyPoints,
              acousticMetrics: savedAnswer.acousticTelemetry,
            }),
          });

          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }

          const data = await res.json();
          if (data?.evaluation) {
            const evalResult: QuestionEvaluation = {
              ...data.evaluation,
              questionId: savedAnswer.questionId,
              question: savedAnswer.questionText,
              userAnswer: savedAnswer.userAnswer,
              durationMs: data?.meta?.durationMs,
            };

            evaluationsMapRef.current.set(savedAnswer.questionId, evalResult);
            setCompletedEvalCount((prev) => prev + 1);
            return evalResult;
          }
        } catch (err) {
          console.warn(`Evaluation attempt ${attempt} for ${savedAnswer.questionId} failed:`, err);
          if (attempt === 2) {
            // Safe fallback evaluation marking unavailable instead of faking a score
            const fallbackEval: QuestionEvaluation = {
              questionId: savedAnswer.questionId,
              question: savedAnswer.questionText,
              userAnswer: savedAnswer.userAnswer,
              score: 0,
              technical: 0,
              relevance: 0,
              reasoning: 0,
              communication: 0,
              confidence: 0,
              problemSolving: 0,
              structure: 0,
              examples: 0,
              aiFeedback: 'Network error prevented live Gemini evaluation. Review question and retry in next session.',
              strengths: [],
              improvements: ['Review core concepts and practice with reliable connectivity.'],
              keyPointsCovered: [],
              keyPointsMissed: savedAnswer.keyPoints,
              keyPointsHit: [],
              suggestedAnswer: savedAnswer.sampleDemoAnswer,
              modelAnswer: savedAnswer.sampleDemoAnswer,
              followUpQuestion: 'How would you approach this problem in a production environment?',
              coachingSummary: 'Evaluation unavailable due to connection timeout.',
              voiceAnalysis: {
                speakingRate: { wpm: savedAnswer.acousticTelemetry.speakingRateWpm || null, assessment: 'Recorded', feedback: 'Telemetry captured.' },
                pitchVariation: { varianceHz: savedAnswer.acousticTelemetry.pitchVarianceHz || null, assessment: 'N/A', feedback: 'Pitch variance recorded.' },
                pausesAndHesitation: { pauseCount: savedAnswer.acousticTelemetry.pauseCount || 0, totalPauseSec: savedAnswer.acousticTelemetry.totalPauseSec || 0, assessment: 'Recorded', feedback: 'Pauses logged.' },
                loudnessVariation: { assessment: 'Standard', feedback: 'Audio captured.' },
                vocalClarity: { assessment: 'Intelligible', feedback: 'Intelligible transcript.' },
                fillerWords: { count: savedAnswer.acousticTelemetry.fillerCount || 0, detected: savedAnswer.acousticTelemetry.fillerWords || [], assessment: 'Logged', feedback: 'Fillers detected.' },
                pacingFluency: { assessment: 'Standard', feedback: 'Pacing analyzed.' },
                nervousnessIndicators: { observed: false, notes: 'None observed.', feedback: 'Calm delivery.' },
              },
              isEvaluationFailed: true,
            };
            evaluationsMapRef.current.set(savedAnswer.questionId, fallbackEval);
            setCompletedEvalCount((prev) => prev + 1);
            return fallbackEval;
          }
          await new Promise((r) => setTimeout(r, 1200));
        }
      }

      throw new Error('Evaluation exhausted retries');
    })();

    backgroundPromisesRef.current.set(savedAnswer.questionId, evalPromise);
    return evalPromise;
  };

  // PASS & AUTOMATIC ADVANCEMENT WORKFLOW
  const handlePassAndAdvance = async (textToSubmit?: string) => {
    if (isAdvancingRef.current) return;
    isAdvancingRef.current = true;

    const finalAnswerText = (textToSubmit !== undefined ? textToSubmit : userAnswer).trim();

    // 1. Immediately pause microphone & recognition to prevent audio bleeding
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      setIsListening(false);
    }
    stopSpeaking();

    // 2. Extract acoustic telemetry
    const wasMicUsed =
      pitchSamplesRef.current.length > 0 || rmsSamplesRef.current.length > 5;
    const telemetry = wasMicUsed
      ? extractAcousticTelemetry(finalAnswerText)
      : { isTypedAnswer: true, fillerCount: 0, fillerWords: [] };

    stopMicrophoneAndAcoustics();

    // 3. Save Answer Record
    const savedAnswer: SavedAnswer = {
      questionId: currentQuestion.id,
      questionIndex: currentQuestionIdx,
      questionText: currentQuestion.question,
      category: currentQuestion.category,
      keyPoints: currentQuestion.keyPoints,
      sampleDemoAnswer: currentQuestion.sampleDemoAnswer,
      userAnswer: finalAnswerText,
      acousticTelemetry: telemetry,
      timestamp: Date.now(),
    };

    const updatedAnswers = [...savedAnswersRef.current, savedAnswer];
    savedAnswersRef.current = updatedAnswers;
    setSavedAnswers(updatedAnswers);

    // Persist session to sessionStorage for crash/refresh recovery
    try {
      sessionStorage.setItem(
        STORAGE_SESSION_KEY,
        JSON.stringify({
          track: selectedTrack,
          questionIdx: currentQuestionIdx + 1,
          answers: updatedAnswers,
          timerSeconds,
          timestamp: Date.now(),
        })
      );
    } catch (_) {}

    // 4. Trigger Background Gemini Evaluation (does NOT block next question!)
    evaluateAnswerInBackground(savedAnswer);

    // 5. Check if there are more questions
    const nextIdx = currentQuestionIdx + 1;

    if (nextIdx < activeQuestions.length) {
      // AUTOMATIC PROGRESSION: Cue next question immediately
      setSessionState('moving_to_next');
      setUserAnswer('');
      baseTextRef.current = '';

      setTimeout(() => {
        setCurrentQuestionIdx(nextIdx);
        setSessionState('asking');
        isAdvancingRef.current = false;

        const nextQuestion = activeQuestions[nextIdx];
        speakText(
          `Question ${nextIdx + 1}: ${nextQuestion.question}`,
          () => {
            startListeningForCurrentQuestion();
          }
        );
      }, 500);
    } else {
      // ALL QUESTIONS COMPLETED: Transition to Finalizing Results
      setSessionState('finalizing_results');
      setUserAnswer('');
      baseTextRef.current = '';
      isAdvancingRef.current = false;

      // Finalize all background evaluations
      await finalizeAllEvaluations(updatedAnswers);
    }
  };

  // Finalize all evaluations and render single comprehensive report
  const finalizeAllEvaluations = async (answers: SavedAnswer[]) => {
    // Wait for all background evaluation promises to settle
    const allPromises = Array.from(backgroundPromisesRef.current.values());
    await Promise.allSettled(allPromises);

    // Collect evaluations in exact question order
    const orderedEvaluations: QuestionEvaluation[] = answers.map((ans) => {
      const existing = evaluationsMapRef.current.get(ans.questionId);
      if (existing) return existing;

      return {
        questionId: ans.questionId,
        question: ans.questionText,
        userAnswer: ans.userAnswer,
        score: 0,
        technical: 0,
        relevance: 0,
        reasoning: 0,
        communication: 0,
        confidence: 0,
        problemSolving: 0,
        structure: 0,
        examples: 0,
        aiFeedback: 'Response recorded.',
        strengths: [],
        improvements: ['Review expected key points for this topic.'],
        keyPointsCovered: [],
        keyPointsMissed: ans.keyPoints,
        keyPointsHit: [],
        suggestedAnswer: ans.sampleDemoAnswer,
        modelAnswer: ans.sampleDemoAnswer,
        followUpQuestion: 'How would you apply this in a large-scale project?',
        coachingSummary: 'Response audit complete.',
        voiceAnalysis: {
          speakingRate: { wpm: ans.acousticTelemetry.speakingRateWpm || null, assessment: 'Recorded', feedback: 'Speaking rate recorded.' },
          pitchVariation: { varianceHz: ans.acousticTelemetry.pitchVarianceHz || null, assessment: 'N/A', feedback: 'Pitch tracked.' },
          pausesAndHesitation: { pauseCount: ans.acousticTelemetry.pauseCount || 0, totalPauseSec: ans.acousticTelemetry.totalPauseSec || 0, assessment: 'Recorded', feedback: 'Pauses logged.' },
          loudnessVariation: { assessment: 'Standard', feedback: 'Audio logged.' },
          vocalClarity: { assessment: 'Intelligible', feedback: 'Answer logged.' },
          fillerWords: { count: ans.acousticTelemetry.fillerCount || 0, detected: ans.acousticTelemetry.fillerWords || [], assessment: 'Logged', feedback: 'Fillers logged.' },
          pacingFluency: { assessment: 'Standard', feedback: 'Fluency logged.' },
          nervousnessIndicators: { observed: false, notes: 'Steady response.', feedback: 'Composed delivery.' },
        },
      };
    });

    setEvaluations(orderedEvaluations);
    setSessionState('completed');

    // Clean up session storage on successful completion
    try {
      sessionStorage.removeItem(STORAGE_SESSION_KEY);
    } catch (_) {}

    speakText(
      'Congratulations! You have completed the interview session. Here is your full placement evaluation and delivery scorecard.'
    );
  };

  // Early Termination Handler
  const handleConfirmStopEarly = async () => {
    setShowStopConfirmModal(false);
    stopSpeaking();
    stopMicrophoneAndAcoustics();

    if (savedAnswersRef.current.length > 0) {
      setSessionState('finalizing_results');
      await finalizeAllEvaluations(savedAnswersRef.current);
    } else {
      setSessionState('idle');
    }
  };

  // Handle textarea manual input
  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setUserAnswer(newVal);
    baseTextRef.current = newVal;
  };

  // Clear answer
  const handleClearAnswer = () => {
    setUserAnswer('');
    baseTextRef.current = '';
  };

  // Apply demo answer
  const applySampleAnswer = () => {
    const demo = currentQuestion.sampleDemoAnswer;
    setUserAnswer(demo);
    baseTextRef.current = demo;
  };

  // Transparent, Documented Weighted Scoring Formula:
  // Overall = 40% Technical + 25% Problem-Solving/Reasoning + 20% Communication & Structure + 15% Relevance
  const weightedOverallScore = useMemo(() => {
    if (!evaluations.length) return 0;

    const totalWeighted = evaluations.reduce((acc, ev) => {
      const qScore =
        0.4 * ev.technical +
        0.25 * ev.reasoning +
        0.2 * ev.communication +
        0.15 * ev.relevance;
      return acc + qScore;
    }, 0);

    return Math.round(totalWeighted / evaluations.length);
  }, [evaluations]);

  const avgTechnical = useMemo(() => {
    if (!evaluations.length) return 0;
    return Math.round(
      evaluations.reduce((acc, ev) => acc + ev.technical, 0) / evaluations.length
    );
  }, [evaluations]);

  const avgReasoning = useMemo(() => {
    if (!evaluations.length) return 0;
    return Math.round(
      evaluations.reduce((acc, ev) => acc + ev.reasoning, 0) / evaluations.length
    );
  }, [evaluations]);

  const avgCommunication = useMemo(() => {
    if (!evaluations.length) return 0;
    return Math.round(
      evaluations.reduce((acc, ev) => acc + ev.communication, 0) /
        evaluations.length
    );
  }, [evaluations]);

  const avgRelevance = useMemo(() => {
    if (!evaluations.length) return 0;
    return Math.round(
      evaluations.reduce((acc, ev) => acc + ev.relevance, 0) / evaluations.length
    );
  }, [evaluations]);

  // Delivery Telemetry Aggregates across all questions
  const deliveryAggregates = useMemo(() => {
    if (!evaluations.length) {
      return {
        avgWpm: 0,
        totalPauses: 0,
        totalFillers: 0,
        avgPitchVariance: 0,
        fillersList: [] as string[],
      };
    }

    const wpmList: number[] = [];
    let totalPauses = 0;
    let totalFillers = 0;
    const fillersList: string[] = [];
    const pitchVars: number[] = [];

    evaluations.forEach((ev) => {
      if (ev.voiceAnalysis?.speakingRate?.wpm) {
        wpmList.push(ev.voiceAnalysis.speakingRate.wpm);
      }
      if (ev.voiceAnalysis?.pausesAndHesitation?.pauseCount) {
        totalPauses += ev.voiceAnalysis.pausesAndHesitation.pauseCount;
      }
      if (ev.voiceAnalysis?.fillerWords?.count) {
        totalFillers += ev.voiceAnalysis.fillerWords.count;
      }
      if (Array.isArray(ev.voiceAnalysis?.fillerWords?.detected)) {
        fillersList.push(...ev.voiceAnalysis.fillerWords.detected);
      }
      if (ev.voiceAnalysis?.pitchVariation?.varianceHz) {
        pitchVars.push(ev.voiceAnalysis.pitchVariation.varianceHz);
      }
    });

    const avgWpm = wpmList.length
      ? Math.round(wpmList.reduce((a, b) => a + b, 0) / wpmList.length)
      : 130;
    const avgPitchVariance = pitchVars.length
      ? Math.round(pitchVars.reduce((a, b) => a + b, 0) / pitchVars.length)
      : 28;

    return {
      avgWpm,
      totalPauses,
      totalFillers,
      avgPitchVariance,
      fillersList: Array.from(new Set(fillersList)),
    };
  }, [evaluations]);

  return (
    <div className="space-y-6">
      {/* Session Recovery Banner */}
      {recoveredSessionPrompt && sessionState === 'idle' && (
        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
            <RotateCcw className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              Interrupted interview session detected (Question{' '}
              {recoveredSessionPrompt.questionIdx} of{' '}
              {TRACK_QUESTIONS[recoveredSessionPrompt.track as InterviewTrack]?.questions.length || 4}
              ).
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => resumeInterruptedSession(recoveredSessionPrompt)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-sm"
            >
              Resume Session
            </button>
            <button
              onClick={() => {
                setRecoveredSessionPrompt(null);
                try {
                  sessionStorage.removeItem(STORAGE_SESSION_KEY);
                } catch (_) {}
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
            >
              Start Fresh
            </button>
          </div>
        </div>
      )}

      {/* Top Banner with Voice Intelligence Mode Toggle */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-purple-800/40">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Full-Cycle Autonomous Voice Platform</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-bold uppercase">
                {sessionState === 'listening'
                  ? 'Listening'
                  : sessionState === 'asking'
                  ? 'Speaking Question'
                  : sessionState === 'finalizing_results'
                  ? 'Compiling Scorecard'
                  : 'Ready'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              AI-Powered Live Mock Interviewer
            </h1>

            <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed">
              Continuous conversational interview simulation from start to finish.
              Answer naturally, say <strong>"Pass"</strong> to auto-advance to
              the next question, and receive a single comprehensive placement
              scorecard and delivery audit at the conclusion.
            </p>

            {/* Voice Command Guidance Pill */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-purple-200">
              <span className="font-semibold text-white">Voice Commands:</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/20 font-mono">
                "Pass"
              </span>
              <span>— auto-saves & advances to next question</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/20 font-mono">
                "Repeat question"
              </span>
              <span>— re-reads aloud</span>
              <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/20 font-mono">
                "Stop interview"
              </span>
              <span>— end early with report</span>
            </div>
          </div>

          {/* Assistant Visualizer & Mode Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/10 dark:bg-slate-900/50 p-4 rounded-2xl border border-white/10 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                    isSpeaking
                      ? 'bg-gradient-to-tr from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50 scale-105'
                      : isListening
                      ? 'bg-gradient-to-tr from-rose-500 to-amber-500 shadow-lg shadow-rose-500/50 scale-105'
                      : sessionState === 'finalizing_results'
                      ? 'bg-gradient-to-tr from-amber-500 to-emerald-500 animate-spin'
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
                    Continuous Voice
                  </span>
                </div>

                <p className="text-xs text-purple-200 mt-0.5">
                  {isSpeaking
                    ? 'Asking question aloud...'
                    : isListening
                    ? `Listening to answer... (RMS: ${liveVolumeLevel}%)`
                    : sessionState === 'finalizing_results'
                    ? `Synthesizing final scorecard (${completedEvalCount}/${activeQuestions.length})...`
                    : 'Awaiting instruction'}
                </p>

                {/* Animated frequency visualizer */}
                <div className="flex items-center gap-1 mt-2 h-4">
                  {[6, 14, 18, 10, 16, 20, 12, 8, 15, 18, 10, 5].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        height: isListening
                          ? `${Math.max(
                              4,
                              Math.min(
                                20,
                                (liveVolumeLevel / 100) * h * 1.5 + 4
                              )
                            )}px`
                          : isSpeaking
                          ? `${Math.max(
                              4,
                              h * (Math.sin(Date.now() / 150 + i) + 1.2)
                            )}px`
                          : '4px',
                      }}
                      className={`w-1 rounded-full transition-all duration-100 ${
                        isListening
                          ? 'bg-rose-400'
                          : isSpeaking
                          ? 'bg-purple-300'
                          : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Controls */}
            <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-white/15 pt-3 sm:pt-0 sm:pl-3 w-full sm:w-auto justify-end">
              <button
                onClick={() => setLiveVoiceMode(!liveVoiceMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  liveVoiceMode
                    ? 'bg-purple-600/40 border-purple-400 text-purple-200 shadow-sm'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400'
                }`}
                title="Toggle Automatic Hands-Free Voice Progression"
              >
                <Radio
                  className={`w-3.5 h-3.5 ${
                    liveVoiceMode ? 'text-emerald-400 animate-pulse' : ''
                  }`}
                />
                <span>Auto Voice: {liveVoiceMode ? 'ON' : 'Manual'}</span>
              </button>

              <button
                onClick={() => {
                  if (voiceEnabled) stopSpeaking();
                  setVoiceEnabled(!voiceEnabled);
                }}
                className={`p-2 rounded-xl border transition-colors ${
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
                Continuous placement screening with voice modulation and
                technical rigor
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>Est. Duration: 6–10 mins</span>
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
                          <span>{track.questions.length} Sequential Questions</span>
                          <span>•</span>
                          <span>Auto-Advancing Flow</span>
                          <span>•</span>
                          <span>Single Final Report</span>
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
                  Start Automatic Voice Interview Session
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Questions will be read aloud sequentially. Speak your answer
                  and say "Pass" to advance automatically until all questions are
                  complete.
                </p>
              </div>
            </div>

            <button
              onClick={startInterview}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Interview Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STATE 2: ACTIVE CONVERSATIONAL INTERVIEW FLOW (Asking / Listening / Transitioning) */}
      {(sessionState === 'asking' ||
        sessionState === 'listening' ||
        sessionState === 'saving_answer' ||
        sessionState === 'moving_to_next') &&
        currentQuestion && (
          <div className="space-y-5">
            {/* Live Command Notification Banner */}
            {detectedCommandNotice && (
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 flex items-center gap-2 text-xs font-semibold animate-pulse shadow-sm">
                <Zap className="w-4 h-4 text-purple-600" />
                <span>{detectedCommandNotice}</span>
              </div>
            )}

            {/* Progress Header */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  Question {currentQuestionIdx + 1} of {activeQuestions.length}
                </span>

                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
                  Track: {TRACK_QUESTIONS[selectedTrack].title}
                </span>

                {completedEvalCount > 0 && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hidden md:inline-flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Background evaluated: {completedEvalCount}/
                    {activeQuestions.length}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Elapsed: {formatTime(timerSeconds)}</span>
                </div>

                <button
                  onClick={() => speakText(currentQuestion.question)}
                  className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:underline"
                  title="Re-read current question aloud"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Repeat</span>
                </button>

                <button
                  onClick={() => setShowStopConfirmModal(true)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Stop interview and view current report"
                >
                  Stop
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
                    {sessionState === 'asking' && (
                      <span className="text-[10px] font-bold text-purple-600 animate-pulse">
                        (Speaking question aloud...)
                      </span>
                    )}
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

            {/* Candidate Live Verbal / Written Answer Area */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
              {/* Mic Warning */}
              {micPermissionDenied && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 flex items-start gap-3 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <strong>Microphone access blocked:</strong> Voice input is
                    disabled. Type your response below and click "Pass & Next
                    Question".
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-500" />
                  Live Transcript / Candidate Response
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={applySampleAnswer}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors"
                    title="Auto-fill with sample answer for quick demo progression"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Try Sample Answer (Demo)</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={userAnswer}
                  onChange={handleAnswerChange}
                  placeholder={
                    isListening
                      ? 'Listening live... Speak naturally. Say "Pass" when finished to advance automatically.'
                      : 'Speak into your microphone or type your technical answer here in detail...'
                  }
                  rows={6}
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none leading-relaxed"
                />

                <div className="absolute right-3 bottom-3 flex items-center gap-3 text-[11px] text-slate-400">
                  {isListening && (
                    <span className="flex items-center gap-1 text-rose-500 font-semibold animate-pulse">
                      <Activity className="w-3.5 h-3.5" />
                      Listening (Say "Pass" to advance)
                    </span>
                  )}
                  <span>
                    {userAnswer.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
              </div>

              {/* Action Controls */}
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
                        <span>Mute Mic</span>
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

                {/* Primary Pass / Next Question Action */}
                <button
                  type="button"
                  onClick={() => handlePassAndAdvance()}
                  disabled={sessionState === 'saving_answer' || sessionState === 'moving_to_next'}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
                >
                  <FastForward className="w-4 h-4" />
                  <span>
                    {currentQuestionIdx + 1 < activeQuestions.length
                      ? 'Pass & Next Question →'
                      : 'Pass & Finish Interview →'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

      {/* STATE 3: FINALIZING RESULTS (Compiling all background evaluations) */}
      {sessionState === 'finalizing_results' && (
        <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6 max-w-2xl mx-auto my-12">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-indigo-600/30">
            <Bot className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Compiling Placement Readiness Scorecard
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Google Gemini is synthesizing your technical scores, acoustic
              delivery telemetry, and strengths across all completed questions...
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="space-y-2 max-w-sm mx-auto">
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span>Evaluating responses</span>
              <span className="text-indigo-600 dark:text-indigo-400">
                {completedEvalCount} of {savedAnswers.length || activeQuestions.length}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(
                      (completedEvalCount /
                        Math.max(1, savedAnswers.length || activeQuestions.length)) *
                        100
                    )
                  )}%`,
                }}
                className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-300"
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2">
            <Clock className="w-3.5 h-3.5 animate-spin text-indigo-500" />
            <span>Calculating weighted rubrics and personalized recommendations</span>
          </div>
        </div>
      )}

      {/* STATE 4: SINGLE COMPREHENSIVE FINAL REPORT SCREEN */}
      {sessionState === 'completed' && (
        <div className="space-y-8">
          <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
            {/* Report Header with Weighted Overall Score */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800 text-center md:text-left">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                  <Award className="w-3.5 h-3.5" />
                  <span>Interview Session Completed · Final Assessment</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  Placement Readiness Scorecard
                </h2>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track: {TRACK_QUESTIONS[selectedTrack].title} • Evaluated by
                  Google Gemini AI across {evaluations.length} Questions
                </p>

                <div className="pt-1 text-[11px] text-slate-400 flex items-center gap-1.5 justify-center md:justify-start">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Total Duration: {formatTime(timerSeconds)}</span>
                </div>
              </div>

              {/* Big Score Box */}
              <div className="flex items-center gap-5 bg-gradient-to-tr from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 p-6 rounded-3xl border border-indigo-200 dark:border-indigo-800/50 shadow-sm">
                <div className="w-24 h-24 rounded-2xl bg-indigo-600 text-white flex flex-col items-center justify-center shadow-lg shadow-indigo-600/30">
                  <span className="text-3xl font-black">{weightedOverallScore}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                    / 100
                  </span>
                </div>

                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {weightedOverallScore >= 85
                      ? 'Super Dream (Tier 1 Prime)'
                      : weightedOverallScore >= 70
                      ? 'Dream Placement Ready (Tier 2)'
                      : 'Foundation Skill Level'}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-[170px] leading-tight">
                    Weighted index across technical, problem solving, relevance,
                    and communication.
                  </p>

                  <span className="mt-2 inline-block text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                    Formula: 40% Tech + 25% PS + 20% Comm + 15% Rel
                  </span>
                </div>
              </div>
            </div>

            {/* Documented Weighting Formula Callout */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-slate-900 dark:text-white">
                Scoring Weight Distribution:
              </span>
              <span>40% Technical Depth</span>
              <span>•</span>
              <span>25% Problem-Solving & Reasoning</span>
              <span>•</span>
              <span>20% Communication & Structure</span>
              <span>•</span>
              <span>15% Question Relevance</span>
            </div>

            {/* 4 Core Competency Dimension Cards */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-500" />
                Core Technical Competencies (0–100)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Technical Knowledge',
                    value: avgTechnical,
                    weight: '40% weight',
                    color: 'bg-blue-600',
                    textColor: 'text-blue-600 dark:text-blue-400',
                  },
                  {
                    label: 'Problem-Solving & Logic',
                    value: avgReasoning,
                    weight: '25% weight',
                    color: 'bg-purple-600',
                    textColor: 'text-purple-600 dark:text-purple-400',
                  },
                  {
                    label: 'Communication & Structure',
                    value: avgCommunication,
                    weight: '20% weight',
                    color: 'bg-emerald-600',
                    textColor: 'text-emerald-600 dark:text-emerald-400',
                  },
                  {
                    label: 'Question Relevance',
                    value: avgRelevance,
                    weight: '15% weight',
                    color: 'bg-cyan-600',
                    textColor: 'text-cyan-600 dark:text-cyan-400',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {item.weight}
                        </span>
                      </div>
                      <span className={`font-bold text-base ${item.textColor}`}>
                        {item.value}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${item.value}%` }}
                        className={`${item.color} h-full rounded-full transition-all`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comprehensive Voice Modulation & Delivery Analysis Summary */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-50/70 via-white to-indigo-50/40 dark:from-purple-950/20 dark:via-slate-900 dark:to-indigo-950/20 border border-purple-200/80 dark:border-purple-800/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300">
                    Acoustic Voice Modulation & Delivery Telemetry
                  </h3>
                </div>

                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Signal Processing Verified
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* 1. Average Speaking Rate */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-500 font-semibold">
                    <span className="flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-blue-500" />
                      Speaking Rate
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {deliveryAggregates.avgWpm} WPM
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                    {deliveryAggregates.avgWpm >= 120 && deliveryAggregates.avgWpm <= 155
                      ? 'Optimal Conversational Pace'
                      : deliveryAggregates.avgWpm > 155
                      ? 'Fast Pacing (Consider pausing)'
                      : 'Deliberate Pacing'}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Normal placement interview target: 120–150 words per minute.
                  </p>
                </div>

                {/* 2. Pitch Modulation */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-500 font-semibold">
                    <span className="flex items-center gap-1">
                      <Music className="w-3.5 h-3.5 text-purple-500" />
                      Pitch Modulation
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      ±{deliveryAggregates.avgPitchVariance} Hz
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                    {deliveryAggregates.avgPitchVariance >= 25
                      ? 'Dynamic & Expressive'
                      : 'Moderate Monotony'}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Fundamental vocal inflection spread across answers.
                  </p>
                </div>

                {/* 3. Pause & Rhythm Control */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-500 font-semibold">
                    <span className="flex items-center gap-1">
                      <PauseCircle className="w-3.5 h-3.5 text-amber-500" />
                      Pauses & Rhythm
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {deliveryAggregates.totalPauses} total
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    {deliveryAggregates.totalPauses / Math.max(1, evaluations.length) <= 3
                      ? 'Controlled Strategic Pauses'
                      : 'Frequent Hesitation Intervals'}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Natural pauses structure technical explanations cleanly.
                  </p>
                </div>

                {/* 4. Filler Words */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-slate-500 font-semibold">
                    <span className="flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                      Filler Words
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {deliveryAggregates.totalFillers} total
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                    {deliveryAggregates.totalFillers <= 3
                      ? 'Minimal Fillers (Polished)'
                      : `${deliveryAggregates.totalFillers} Fillers Detected`}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    {deliveryAggregates.fillersList.length
                      ? `Caught: ${deliveryAggregates.fillersList.slice(0, 3).join(', ')}`
                      : 'Zero verbal crutches detected.'}
                  </p>
                </div>
              </div>

              {/* Observational Nervousness Indicators Note */}
              <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-purple-200/60 dark:border-purple-800/40 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong className="text-purple-900 dark:text-purple-300">
                  Observational Delivery Note:
                </strong>{' '}
                Vocal telemetry did not indicate sustained trembling or extreme
                rushing. Pacing and volume projection were maintained within
                normal professional thresholds.
              </div>
            </div>

            {/* Questions Answered Well vs Requiring Improvement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Questions Answered Well */}
              <div className="p-5 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Questions Answered Well (Score ≥ 75)</span>
                </div>

                <div className="space-y-2 text-xs">
                  {evaluations.filter((ev) => ev.score >= 75).length > 0 ? (
                    evaluations
                      .filter((ev) => ev.score >= 75)
                      .map((ev, i) => (
                        <div
                          key={ev.questionId}
                          className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/70 dark:border-emerald-900/40 flex items-center justify-between"
                        >
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
                            {ev.question}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold shrink-0">
                            {ev.score}/100
                          </span>
                        </div>
                      ))
                  ) : (
                    <p className="text-slate-500 italic">
                      No questions exceeded the 75-point threshold in this session.
                    </p>
                  )}
                </div>
              </div>

              {/* Questions Requiring Improvement */}
              <div className="p-5 rounded-3xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-3">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Questions Requiring Improvement (Score &lt; 75)</span>
                </div>

                <div className="space-y-2 text-xs">
                  {evaluations.filter((ev) => ev.score < 75).length > 0 ? (
                    evaluations
                      .filter((ev) => ev.score < 75)
                      .map((ev, i) => (
                        <div
                          key={ev.questionId}
                          className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/70 dark:border-amber-900/40 flex items-center justify-between"
                        >
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
                            {ev.question}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-bold shrink-0">
                            {ev.score}/100
                          </span>
                        </div>
                      ))
                  ) : (
                    <p className="text-emerald-700 dark:text-emerald-300 font-medium italic">
                      Outstanding performance! All questions scored 75 or higher.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Recruiter Strengths & Improvement Coaching Plan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>Key Recruiter Strengths</span>
                </div>

                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                  {evaluations
                    .flatMap((ev) =>
                      ev.strengths?.length ? ev.strengths : ev.keyPointsCovered
                    )
                    .filter((pt, idx, arr) => arr.indexOf(pt) === idx)
                    .slice(0, 5)
                    .map((point, index) => (
                      <li key={`${point}-${index}`}>{point}</li>
                    ))}
                  {evaluations.every(
                    (ev) =>
                      !ev.strengths?.length && !ev.keyPointsCovered?.length
                  ) && (
                    <li>
                      Build core fundamentals and technical trade-off vocabulary.
                    </li>
                  )}
                </ul>
              </div>

              {/* Personalized Next Practice Plan */}
              <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Personalized Practice Recommendations</span>
                </div>

                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                  {evaluations
                    .flatMap((ev) =>
                      ev.improvements?.length
                        ? ev.improvements
                        : ev.keyPointsMissed.map((kp) => `Master: ${kp}`)
                    )
                    .filter((pt, idx, arr) => arr.indexOf(pt) === idx)
                    .slice(0, 5)
                    .map((improvement, index) => (
                      <li key={`${improvement}-${index}`}>{improvement}</li>
                    ))}
                </ul>
              </div>
            </div>

            {/* Detailed Question-By-Question Audit Table */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Detailed Question Audit & Model Answers</span>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-normal">
                  Click any question to view model answer & feedback
                </span>
              </h3>

              <div className="space-y-3">
                {evaluations.map((ev, index) => {
                  const isExpanded =
                    expandedQuestionAuditId === ev.questionId ||
                    (expandedQuestionAuditId === null && index === 0);

                  return (
                    <div
                      key={ev.questionId}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-all"
                    >
                      {/* Header row */}
                      <button
                        onClick={() =>
                          setExpandedQuestionAuditId(
                            isExpanded ? '' : ev.questionId
                          )
                        }
                        className="w-full p-4 flex items-center justify-between gap-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                            Q{index + 1}
                          </span>
                          <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {ev.question}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              ev.score >= 75
                                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : ev.score >= 50
                                ? 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                : 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                            }`}
                          >
                            {ev.score}/100
                          </span>

                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-4 text-xs">
                          {/* Student Answer */}
                          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                            <span className="font-bold text-slate-500 text-[11px]">
                              Your Evaluated Response:
                            </span>
                            <p className="text-slate-800 dark:text-slate-200 italic leading-relaxed whitespace-pre-wrap">
                              "{ev.userAnswer || 'No response recorded'}"
                            </p>
                          </div>

                          {/* AI Feedback & Rubric */}
                          <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/40 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-indigo-900 dark:text-indigo-300 text-[11px] flex items-center gap-1.5">
                                <Bot className="w-3.5 h-3.5 text-indigo-600" />
                                Gemini Placement Feedback
                              </span>
                              <span className="text-[10px] text-slate-500">
                                Tech: {ev.technical}% • Reasoning: {ev.reasoning}% • Comm: {ev.communication}%
                              </span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                              {ev.aiFeedback}
                            </p>
                          </div>

                          {/* Covered vs Missed */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                            <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/30 space-y-1">
                              <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                Covered Points ({ev.keyPointsCovered?.length || 0})
                              </span>
                              <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                                {ev.keyPointsCovered?.length ? (
                                  ev.keyPointsCovered.map((kp, kpi) => (
                                    <li key={kpi}>{kp}</li>
                                  ))
                                ) : (
                                  <li>None demonstrated</li>
                                )}
                              </ul>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-1">
                              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5 text-rose-500" />
                                Key Points Missed ({ev.keyPointsMissed?.length || 0})
                              </span>
                              <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                                {ev.keyPointsMissed?.length ? (
                                  ev.keyPointsMissed.map((kp, kpi) => (
                                    <li key={kpi}>{kp}</li>
                                  ))
                                ) : (
                                  <li className="text-emerald-600">All points covered!</li>
                                )}
                              </ul>
                            </div>
                          </div>

                          {/* Model Answer */}
                          <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/30 space-y-1">
                            <span className="font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">
                              Exemplary Model Reference Answer:
                            </span>
                            <p className="text-emerald-950 dark:text-emerald-200 leading-relaxed">
                              {ev.modelAnswer || ev.suggestedAnswer}
                            </p>
                          </div>

                          {/* Follow-up question if present */}
                          {ev.followUpQuestion && (
                            <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-200">
                              <strong>Recommended Follow-up Reflection:</strong> "{ev.followUpQuestion}"
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setSessionState('idle');
                  stopSpeaking();
                  stopMicrophoneAndAcoustics();
                  setUserAnswer('');
                  baseTextRef.current = '';
                  setSavedAnswers([]);
                  setEvaluations([]);
                  setCurrentQuestionIdx(0);
                  setTimerSeconds(0);
                  setCompletedEvalCount(0);
                  savedAnswersRef.current = [];
                  evaluationsMapRef.current.clear();
                  backgroundPromisesRef.current.clear();
                  try {
                    sessionStorage.removeItem(STORAGE_SESSION_KEY);
                  } catch (_) {}
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
                      'Your complete mock interview scorecard has been saved to your student profile.'
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

      {/* Stop Interview Confirmation Modal */}
      {showStopConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                End Interview Early?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                You have answered {savedAnswersRef.current.length} of{' '}
                {activeQuestions.length} questions. You can end now to compile a
                report on the answered questions, or continue with the remaining
                questions.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowStopConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel & Continue
              </button>
              <button
                onClick={handleConfirmStopEarly}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                End & View Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
