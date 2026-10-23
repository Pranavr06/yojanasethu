import { NextRequest, NextResponse } from 'next/server';
import { dbSubmitAcademicCorrectionRequest } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { student_id, subject_or_semester, claimed_value, official_value, reason } = body;

    if (!student_id || !subject_or_semester || !claimed_value || !reason) {
      return NextResponse.json(
        { error: 'student_id, subject_or_semester, claimed_value, and reason are required.' },
        { status: 400 }
      );
    }

    const created = await dbSubmitAcademicCorrectionRequest({
      student_id,
      subject_or_semester,
      claimed_value,
      official_value: official_value || 'Official ERP record',
      reason,
    });

    if (!created) {
      return NextResponse.json({ error: 'Failed to submit correction request' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Academic correction request submitted to Faculty Mentor desk.',
      request: created,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
