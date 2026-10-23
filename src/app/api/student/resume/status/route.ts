import { NextRequest, NextResponse } from 'next/server';
import { validateStudentSession } from '@/lib/serverAuth';
import { dbGetStudentUploadedResume, dbResolveStudentProfileId } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentIdParam = searchParams.get('student_id') || searchParams.get('studentId') || searchParams.get('usn');

    let effectiveStudentId: string | null = null;

    if (studentIdParam) {
      effectiveStudentId = (await dbResolveStudentProfileId(studentIdParam)) || studentIdParam;
    } else {
      // Validate session if no query param provided
      const authResult = await validateStudentSession(request);
      effectiveStudentId = authResult.studentId || '11111111-1111-1111-1111-111111111111';
    }

    if (!effectiveStudentId) {
      return NextResponse.json(
        { error: 'Student identifier is required.' },
        { status: 400 }
      );
    }

    const resume = await dbGetStudentUploadedResume(effectiveStudentId);

    if (!resume) {
      return NextResponse.json({
        hasResume: false,
        resume: null,
        message: 'Resume not uploaded',
      });
    }

    return NextResponse.json({
      hasResume: true,
      resume,
    });
  } catch (error: any) {
    console.error('Student resume status error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch resume status.' },
      { status: 500 }
    );
  }
}
