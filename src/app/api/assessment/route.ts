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
} from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

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

    // Retrieve sanitized client questions (NO answer keys, NO explanations)
    const questions = getSubjectQuestionsForClient(subject);

    let latestAssessment = null;
    if (submissionId) {
      latestAssessment = await dbGetAssessmentForSubmission(submissionId);
    }

    return NextResponse.json({
      subject,
      subject_label: SUBJECT_METADATA[subject].label,
      description: SUBJECT_METADATA[subject].description,
      total_questions: questions.length,
      passing_score_threshold: 60.0,
      questions,
      latest_assessment: latestAssessment,
      notice: 'Practice skill verification assessment. Official endorsement requires faculty mentor review.',
    });
  } catch (error: any) {
    console.error('GET /api/assessment error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/assessment
 * Submits student answers, calculates percentage score on the server,
 * strictly enforces max 2 attempts (initial + 1 mentor retake), and saves to database.
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

    // Resolve authenticated student ID if available
    let resolvedStudentId = student_id;
    if (!resolvedStudentId || !resolvedStudentId.includes('-')) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        resolvedStudentId = user.id;
      } else {
        // Fallback default student profile UUID
        resolvedStudentId = '11111111-1111-1111-1111-111111111111';
      }
    }

    // Server-side scoring and persistence
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
