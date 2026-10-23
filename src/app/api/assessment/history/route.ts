import { NextRequest, NextResponse } from 'next/server';
import { dbGetAssessmentForSubmission } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('submission_id');

    if (!submissionId) {
      return NextResponse.json({ error: 'submission_id parameter is required.' }, { status: 400 });
    }

    const assessment = await dbGetAssessmentForSubmission(submissionId);

    return NextResponse.json({
      submission_id: submissionId,
      assessment,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
