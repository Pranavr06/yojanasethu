import { NextRequest, NextResponse } from 'next/server';
import { dbGetFullStudent, dbGetStudentDsaProgress } from '@/lib/db';
import { validateStudentSession } from '@/lib/serverAuth';
import { analyzeStudentSkillGap } from '@/lib/skillGapEngine';
import { TargetCareerRole } from '@/types';

export const dynamic = 'force-dynamic';

const VALID_ROLES: TargetCareerRole[] = [
  'Software Developer',
  'AI/ML Engineer',
  'Cybersecurity Analyst',
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientSuppliedStudentId = searchParams.get('student_id') || undefined;
    const requestedRole = (searchParams.get('targetRole') || searchParams.get('target_role')) as TargetCareerRole | null;

    const authResult = await validateStudentSession(request, clientSuppliedStudentId);
    if (!authResult.authorized || !authResult.studentId) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized student session' },
        { status: authResult.status || 401 }
      );
    }

    const student = await dbGetFullStudent(authResult.studentId);
    if (!student) {
      return NextResponse.json(
        { error: 'Student record not found for authenticated user.' },
        { status: 404 }
      );
    }

    let targetRole: TargetCareerRole = 'Software Developer';
    if (requestedRole && VALID_ROLES.includes(requestedRole)) {
      targetRole = requestedRole;
    } else if (student.profile?.target_career_role && VALID_ROLES.includes(student.profile.target_career_role as TargetCareerRole)) {
      targetRole = student.profile.target_career_role as TargetCareerRole;
    } else if (student.target_role && VALID_ROLES.includes(student.target_role as TargetCareerRole)) {
      targetRole = student.target_role as TargetCareerRole;
    }

    const dsaRecords = await dbGetStudentDsaProgress(authResult.studentId);
    const analysis = analyzeStudentSkillGap({
      student,
      dsaRecords,
      targetRole,
    });

    return NextResponse.json({
      student_id: authResult.studentId,
      analysis,
    });
  } catch (error: any) {
    console.error('GET /api/student/skill-gap error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error while analyzing skill gap.' },
      { status: 500 }
    );
  }
}
