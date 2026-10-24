import { NextRequest, NextResponse } from 'next/server';
import { dbGetStudentMentor, dbResolveStudentProfileId } from '@/lib/db';
import { validateStudentSession } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientSuppliedStudentId = searchParams.get('student_id') || undefined;

    const authResult = await validateStudentSession(request, clientSuppliedStudentId);
    let effectiveStudentId = authResult.studentId;

    if (!effectiveStudentId) {
      if (clientSuppliedStudentId) {
        effectiveStudentId = (await dbResolveStudentProfileId(clientSuppliedStudentId)) || clientSuppliedStudentId;
      } else {
        effectiveStudentId = 'a0000003-0000-0000-0000-000000000001'; // Default Pranav R
      }
    }

    const mentor = await dbGetStudentMentor(effectiveStudentId);

    return NextResponse.json({
      success: true,
      hasMentor: Boolean(mentor),
      mentor: mentor || null,
    });
  } catch (error: any) {
    console.error('GET /api/student/mentor error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch assigned mentor details' },
      { status: 500 }
    );
  }
}
