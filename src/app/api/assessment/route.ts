import { NextRequest, NextResponse } from 'next/server';
import {
  AssessmentSubject,
  StudentAnswerSubmission,
} from '@/types';
import {
  getSubjectQuestionsForClient,
  SUBJECT_METADATA,
} from '@/lib/assessmentQuestions';
import {
  dbSaveCertificateAssessment,
  dbGetAssessmentForSubmission,
  dbGetSubmissionById,
} from '@/lib/db';
import { validateStudentSession } from '@/lib/serverAuth';

/**
 * GET /api/assessment
 * Retrieves practice assessment questions for a subject without exposing answer keys.
 * Also checks attempt permissions if submission_id is provided.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = (searchParams.get('subject') || 'python') as AssessmentSubject;
    const submissionId = searchParams.get('submission_id');

    if (!SUBJECT_METADATA[subject]) {
      return NextResponse.json(
        { error: `Invalid assessment subject "${subject}". Supported domains: ${Object.keys(SUBJECT_METADATA).join(', ')}` },
        { status: 400 }
      );
    }

    // 1. Sanitize questions: strip correct answers and grading rationales
    const questions = getSubjectQuestionsForClient(subject);

    // 2. If submission_id provided, include prior assessment history if any
    let priorAssessment = null;
    if (submissionId) {
      priorAssessment = await dbGetAssessmentForSubmission(submissionId);
    }

    return NextResponse.json({
      subject,
      metadata: SUBJECT_METADATA[subject],
      totalQuestions: questions.length,
      questions,
      priorAssessment,
      instructions: [
        'Each assessment contains 5 subject-specific questions with a 10-minute timer.',
        'Deterministic automated scoring will evaluate your responses upon submission.',
        'A score of 60% or higher is recommended for faculty mentor verification approval.',
        'Exactly one mentor-authorized retake attempt is granted if needed.',
      ],
    });
  } catch (error: any) {
    console.error('GET /api/assessment error:', error);
    return NextResponse.json({ error: 'Internal server error while loading assessment' }, { status: 500 });
  }
}

/**
 * POST /api/assessment
 * Deterministically grades and persists the student exam attempt.
 * Enforces strict authentication, student identity verification, and submission ownership.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      submission_id,
      student_id,
      subject,
      answers,
    } = body as {
      submission_id: string;
      student_id?: string;
      subject: AssessmentSubject;
      answers: StudentAnswerSubmission[];
    };

    if (!submission_id || !subject) {
      return NextResponse.json(
        { error: 'submission_id and subject are mandatory.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'answers must be an array of question submissions.' },
        { status: 400 }
      );
    }

    // 1. Strict Session Authentication & Identity Enforcement
    const authResult = await validateStudentSession(request, student_id);
    if (!authResult.authorized || !authResult.studentId) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication required to complete assessments.' },
        { status: authResult.status || 401 }
      );
    }

    const resolvedStudentId = authResult.studentId;

    // 2. Submission ownership verification: ensure student owns this submission
    const sub = await dbGetSubmissionById(submission_id);
    if (sub && sub.student_id !== resolvedStudentId) {
      return NextResponse.json(
        { error: 'Forbidden: You cannot take an assessment for a certificate belonging to another student.' },
        { status: 403 }
      );
    }

    // 3. Server-side scoring and persistence
    const result = await dbSaveCertificateAssessment({
      submission_id,
      student_id: resolvedStudentId,
      subject,
      submissions: answers,
    });

    if (!result.success || !result.assessment) {
      return NextResponse.json(
        { error: result.error || 'Failed to evaluate assessment submission.' },
        { status: result.error?.includes('limit reached') ? 403 : 400 }
      );
    }

    return NextResponse.json({
      message: 'Assessment submitted and scored successfully! Routed to Faculty Mentor Review Desk.',
      assessment: result.assessment,
      passing_score_threshold: 60.0,
      meets_recommended_threshold: result.assessment.score_percentage >= 60.0,
    });
  } catch (error: any) {
    console.error('POST /api/assessment error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
