import { NextRequest, NextResponse } from 'next/server';
import { dbVerifySubmission } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      submission_id,
      action,
      approved,
      faculty_comment,
      rejection_reason,
      retake_feedback,
      reviewer_name,
    } = body as {
      submission_id: string;
      action?: 'approve' | 'reject' | 'grant_retake';
      approved?: boolean;
      faculty_comment?: string;
      rejection_reason?: string;
      retake_feedback?: string;
      reviewer_name?: string;
    };

    if (!submission_id) {
      return NextResponse.json({ error: 'submission_id is required.' }, { status: 400 });
    }

    // Determine normalized action (supporting legacy approved boolean)
    const effectiveAction = action || (approved === true ? 'approve' : 'reject');

    // Validation for rejection
    if (effectiveAction === 'reject' && !rejection_reason?.trim() && !faculty_comment?.trim()) {
      return NextResponse.json(
        { error: 'A rejection reason is mandatory when declining certificate verification.' },
        { status: 400 }
      );
    }

    // Validation for retake
    if (effectiveAction === 'grant_retake' && !retake_feedback?.trim() && !faculty_comment?.trim()) {
      return NextResponse.json(
        { error: 'Feedback explaining required skill improvements is mandatory when authorizing a retake.' },
        { status: 400 }
      );
    }

    // Resolve reviewer identity
    let reviewerId = '11111111-2222-3333-4444-555555555555';
    let resolvedReviewerName = reviewer_name || 'Dr. K. Sharma (Faculty Mentor)';

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        reviewerId = user.id;
        if (user.user_metadata?.full_name) {
          resolvedReviewerName = `${user.user_metadata.full_name} (Faculty Mentor)`;
        }
      }
    } catch (e) {
      // Offline fallback
    }

    const result = await dbVerifySubmission({
      submission_id,
      action: effectiveAction,
      approved: effectiveAction === 'approve',
      faculty_comment: faculty_comment || (effectiveAction === 'reject' ? rejection_reason : retake_feedback),
      rejection_reason,
      retake_feedback,
      reviewer_name: resolvedReviewerName,
      reviewer_id: reviewerId,
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error.includes('prohibits a third attempt') ? 403 : 400 }
      );
    }

    let message = 'Decision recorded successfully.';
    if (effectiveAction === 'approve') {
      message = 'Certificate endorsed! Verified badge is now active in student_skill_passport and unlocked for recruiters and Resume Builder.';
    } else if (effectiveAction === 'grant_retake') {
      message = 'One additional assessment attempt authorized for student with guidance feedback.';
    } else {
      message = 'Certificate submission rejected with feedback.';
    }

    return NextResponse.json({
      message,
      action: effectiveAction,
      submission: result.submission,
      passport_skill: result.passportSkill,
      retake_granted: result.retakeGranted,
    });
  } catch (error: any) {
    console.error('POST /api/mentor/verify error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
