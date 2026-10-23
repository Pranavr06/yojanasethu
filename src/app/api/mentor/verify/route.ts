import { NextRequest, NextResponse } from 'next/server';
import { dbVerifySubmission } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { submission_id, approved, faculty_comment, reviewer_name } = body;

    if (!submission_id || typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'submission_id and approved (boolean) are required fields.' },
        { status: 400 }
      );
    }

    const result = await dbVerifySubmission({
      submission_id,
      approved,
      faculty_comment,
      reviewer_name: reviewer_name || 'Dr. K. Sharma (Faculty Mentor)',
    });

    return NextResponse.json({
      message: approved
        ? 'Evidence verified and endorsed! Verification badge is now active in student_skill_passport and unlocked for recruiters.'
        : 'Evidence revision requested.',
      submission: result.submission,
      passport_skill: result.passportSkill,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
