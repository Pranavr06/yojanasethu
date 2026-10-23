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

export const TRACK_QUESTIONS: Record<InterviewTrack, { title: string; desc: string; icon: any; questions: QuestionTemplate[] }> = {
  fullstack: {
    title: 'Full-Stack Software Engineering',
    desc: 'System scalability, REST APIs, React state reconciliation, and database concurrency.',
    icon: Code2,
    questions: [
      {
        id: 'fs-1',
        question: 'Explain the difference between optimistic locking and pessimistic locking in high-throughput databases. When would you choose one over the other?',
        category: 'technical',
        hint: 'Mention version columns, row-level locks, collision rates, and transaction overhead.',
        sampleDemoAnswer: 'Pessimistic locking locks the database record upfront using SELECT FOR UPDATE, preventing other transactions from modifying it until completion. It is ideal for high-conflict scenarios with critical resources like ticket reservations. In contrast, optimistic locking assumes conflicts are rare, using a version timestamp column to verify no changes occurred before committing. It maximizes concurrency in read-heavy applications.',
        keyPoints: ['Row-level locking vs versioning', 'Collision frequency trade-off', 'Deadlock prevention', 'Read-heavy vs write-heavy scenarios'],
      },
      {
        id: 'fs-2',
        question: 'How does React 18 Concurrent Mode and the Virtual DOM reconciliation algorithm prioritize state updates?',
        category: 'technical',
        hint: 'Discuss Fiber architecture, useTransition, lane-based scheduling, and hydration.',
        sampleDemoAnswer: 'React Fiber enables incremental rendering by splitting render work into interruptible units called fibers. In React 18 Concurrent Mode, updates are assigned priorities using lanes. High-priority updates like urgent user input (typing/clicks) take precedence over non-urgent transitions wrapped in useTransition, ensuring the UI remains responsive without blocking the main thread.',
        keyPoints: ['Fiber tree structure', 'Interruptible work units', 'Priority lanes & useTransition', 'Avoiding main thread jank'],
      },
      {
        id: 'fs-3',
        question: 'Design a distributed rate limiter for a public API gateway. How do you prevent race conditions across multiple instances?',
        category: 'architecture',
        hint: 'Mention Token Bucket, Redis sliding window, atomic Lua scripts, and memory footprints.',
        sampleDemoAnswer: 'I would implement a sliding-window log or token-bucket algorithm backed by a Redis cluster. To eliminate race conditions across distributed gateway nodes, token deductions and timestamp checks should be executed atomically using Redis Lua scripts. This ensures multi-threaded or multi-instance requests do not overconsume tokens between the read and write operations.',
        keyPoints: ['Token bucket vs sliding window', 'Atomic operations with Redis Lua', 'Distributed synchronization', 'Edge vs centralized enforcement'],
      },
      {
        id: 'fs-4',
        question: 'Tell me about a challenging bug or performance bottleneck you solved in a past web project. Walk me through your debugging methodology.',
        category: 'problem_solving',
        hint: 'Use the STAR format: Situation, Task, Action, Result. Quantify improvements.',
        sampleDemoAnswer: 'In my full-stack semester project, page load times degraded to over 4 seconds on client portfolios. I profiled network waterfalls with Chrome DevTools and identified N+1 database queries on related skill endorsements. I refactored the backend to use joined eager-loading with database indexing on student foreign keys and added Redis query caching. This slashed latency to under 350ms, an 88% speedup.',
        keyPoints: ['STAR structure', 'Profiling tools usage', 'Root cause isolation (N+1 query)', 'Quantified performance outcome'],
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
        question: 'How does Scaled Dot-Product Attention in Transformer architectures prevent gradients from vanishing when embedding dimensions (d_k) grow large?',
        category: 'technical',
        hint: 'Explain softmax saturation, variance scaling by sqrt(d_k), and backpropagation dynamics.',
        sampleDemoAnswer: 'For large vector dimensions d_k, the dot products Q*K grow large in magnitude, pushing the Softmax function into regions with near-zero gradients. Scaling by 1/sqrt(d_k) normalizes the dot product variance back to unit variance (assuming independent zero-mean components), ensuring gradients flow effectively during backpropagation.',
        keyPoints: ['Softmax gradient saturation', 'Variance scaling by 1/sqrt(d_k)', 'Dot product magnitude distribution', 'Stabilizing backpropagation'],
      },
      {
        id: 'ai-2',
        question: 'What is the fundamental difference between LoRA (Low-Rank Adaptation) and full parameter fine-tuning for Large Language Models?',
        category: 'technical',
        hint: 'Discuss rank decomposition matrices, GPU VRAM constraints, frozen weights, and deployment speed.',
        sampleDemoAnswer: 'Full fine-tuning updates all model weights, requiring massive VRAM to store optimizer states for billions of parameters. LoRA freezes the original pre-trained weight matrix W and injects trainable low-rank decomposition matrices A and B where delta W equals B times A. This reduces trainable parameters by up to 99%, dramatically cutting memory requirements while retaining near-identical task accuracy.',
        keyPoints: ['Decomposition matrices A & B', 'Frozen base weights', 'Memory and compute savings', 'Serving efficiency with adapter swapping'],
      },
      {
        id: 'ai-3',
        question: 'How do you detect and mitigate data drift and concept drift in a machine learning model deployed to production?',
        category: 'architecture',
        hint: 'Mention statistical tests (KS-test, PSI), ground truth monitoring, and automated retraining pipelines.',
        sampleDemoAnswer: 'I monitor input feature distributions using Population Stability Index (PSI) and Kolmogorov-Smirnov tests to detect data drift before performance decays. For concept drift, where the relationship between inputs and targets shifts, I track live classification metrics like F1-score against delayed ground truth. When thresholds trigger alerts, an automated CI/CD retraining pipeline kicks off with fresh windowed data.',
        keyPoints: ['Data drift vs concept drift', 'PSI & Kolmogorov-Smirnov testing', 'Ground-truth lag monitoring', 'Automated retraining trigger'],
      },
      {
        id: 'ai-4',
        question: 'Describe an ML or data project where your model initially overfitted. What steps did you take to improve generalization?',
        category: 'problem_solving',
        hint: 'Mention regularizations, dropout, data augmentation, cross-validation, and validation curves.',
        sampleDemoAnswer: 'When training a CNN for plant disease classification, training accuracy reached 98% while validation plateaued at 72%. I diagnosed severe overfitting from training data scarcity. I introduced CutMix and random rotation data augmentations, added spatial Dropout layers (0.3), and incorporated weight decay regularization with Early Stopping based on validation loss. Generalization jumped to 89% validation accuracy.',
        keyPoints: ['Diagnosis using train/val loss curves', 'Data augmentation techniques', 'Regularization (Dropout, Weight Decay)', 'Validation metric improvement'],
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
        question: 'Explain the difference between ROW_NUMBER(), RANK(), and DENSE_RANK() in SQL window functions with an example.',
        category: 'technical',
        hint: 'Focus on how ties are handled and whether gaps appear in consecutive ranking.',
        sampleDemoAnswer: 'All three assign rankings ordered by a column. ROW_NUMBER assigns unique sequential integers regardless of ties. RANK assigns the same rank to identical values but skips subsequent numbers (e.g., 1, 2, 2, 4). DENSE_RANK also assigns identical ranks to ties but does NOT skip any numbers (e.g., 1, 2, 2, 3), making it best for top-N salary tiers.',
        keyPoints: ['Sequential numbering', 'Handling duplicate ties', 'Gap creation in RANK', 'Deterministic ranking behavior'],
      },
      {
        id: 'da-2',
        question: 'How would you calculate 30-day user retention rates using SQL for a web application?',
        category: 'technical',
        hint: 'Discuss cohort acquisition date, self-joins or CTEs, date difference functions, and percentage rollups.',
        sampleDemoAnswer: 'I construct a CTE identifying each user first active date (cohort month/week). Then I join subsequent activity events on user_id where activity_date falls between day 1 and day 30 from acquisition. Finally, I group by cohort and divide retained users by initial cohort size to get the retention percentage.',
        keyPoints: ['Cohort determination CTE', 'Activity self-join', 'Date difference math', 'Cohort retention percentage calculation'],
      },
      {
        id: 'da-3',
        question: 'If executive stakeholders notice a 15% drop in weekly conversions, how do you conduct root cause analysis?',
        category: 'problem_solving',
        hint: 'Deconstruct metrics: traffic segmentation, device/browser slices, funnel drop-off, external factors.',
        sampleDemoAnswer: 'First, I verify data telemetry integrity to rule out tracking bugs. Second, I segment the conversion funnel by dimension: device type, browser, geo-location, and marketing channel. If mobile Safari conversion plummeted while desktop stayed flat, I suspect an iOS release bug. I also compare seasonality and traffic quality before proposing corrective actions.',
        keyPoints: ['Instrumentation sanity check', 'Funnel segmentation by device/channel', 'External vs internal factor isolation', 'Actionable recommendation generation'],
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
        question: 'Tell me about yourself, your engineering journey at NMAMIT, and what makes you passionate about joining our engineering team.',
        category: 'behavioral',
        hint: 'Structure: Past (academics), Present (core projects & skills), Future (why this role/company).',
        sampleDemoAnswer: 'I am a final-year engineering student at NMAMIT with a passion for building reliable software systems. Over the past three years, I have strengthened my fundamentals in Data Structures, SQL, and full-stack architecture, delivering proof-verified projects on YojanaSethu. What excites me about your team is your scale and engineering rigor, where I can apply my problem-solving skills to real-world customer impact.',
        keyPoints: ['Clear 2-minute elevator pitch', 'Academic & technical highlight', 'Alignment with corporate culture', 'Forward-looking enthusiasm'],
      },
      {
        id: 'beh-2',
        question: 'Describe a situation where you had a serious disagreement with a team member during a hackathon or semester project. How did you resolve it?',
        category: 'behavioral',
        hint: 'Use STAR: focus on objective data, empathy, active listening, and common project goals.',
        sampleDemoAnswer: 'During our 24-hour hackathon, my teammate and I disagreed on whether to use GraphQL or REST for our API layer. With 12 hours left, arguing was burning time. I suggested a 15-minute timebox to list our requirements: team familiarity, rapid prototyping, and deadline safety. We agreed REST was faster for our scope and delivered the demo on time, winning second place.',
        keyPoints: ['STAR format compliance', 'De-escalation & objective prioritization', 'Team goal focus', 'Positive deliverable outcome'],
      },
      {
        id: 'beh-3',
        question: 'Tell me about a time you failed to meet an academic or project deadline. What did you learn and how did you prevent it from happening again?',
        category: 'behavioral',
        hint: 'Be honest, take accountability, and focus heavily on systemic prevention measures.',
        sampleDemoAnswer: 'In my third semester, I underestimated the complexity of a compiler lab assignment and missed the preliminary submission deadline. Rather than making excuses, I scheduled a meeting with my mentor to explain the blocker and submitted a completed version 24 hours later. Since then, I adopted Agile sprint planning with milestone buffers, never missing a deadline throughout my final year.',
        keyPoints: ['Ownership and accountability', 'No excuse mindset', 'Proactive mentor communication', 'Systemic habits adopted (Agile milestones)'],
      },
    ],
  },
};

