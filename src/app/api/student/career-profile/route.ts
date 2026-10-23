import { NextRequest, NextResponse } from 'next/server';
import { dbGetProfileById, dbUpdateStudentCareerGoal } from '@/lib/db';
import { validateStudentSession } from '@/lib/serverAuth';
import { TargetCareerRole } from '@/types';

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

    const profile = authResult.studentProfile || (await dbGetProfileById(authResult.studentId));

    return NextResponse.json({
      student_id: authResult.studentId,
      target_career_role: profile?.target_career_role || 'Software Developer',
      learning_goals: profile?.learning_goals || [],
      career_interests: profile?.career_interests || [],
    });
  } catch (error: any) {
    console.error('GET /api/student/career-profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error while fetching career profile.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      target_career_role,
      learning_goals,
      career_interests,
      student_id,
    } = body;

    const authResult = await validateStudentSession(request, student_id);
    if (!authResult.authorized || !authResult.studentId) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized student session' },
        { status: authResult.status || 401 }
      );
    }

    const validRoles: TargetCareerRole[] = ['Software Developer', 'AI/ML Engineer', 'Cybersecurity Analyst'];
    if (target_career_role && !validRoles.includes(target_career_role)) {
      return NextResponse.json(
        { error: `Invalid target role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    const ok = await dbUpdateStudentCareerGoal({
      student_id: authResult.studentId,
      target_role: target_career_role || 'Software Developer',
      learning_goals: Array.isArray(learning_goals) ? learning_goals : [],
      career_interests: Array.isArray(career_interests) ? career_interests : [],
    });

    if (!ok) {
      return NextResponse.json(
        { error: 'Failed to update student career goals' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      student_id: authResult.studentId,
      target_career_role: target_career_role || 'Software Developer',
      learning_goals: learning_goals || [],
      career_interests: career_interests || [],
    });
  } catch (error: any) {
    console.error('PATCH /api/student/career-profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error while updating career profile.' },
      { status: 500 }
    );
  }
}
