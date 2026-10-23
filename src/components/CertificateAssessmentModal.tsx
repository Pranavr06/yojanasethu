'use client';

import React, { useState, useEffect } from 'react';
import {
  AssessmentSubject,
  AssessmentQuestion,
  CertificateAssessment,
} from '@/types';
import {
  BrainCircuit,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Send,
  Loader2,
  X,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  submissionId: string;
  studentId: string;
  subject: AssessmentSubject;
  subjectLabel: string;
  certificateTitle: string;
  onAssessmentCompleted: (assessment: CertificateAssessment) => void;
}

export default function CertificateAssessmentModal({
  isOpen,
  onClose,
  submissionId,
  studentId,
  subject,
  subjectLabel,
  certificateTitle,
  onAssessmentCompleted,
}: Props) {
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Exam taking state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes (600s)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

  // Result state
  const [result, setResult] = useState<CertificateAssessment | null>(null);

  // Fetch questions when opened
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);
    setErrorMsg(null);
    setResult(null);
    setSelectedAnswers({});
    setCurrentIndex(0);
    setTimeLeft(600);

    fetch(`/api/assessment?subject=${encodeURIComponent(subject)}&submission_id=${encodeURIComponent(submissionId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.error) {
          setErrorMsg(data.error);
        } else if (data.questions) {
          setQuestions(data.questions);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setErrorMsg('Failed to load assessment questions. Please check network connectivity.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, subject, submissionId]);

  // Exam Countdown Timer
  useEffect(() => {
    if (!isOpen || result || loading || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitAnswers();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, result, loading, timeLeft]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (result) return; // already graded
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitAnswers = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setConfirmSubmitOpen(false);

    try {
      const answersPayload = questions.map((q) => ({
        questionId: q.id,
        selectedOptionIndex: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : -1,
      }));

      const res = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_id: submissionId,
          student_id: studentId,
          subject,
          answers: answersPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit assessment answers.');
      }

      setResult(data.assessment);
      onAssessmentCompleted(data.assessment);
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission error. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-950/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <BrainCircuit className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  Skill Assessment: {subjectLabel}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
                  Verification Exam for: <span className="font-semibold text-slate-700 dark:text-slate-300">{certificateTitle}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!result && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold border transition-colors ${
                  timeLeft < 120
                    ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 border-rose-300 animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{formattedTime}</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {!result && questions.length > 0 && (
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">
                Loading practice assessment questions and rubric...
              </p>
            </div>
          ) : errorMsg && !result ? (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Assessment Error</span>
              </div>
              <p>{errorMsg}</p>
            </div>
          ) : result ? (
            /* Post-Evaluation Report */
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Score Hero Card */}
              <div
                className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left ${
                  result.score_percentage >= 60.0
                    ? 'bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800'
                    : 'bg-gradient-to-br from-amber-50 via-white to-rose-50 dark:from-amber-950/40 dark:via-slate-900 dark:to-rose-950/30 border-amber-200 dark:border-amber-800'
                }`}
              >
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/80 dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Attempt {result.attempt_number} of {result.max_attempts}</span>
                  </span>

                  <h4 className="text-xl font-black text-slate-900 dark:text-white pt-1">
                    {result.score_percentage >= 60.0
                      ? 'Assessment Completed Successfully'
                      : 'Assessment Completed — Mentor Review Pending'}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md">
                    {result.score_percentage >= 60.0
                      ? 'Your assessment meets the recommended verification benchmark. Routed to your Faculty Mentor for credential endorsement.'
                      : 'Your assessment score has been recorded and submitted to your Faculty Mentor for evaluation and guidance.'}
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-sm shrink-0 min-w-[130px]">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {result.score_percentage}%
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">
                    {result.correct_answers} / {result.total_questions} Correct
                  </span>
                </div>
              </div>

              {/* Status Notice */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-300 space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Institutional Verification Policy</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Assessment results do not automatically verify credentials. Your certificate file, score percentage, and rubric comparison are now waiting in your assigned Faculty Mentor&apos;s Review Queue.
                </p>
              </div>

              {/* Question-by-Question Review Breakdown */}
              <div className="space-y-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Question Review & Explanations
                </h5>

                <div className="space-y-3">
                  {result.answers.map((ans, idx) => (
                    <div
                      key={ans.questionId}
                      className={`p-4 rounded-2xl border text-xs space-y-2.5 ${
                        ans.isCorrect
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-bold text-slate-900 dark:text-white">
                          <span className="text-slate-400 mr-1.5">Q{idx + 1}.</span>
                          {ans.questionText}
                        </div>
                        {ans.isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Correct</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 dark:text-rose-400 shrink-0">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Incorrect</span>
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 pl-4 border-l-2 border-slate-200 dark:border-slate-700 text-[11px]">
                        <p className="text-slate-600 dark:text-slate-400">
                          <strong>Your Answer:</strong>{' '}
                          <span className={ans.isCorrect ? 'text-emerald-700 dark:text-emerald-300 font-semibold' : 'text-rose-700 dark:text-rose-300'}>
                            {ans.selectedOptionIndex >= 0 ? ans.options[ans.selectedOptionIndex] : 'No answer provided'}
                          </span>
                        </p>
                        {!ans.isCorrect && (
                          <p className="text-emerald-800 dark:text-emerald-300 font-medium">
                            <strong>Correct Answer:</strong> {ans.options[ans.correctOptionIndex]}
                          </p>
                        )}
                        <p className="text-slate-500 dark:text-slate-400 pt-1 text-[10px] italic">
                          Rationale: {ans.explanation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : currentQ ? (
            /* Active Question Card */
            <div className="space-y-5">
              {/* Question Navigation Bubbles */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {questions.map((q, idx) => {
                  const isAnswered = selectedAnswers[q.id] !== undefined;
                  const isCurrent = idx === currentIndex;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400'
                          : isAnswered
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Question Body */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                  {currentQ.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentQ.id] === optIdx;

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(currentQ.id, optIdx)}
                      className={`w-full p-4 rounded-2xl border text-left text-xs font-medium transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500 text-indigo-900 dark:text-indigo-200 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 border ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'border-slate-300 dark:border-slate-700 text-slate-500'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="leading-snug">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-950/50">
          {result ? (
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all text-center"
            >
              Close & Return to Credentials
            </button>
          ) : (
            <>
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 disabled:opacity-40"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <div className="text-xs text-slate-400">
                {answeredCount} of {questions.length} answered
              </div>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => setConfirmSubmitOpen(true)}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Grading...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Exam</span>
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>

        {/* Submit Confirmation Dialog */}
        {confirmSubmitOpen && (
          <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-100">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Confirm Assessment Submission?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  You have answered {answeredCount} of {questions.length} questions. Your answers will be graded server-side and submitted directly to your mentor.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setConfirmSubmitOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Review Answers
                </button>
                <button
                  onClick={handleSubmitAnswers}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                >
                  Yes, Submit Exam
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