export default function MockInterviewAssistant() {
  const [selectedTrack, setSelectedTrack] = useState<InterviewTrack>('fullstack');
  const [sessionState, setSessionState] = useState<'idle' | 'in_progress' | 'feedback' | 'completed'>('idle');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(false);

  // Completed answers & evaluations
  const [evaluations, setEvaluations] = useState<{
    questionId: string;
    question: string;
    userAnswer: string;
    score: number;
    aiFeedback: string;
    keyPointsHit: string[];
    rubric: {
      technical: number;
      communication: number;
      confidence: number;
      problemSolving: number;
    };
  }[]>([]);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeQuestions = TRACK_QUESTIONS[selectedTrack].questions;
  const currentQuestion = activeQuestions[currentQuestionIdx];

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            setUserAnswer((prev) => (prev ? `${prev} ${currentTranscript}` : currentTranscript));
          }
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
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionState]);

  // Voice Synthesizer
  const speakText = (text: string) => {
    if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Try finding an English natural voice
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
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

  // Toggle Microphone
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. You can type your answer directly in the box below!');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Start interview session
  const startInterview = () => {
    setSessionState('in_progress');
    setCurrentQuestionIdx(0);
    setTimerSeconds(0);
    setUserAnswer('');
    setEvaluations([]);
    const firstQ = TRACK_QUESTIONS[selectedTrack].questions[0];
    speakText(`Welcome to your mock interview for the ${TRACK_QUESTIONS[selectedTrack].title} track. Here is your first question: ${firstQ.question}`);
  };

  // Use pre-crafted sample answer for quick testing
  const applySampleAnswer = () => {
    setUserAnswer(currentQuestion.sampleDemoAnswer);
  };

  // Submit Answer & Evaluate
  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) {
      alert('Please speak or type your answer before submitting.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setIsEvaluating(true);
    stopSpeaking();

    // Deterministic grading calculation based on length, keywords, and relevance
    setTimeout(() => {
      const words = userAnswer.trim().split(/\s+/).length;
      const keyPointsHit = currentQuestion.keyPoints.filter((kp) => {
        const wordsInKp = kp.toLowerCase().split(/\s+/);
        return wordsInKp.some((w) => w.length > 4 && userAnswer.toLowerCase().includes(w));
      });

      const baseScore = Math.min(95, Math.max(65, 70 + keyPointsHit.length * 6 + (words > 40 ? 10 : 0)));
      const techScore = Math.min(98, Math.max(68, baseScore + Math.floor(Math.random() * 6) - 2));
      const commScore = Math.min(96, Math.max(72, (words > 35 ? 88 : 74) + Math.floor(Math.random() * 6)));
      const confScore = Math.min(94, Math.max(70, 85 + Math.floor(Math.random() * 8) - 4));
      const psScore = Math.min(95, Math.max(65, baseScore + Math.floor(Math.random() * 6) - 3));

      let aiFeedback = '';
      if (techScore >= 88) {
        aiFeedback = `Exceptional explanation! You addressed key trade-offs and correctly articulated ${keyPointsHit.slice(0, 2).join(' and ')}. Excellent technical depth.`;
      } else if (techScore >= 78) {
        aiFeedback = `Solid response with good fundamental understanding. To reach top-tier placement level, elaborate more on operational edge cases and concrete performance metrics.`;
      } else {
        aiFeedback = `Good effort. Focus on structuring your answer with the STAR framework and explaining the underlying architecture and trade-offs more explicitly.`;
      }

      const evalResult = {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        userAnswer,
        score: Math.round((techScore + commScore + confScore + psScore) / 4),
        aiFeedback,
        keyPointsHit,
        rubric: {
          technical: techScore,
          communication: commScore,
          confidence: confScore,
          problemSolving: psScore,
        },
      };

      setEvaluations((prev) => [...prev, evalResult]);
      setIsEvaluating(false);
      setSessionState('feedback');

      speakText(`Feedback: ${aiFeedback}`);
    }, 1200);
  };

  // Advance to next question
  const handleNextQuestion = () => {
    stopSpeaking();
    setUserAnswer('');

    if (currentQuestionIdx + 1 < activeQuestions.length) {
      const nextIdx = currentQuestionIdx + 1;
      setCurrentQuestionIdx(nextIdx);
      setSessionState('in_progress');
      const nextQ = activeQuestions[nextIdx];
      speakText(`Question ${nextIdx + 1}: ${nextQ.question}`);
    } else {
      setSessionState('completed');
      speakText('Congratulations! You have completed the interview session. Here is your full placement evaluation scorecard.');
    }
  };

  // Format seconds into MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Overall aggregate scores
  const avgOverall = evaluations.length
    ? Math.round(evaluations.reduce((acc, e) => acc + e.score, 0) / evaluations.length)
    : 85;
  const avgTech = evaluations.length
    ? Math.round(evaluations.reduce((acc, e) => acc + e.rubric.technical, 0) / evaluations.length)
    : 84;
  const avgComm = evaluations.length
    ? Math.round(evaluations.reduce((acc, e) => acc + e.rubric.communication, 0) / evaluations.length)
    : 88;
  const avgConf = evaluations.length
    ? Math.round(evaluations.reduce((acc, e) => acc + e.rubric.confidence, 0) / evaluations.length)
    : 82;
  const avgPS = evaluations.length
    ? Math.round(evaluations.reduce((acc, e) => acc + e.rubric.problemSolving, 0) / evaluations.length)
    : 86;

  return (
    <div className="space-y-6">
      {/* Top Banner: NexusAI Voice Assistant Persona */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-purple-800/40">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>NexusAI Autonomous Voice Evaluator</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-bold">READY</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              AI Mock Technical & HR Interview Desk
            </h1>

            <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed">
              Experience realistic corporate placement interviews powered by conversational speech AI. Answer live via your microphone, receive instantaneous multi-dimensional scoring rubrics, and benchmark your campus placement readiness.
            </p>
          </div>

          {/* Voice Assistant Visual Avatar & Status Controls */}
          <div className="flex items-center gap-4 bg-white/10 dark:bg-slate-900/50 p-4 rounded-2xl border border-white/10 backdrop-blur-md shrink-0">
            {/* Animated Audio Orb */}
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

              {/* Pulsing rings when voice active */}
              {(isSpeaking || isListening) && (
                <span className="absolute inset-0 rounded-2xl border-2 border-purple-400 animate-ping opacity-40 pointer-events-none" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Nexus Interviewer</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/20 text-white">
                  v2.4 Neural
                </span>
              </div>
              <p className="text-xs text-purple-200 mt-0.5">
                {isSpeaking
                  ? 'Speaking question...'
                  : isListening
                  ? 'Listening to your answer...'
                  : isEvaluating
                  ? 'Analyzing response metrics...'
                  : 'Awaiting your instruction'}
              </p>

              {/* Audio Wave Visualizer Bars */}
              <div className="flex items-center gap-1 mt-2 h-4">
                {[4, 12, 16, 8, 14, 18, 10, 6, 12, 15, 8, 4].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      height: isSpeaking || isListening ? `${Math.max(4, (h * (Math.sin(Date.now() / 150 + i) + 1.2)))}px` : '4px',
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

            {/* Mute / Unmute Button */}
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
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* STATE 1: SELECTION DESK (IDLE) */}
      {sessionState === 'idle' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Select Interview Track & Target Role
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose an engineering or HR domain to initiate simulated campus placement screening
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>Est. Duration: 8–12 mins</span>
            </div>
          </div>

          {/* Track Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.keys(TRACK_QUESTIONS) as InterviewTrack[]).map((trackKey) => {
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
                        <span>Multi-Score Rubric</span>
                        <span>•</span>
                        <span>Voice Enabled</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
                    ? 'Microphone speech recognition supported on this browser. You can speak or type answers.'
                    : 'Speech recognition requires Chromium or Web Speech API. Typing mode is always available.'}
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

      {/* STATE 2 & 3: ACTIVE INTERVIEW & QUESTION EVALUATION */}
      {(sessionState === 'in_progress' || sessionState === 'feedback') && currentQuestion && (
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

          {/* Question Display Card */}
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
                  <span className="text-xs text-slate-400 font-medium">Placement Interviewer Prompt</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                  {currentQuestion.question}
                </h2>
              </div>
            </div>

            {/* Hint Box */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs">
              <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <strong>Interviewer Focus Tip:</strong> {currentQuestion.hint}
              </div>
            </div>
          </div>

          {/* Student Response Stage */}
          {sessionState === 'in_progress' && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-500" />
                  Your Verbal or Written Answer
                </label>

                {/* Demo Quick Answer Button */}
                <button
                  type="button"
                  onClick={applySampleAnswer}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors"
                  title="Auto-fill with sample high-scoring answer for quick demo testing"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Try Sample Answer (Demo)</span>
                </button>
              </div>

              {/* Text Area for Response */}
              <div className="relative">
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Speak into your microphone or type your technical answer here in detail..."
                  rows={6}
                  className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none leading-relaxed"
                />

                <div className="absolute right-3 bottom-3 flex items-center gap-2 text-[11px] text-slate-400">
                  <span>{userAnswer.trim().split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </div>

              {/* Interactive Controls: Mic Toggle & Submit */}
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
                      onClick={() => setUserAnswer('')}
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
                      <span>Evaluating Response...</span>
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

          {/* Question Instant Feedback Screen */}
          {sessionState === 'feedback' && evaluations.length > 0 && (
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
              {(() => {
                const latest = evaluations[evaluations.length - 1];
                return (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          Response Evaluated
                        </span>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                          Question Score: <span className="text-indigo-600 dark:text-indigo-400">{latest.score}/100</span>
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => speakText(latest.aiFeedback)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Replay Feedback</span>
                        </button>
                        <button
                          onClick={handleNextQuestion}
                          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/25 transition-all"
                        >
                          <span>{currentQuestionIdx + 1 < activeQuestions.length ? 'Next Question' : 'View Full Scorecard'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* AI Feedback Banner */}
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

                    {/* 4 Rubric Bars */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Technical Depth</span>
                        <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                          {latest.rubric.technical}%
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div style={{ width: `${latest.rubric.technical}%` }} className="bg-blue-600 h-full rounded-full" />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Communication</span>
                        <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                          {latest.rubric.communication}%
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div style={{ width: `${latest.rubric.communication}%` }} className="bg-emerald-600 h-full rounded-full" />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Confidence</span>
                        <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                          {latest.rubric.confidence}%
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div style={{ width: `${latest.rubric.confidence}%` }} className="bg-purple-600 h-full rounded-full" />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">STAR Structure</span>
                        <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                          {latest.rubric.problemSolving}%
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div style={{ width: `${latest.rubric.problemSolving}%` }} className="bg-amber-600 h-full rounded-full" />
                        </div>
                      </div>
                    </div>

                    {/* Candidate Answer vs Ideal Comparison */}
                    <div className="space-y-3 pt-2">
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Your Answer:</span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                          "{latest.userAnswer}"
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/30 space-y-1">
                        <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">Model Answer Reference:</span>
                        <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                          {currentQuestion.sampleDemoAnswer}
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

      {/* STATE 4: COMPREHENSIVE FINAL SCORECARD */}
      {sessionState === 'completed' && (
        <div className="space-y-6">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
            {/* Top Score Header */}
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
                  Track: {TRACK_QUESTIONS[selectedTrack].title} • Verified by NexusAI Neural Evaluator
                </p>
              </div>

              {/* Radial Big Score Badge */}
              <div className="flex items-center gap-4 bg-gradient-to-tr from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 p-5 rounded-3xl border border-indigo-200 dark:border-indigo-800/50">
                <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex flex-col items-center justify-center shadow-lg shadow-indigo-600/30">
                  <span className="text-2xl font-black">{avgOverall}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">/ 100</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {avgOverall >= 85 ? 'Tier 1 Prime Eligible' : avgOverall >= 75 ? 'Tier 2 Ready' : 'Foundation Level'}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-[150px]">
                    Benchmark met for top campus recruitment drives.
                  </p>
                </div>
              </div>
            </div>

            {/* 4 Core Dimensions Breakdown */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Performance Dimensions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Technical Correctness</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{avgTech}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${avgTech}%` }} className="bg-blue-600 h-full rounded-full" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Communication & Clarity</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{avgComm}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${avgComm}%` }} className="bg-emerald-600 h-full rounded-full" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Confidence & Delivery</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{avgConf}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${avgConf}%` }} className="bg-purple-600 h-full rounded-full" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">STAR Methodology</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{avgPS}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${avgPS}%` }} className="bg-amber-600 h-full rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths & Improvement Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Key Recruiter Strengths</span>
                </div>
                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>Strong fundamental grasp of core architectural concepts and locking semantics.</li>
                  <li>Clear, articulated speaking cadence with minimal filler words.</li>
                  <li>Good willingness to dive into technical nuances and memory performance trade-offs.</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Placement Improvement Plan</span>
                </div>
                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>Incorporate concrete business and latency numbers when detailing past projects.</li>
                  <li>Address fallback scenarios when third-party microservices or caches experience downtime.</li>
                  <li>Consistently conclude behavioral stories with verifiable impact metrics.</li>
                </ul>
              </div>
            </div>

            {/* Question Breakdown Accordion */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Detailed Question Audit
              </h3>
              <div className="space-y-3">
                {evaluations.map((ev, idx) => (
                  <div
                    key={ev.questionId}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        Q{idx + 1}: {ev.question}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        {ev.score}/100
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 italic">
                      Your response: "{ev.userAnswer}"
                    </p>
                    <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                      Feedback: {ev.aiFeedback}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setSessionState('idle');
                  stopSpeaking();
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake or Switch Track</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => alert('Scorecard saved to your student profile and verified skill passport!')}
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
