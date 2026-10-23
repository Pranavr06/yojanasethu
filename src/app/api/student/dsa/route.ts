import { NextRequest, NextResponse } from 'next/server';
import { dbGetStudentDsaProgress, dbUpsertStudentDsaProgress } from '@/lib/db';
import { validateStudentSession } from '@/lib/serverAuth';
import { computeDsaPatternMetrics } from '@/lib/skillGapEngine';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientSuppliedStudentId = searchParams.get('student_id') || undefined;

    const authResult = await validateStudentSession(request, clientSuppliedStudentId);
    if (!authResult.authorized || !authResult.studentId) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized student session' },
        { status: authResult.status || 401 }
      );
    }

    const records = await dbGetStudentDsaProgress(authResult.studentId);
    const patternMetrics = computeDsaPatternMetrics(records);

    return NextResponse.json({
      student_id: authResult.studentId,
      records,
      count: records.length,
      patternMetrics,
    });
  } catch (error: any) {
    console.error('GET /api/student/dsa error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error while fetching DSA progress.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      topic_id,
      status = 'solved',
      attempts_count,
      failed_attempts,
      time_spent_minutes,
      notes,
      student_id,
    } = body;

    if (!topic_id) {
      return NextResponse.json(
        { error: 'Missing required field: topic_id' },
        { status: 400 }
      );
    }

    const authResult = await validateStudentSession(request, student_id);
    if (!authResult.authorized || !authResult.studentId) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized student session' },
        { status: authResult.status || 401 }
      );
    }

    const record = await dbUpsertStudentDsaProgress({
      student_id: authResult.studentId,
      topic_id,
      status,
      attempts_count,
      failed_attempts,
      time_spent_minutes,
      notes,
    });

    if (!record) {
      return NextResponse.json(
        { error: 'Failed to record DSA progress' },
        { status: 500 }
      );
    }

    const records = await dbGetStudentDsaProgress(authResult.studentId);
    const patternMetrics = computeDsaPatternMetrics(records);

    return NextResponse.json({
      success: true,
      record,
      patternMetrics,
    });
  } catch (error: any) {
    console.error('POST /api/student/dsa error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error while updating DSA progress.' },
      { status: 500 }
    );
  }
}
